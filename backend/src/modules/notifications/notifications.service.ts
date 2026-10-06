import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleEnum } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async createNotification(params: {
    userId?: string;
    roleTarget?: RoleEnum;
    title: string;
    body: string;
    type: 'NEW_ORDER' | 'ORDER_STATUS_CHANGE' | 'LOW_STOCK';
  }) {
    this.logger.log(`[PUSH NOTIFICATION ALERT] ${params.title}: ${params.body}`);

    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        roleTarget: params.roleTarget,
        title: params.title,
        body: params.body,
        type: params.type,
      },
    });
  }

  async notifyNewOrderToBodega(orderNumber: number | string, customerName: string, totalAmount: string | number) {
    return this.createNotification({
      roleTarget: RoleEnum.BODEGA,
      title: '📦 ¡Nuevo Pedido Recibido en Bodega!',
      body: `Pedido #${orderNumber} registrado para ${customerName} por \$${totalAmount} COP. Listo para alistamiento.`,
      type: 'NEW_ORDER',
    });
  }

  async notifyOrderStatusChangeToVendor(vendorId: string, orderNumber: number | string, newStatus: string) {
    return this.createNotification({
      userId: vendorId,
      title: '🚚 Cambio de Estado de Pedido',
      body: `Tu pedido #${orderNumber} ha cambiado al estado: ${newStatus}.`,
      type: 'ORDER_STATUS_CHANGE',
    });
  }

  async notifyLowStockToAdmin(productName: string, currentStock: number) {
    return this.createNotification({
      roleTarget: RoleEnum.ADMINISTRADOR,
      title: '⚠️ Alerta de Inventario Bajo',
      body: `El producto "${productName}" ha alcanzado el nivel crítico de stock (${currentStock} unidades restantes).`,
      type: 'LOW_STOCK',
    });
  }

  async getUserNotifications(userId: string, role: RoleEnum) {
    return this.prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { roleTarget: role },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string, role: RoleEnum) {
    return this.prisma.notification.updateMany({
      where: {
        OR: [
          { userId },
          { roleTarget: role },
        ],
        read: false,
      },
      data: { read: true },
    });
  }
}
