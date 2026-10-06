import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SyncModule } from './modules/sync/sync.module';
import { RoutesModule } from './modules/routes/routes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    NotificationsModule,
    AuthModule,
    ProductsModule,
    CustomersModule,
    OrdersModule,
    SyncModule,
    RoutesModule,
    ReportsModule,
  ],
})
export class AppModule {}
