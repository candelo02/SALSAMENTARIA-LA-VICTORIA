import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleEnum, OrderStatusEnum } from '@prisma/client';

@ApiTags('Gestión de Pedidos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Post()
  @Roles(RoleEnum.ADMINISTRADOR, RoleEnum.VENDEDOR)
  @ApiOperation({ summary: 'Crear un nuevo pedido (Vendedor / Administrador)' })
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(createOrderDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar lista de pedidos con filtros opcionales' })
  @ApiQuery({ name: 'status', enum: OrderStatusEnum, required: false })
  @ApiQuery({ name: 'vendorId', type: String, required: false })
  async findAll(
    @Query('status') status?: OrderStatusEnum,
    @Query('vendorId') vendorId?: String,
    @Request() req?: any,
  ) {
    const activeVendorId = req.user.role === RoleEnum.VENDEDOR ? req.user.id : (vendorId as string);
    return this.ordersService.findAll(status, activeVendorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalle completo de un pedido con historial' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generar y descargar remisión / comprobante en formato PDF' })
  async downloadPdf(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const order = await this.ordersService.findOne(id);
    const pdfBuffer = await this.pdfGeneratorService.generateOrderPdf(order);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="remision_pedido_${id.substring(0, 8)}.pdf"`,
    });

    return new StreamableFile(pdfBuffer);
  }

  @Patch(':id/status')
  @Roles(RoleEnum.ADMINISTRADOR, RoleEnum.BODEGA, RoleEnum.VENDEDOR, RoleEnum.LOGISTICA)
  @ApiOperation({ summary: 'Actualizar el estado de un pedido (Bodega / Logística / Admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, req.user.id);
  }
}
