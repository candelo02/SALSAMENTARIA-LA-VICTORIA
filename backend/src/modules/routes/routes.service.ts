import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { RouteStatusEnum, OrderStatusEnum } from '@prisma/client';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRouteDto) {
    // Check if code already exists
    const existing = await this.prisma.route.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException(`El código de ruta '${dto.code}' ya existe.`);
    }

    const routeDate = new Date(dto.routeDate);

    // Create route with customer sequence
    const route = await this.prisma.route.create({
      data: {
        code: dto.code,
        vendorId: dto.vendorId,
        routeDate,
        vehicle: dto.vehicle || 'Vehículo General',
        zone: dto.zone,
        customers: {
          create: dto.customerIds.map((customerId, index) => ({
            customerId,
            visitOrder: index + 1,
          })),
        },
      },
      include: {
        vendor: { select: { id: true, fullName: true, email: true } },
        customers: { include: { customer: true } },
      },
    });

    return route;
  }

  async findAll(vendorId?: string) {
    return this.prisma.route.findMany({
      where: vendorId ? { vendorId } : {},
      include: {
        vendor: { select: { id: true, fullName: true } },
        customers: {
          include: { customer: { select: { id: true, name: true, address: true, municipality: true, lat: true, lng: true } } },
          orderBy: { visitOrder: 'asc' },
        },
      },
      orderBy: { routeDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        vendor: { select: { id: true, fullName: true, email: true } },
        customers: {
          include: {
            customer: {
              include: {
                orders: {
                  where: { status: { in: ['CREADO', 'RECIBIDO', 'EN_PREPARACION', 'PREPARADO', 'EN_RUTA'] } },
                  include: { items: { include: { product: true } } },
                },
              },
            },
          },
          orderBy: { visitOrder: 'asc' },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada.`);
    }

    return route;
  }

  async checkRouteStock(routeId: string) {
    const route = await this.findOne(routeId);

    // Collect all orders in this route
    const orders = route.customers.flatMap((rc) => rc.customer.orders);
    
    // Map required product quantities
    const productRequirementsMap = new Map<string, { product: any; requiredQuantity: number }>();

    for (const order of orders) {
      for (const item of order.items) {
        const prodId = item.productId;
        const current = productRequirementsMap.get(prodId) || {
          product: item.product,
          requiredQuantity: 0,
        };
        current.requiredQuantity += item.quantity;
        productRequirementsMap.set(prodId, current);
      }
    }

    const itemsSummary = [];
    let hasShortage = false;

    for (const [prodId, data] of productRequirementsMap.entries()) {
      const availableStock = data.product.stock;
      const required = data.requiredQuantity;
      const isSufficient = availableStock >= required;
      const missing = isSufficient ? 0 : required - availableStock;

      if (!isSufficient) {
        hasShortage = true;
      }

      itemsSummary.push({
        productId: prodId,
        productName: data.product.name,
        presentation: data.product.presentation,
        unitOfMeasure: data.product.unitOfMeasure,
        requiredQuantity: required,
        availableStock,
        missingQuantity: missing,
        status: isSufficient ? 'SUFICIENTE' : 'FALTANTE',
      });
    }

    return {
      routeId: route.id,
      routeCode: route.code,
      zone: route.zone,
      totalOrders: orders.length,
      hasShortage,
      readinessStatus: hasShortage ? 'DESPACHO_PENDIENTE_PRODUCCION' : 'LISTO_PARA_DESPACHO',
      itemsSummary,
    };
  }

  async updateStatus(id: string, status: RouteStatusEnum) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        customers: {
          include: {
            customer: {
              include: { orders: { where: { status: { in: ['PREPARADO', 'EN_PREPARACION', 'RECIBIDO'] } } } },
            },
          },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada.`);
    }

    const updatedRoute = await this.prisma.route.update({
      where: { id },
      data: { status },
      include: {
        vendor: { select: { id: true, fullName: true } },
        customers: { include: { customer: true } },
      },
    });

    // Cascade order status changes based on route status
    if (status === RouteStatusEnum.EN_PROGRESO) {
      const orderIds = route.customers
        .flatMap((rc) => rc.customer.orders)
        .map((o) => o.id);

      if (orderIds.length > 0) {
        await this.prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: { status: OrderStatusEnum.EN_RUTA },
        });
      }
    } else if (status === RouteStatusEnum.COMPLETADA) {
      const orderIds = route.customers
        .flatMap((rc) => rc.customer.orders)
        .map((o) => o.id);

      if (orderIds.length > 0) {
        await this.prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: { status: OrderStatusEnum.ENTREGADO },
        });
      }
    }

    return updatedRoute;
  }
}
