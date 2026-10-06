import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatusEnum, ProductStatusEnum, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, vendorId: string) {
    const { id: customId, customerId, items, notes, clientCreatedAt } = createOrderDto;

    // 1. Idempotency Check: if customId is provided and already exists, return existing order
    if (customId) {
      const existingOrder = await this.prisma.order.findUnique({
        where: { id: customId },
        include: { items: { include: { product: true } }, customer: true },
      });
      if (existingOrder) {
        return existingOrder;
      }
    }

    // 2. Validate Customer
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${customerId} no existe.`);
    }

    if (!items || items.length === 0) {
      throw new BadRequestException('El pedido debe incluir al menos un producto.');
    }

    // 3. Process Transaction: Calculate totals, verify stock, freeze unit prices, update inventory
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = new Prisma.Decimal(0);
      const itemsToCreate = [];
      let isStockDeficient = false;

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new BadRequestException(`El producto con ID ${item.productId} no está disponible.`);
        }

        const unitPrice = product.price;
        const itemSubtotal = unitPrice.mul(item.quantity);
        totalAmount = totalAmount.add(itemSubtotal);

        // Check inventory stock
        if (product.stock < item.quantity) {
          isStockDeficient = true;
        }

        itemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: unitPrice,
          subtotal: itemSubtotal,
          currentStock: product.stock,
        });
      }

      // Initial status determination
      const initialStatus = isStockDeficient ? OrderStatusEnum.PENDIENTE_DE_STOCK : OrderStatusEnum.RECIBIDO;

      // Create Order
      const order = await tx.order.create({
        data: {
          id: customId || undefined,
          customerId,
          vendorId,
          status: initialStatus,
          totalAmount,
          notes,
          clientCreatedAt: clientCreatedAt ? new Date(clientCreatedAt) : new Date(),
          items: {
            create: itemsToCreate.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: i.subtotal,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
          vendor: { select: { id: true, fullName: true, email: true } },
        },
      });

      // Deduct inventory stock if stock is sufficient
      if (!isStockDeficient) {
        for (const i of itemsToCreate) {
          const newStock = i.currentStock - i.quantity;
          let newStatus: ProductStatusEnum = ProductStatusEnum.DISPONIBLE;
          if (newStock === 0) {
            newStatus = ProductStatusEnum.AGOTADO;
          } else if (newStock <= 10) { // Default min stock boundary
            newStatus = ProductStatusEnum.STOCK_BAJO;
          }

          await tx.product.update({
            where: { id: i.productId },
            data: {
              stock: newStock,
              status: newStatus,
            },
          });
        }
      }

      // Log Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: null,
          newStatus: initialStatus,
          changedById: vendorId,
          notes: isStockDeficient
            ? 'Pedido creado con estado PENDIENTE_DE_STOCK por insuficiencia de inventario.'
            : 'Pedido creado y recibido en bodega con stock reservado.',
        },
      });

      return order;
    });
  }

  async findAll(status?: OrderStatusEnum, vendorId?: string) {
    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    return this.prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, nitDocument: true, municipality: true } },
        vendor: { select: { id: true, fullName: true } },
        items: { include: { product: { select: { id: true, name: true, presentation: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        vendor: { select: { id: true, fullName: true, email: true } },
        items: { include: { product: true } },
        statusHistory: {
          include: { changedBy: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado.`);
    }

    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado.`);
    }

    const previousStatus = order.status;
    const newStatus = updateOrderStatusDto.status;

    if (previousStatus === newStatus) {
      return order;
    }

    return this.prisma.$transaction(async (tx) => {
      // If cancelling order, restore inventory
      if (newStatus === OrderStatusEnum.CANCELADO && previousStatus !== OrderStatusEnum.PENDIENTE_DE_STOCK) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              status: ProductStatusEnum.DISPONIBLE,
            },
          });
        }
      }

      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: newStatus },
        include: {
          customer: true,
          vendor: { select: { id: true, fullName: true } },
          items: { include: { product: true } },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          previousStatus,
          newStatus,
          changedById: userId,
          notes: updateOrderStatusDto.notes || `Estado actualizado a ${newStatus}`,
        },
      });

      return updatedOrder;
    });
  }
}
