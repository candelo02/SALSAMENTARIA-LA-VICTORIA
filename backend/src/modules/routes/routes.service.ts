import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll(vendorId?: string) {
    return this.prisma.route.findMany({
      where: vendorId ? { vendorId } : {},
      include: {
        vendor: { select: { id: true, fullName: true } },
        customers: {
          include: { customer: { select: { id: true, name: true, address: true, municipality: true } } },
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
}
