import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { CustomersService } from '../customers/customers.service';
import { SyncBatchDto } from './dto/sync-batch.dto';
import { RoleEnum } from '@prisma/client';
import { PermissionEnum } from '../auth/permissions/permissions.enum';
import { hasPermission } from '../auth/permissions/permission-matrix';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private customersService: CustomersService,
  ) {}

  async processSync(syncBatchDto: SyncBatchDto, userId: string) {
    const { clientSyncId, customers = [], orders = [] } = syncBatchDto;

    // Check if sync batch was already processed (Idempotency)
    const existingLog = await this.prisma.syncLog.findUnique({
      where: { clientSyncId },
    });

    if (existingLog) {
      return {
        status: 'ALREADY_PROCESSED',
        clientSyncId,
        message: 'Lote de sincronización previamente procesado por el servidor.',
      };
    }

    const syncedCustomerIds: string[] = [];
    const syncedOrderIds: string[] = [];
    const errors: Array<{ type: 'CUSTOMER' | 'ORDER'; id?: string; error: string }> = [];

    // 1. Process Offline Customers First
    for (const cust of customers) {
      try {
        const created = await this.customersService.create(cust);
        syncedCustomerIds.push(created.id);
      } catch (err: any) {
        this.logger.error(`Error syncing customer ${cust.nitDocument}: ${err.message}`);
        errors.push({ type: 'CUSTOMER', id: cust.nitDocument, error: err.message });
      }
    }

    // 2. Process Offline Orders
    for (const ord of orders) {
      try {
        const createdOrder = await this.ordersService.create(ord, userId);
        syncedOrderIds.push(createdOrder.id);
      } catch (err: any) {
        this.logger.error(`Error syncing order ${ord.id}: ${err.message}`);
        errors.push({ type: 'ORDER', id: ord.id, error: err.message });
      }
    }

    // 3. Log Sync Execution
    await this.prisma.syncLog.create({
      data: {
        clientSyncId,
        userId,
        action: 'BATCH_SYNC',
        status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
        errorMessage: errors.length > 0 ? JSON.stringify(errors) : null,
      },
    });

    return {
      status: 'PROCESSED',
      clientSyncId,
      syncedCustomerIds,
      syncedOrderIds,
      errors,
    };
  }

  async getInitialStateData(requestingUser?: { id: string; role: RoleEnum }) {
    const isVendorOnly = requestingUser && !hasPermission(requestingUser.role, PermissionEnum.ORDER_READ_ALL);

    const [products, categories, customers, routes] = await Promise.all([
      this.prisma.product.findMany({ where: { isActive: true }, include: { category: true } }),
      this.prisma.category.findMany({ where: { isActive: true } }),
      this.prisma.customer.findMany({ where: { isActive: true } }),
      this.prisma.route.findMany({
        where: isVendorOnly ? { vendorId: requestingUser.id } : {},
        include: { customers: { include: { customer: true } } },
      }),
    ]);

    return {
      serverTimestamp: new Date(),
      categories,
      products,
      customers,
      routes,
    };
  }

  async getSyncLogs() {
    return this.prisma.syncLog.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
