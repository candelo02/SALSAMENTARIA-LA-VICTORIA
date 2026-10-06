import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PdfGeneratorService],
  exports: [OrdersService, PdfGeneratorService],
})
export class OrdersModule {}
