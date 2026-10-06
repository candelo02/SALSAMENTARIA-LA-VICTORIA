import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { RequirePermissions } from '../auth/permissions/require-permissions.decorator';
import { PermissionEnum } from '../auth/permissions/permissions.enum';
import { OrderStatusEnum } from '@prisma/client';

@ApiTags('Gestión de Pedidos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private pdfGeneratorService: PdfGeneratorService,
  ) {}

  @Post()
  @RequirePermissions(PermissionEnum.ORDER_CREATE)
  @ApiOperation({ summary: 'Crear un nuevo pedido (Vendedor / Administrador)' })
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(createOrderDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar lista de pedidos con aislamiento por rol y propietario' })
  @ApiQuery({ name: 'status', enum: OrderStatusEnum, required: false })
  @ApiQuery({ name: 'vendorId', type: String, required: false })
  async findAll(
    @Query('status') status?: OrderStatusEnum,
    @Query('vendorId') vendorId?: string,
    @Request() req?: any,
  ) {
    return this.ordersService.findAll(status, vendorId, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalle completo de un pedido con verificación de propiedad / IDOR' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.findOne(id, req.user);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generar y descargar remisión PDF con verificación de propiedad / IDOR' })
  async downloadPdf(@Param('id') id: string, @Request() req: any, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const order = await this.ordersService.findOne(id, req.user);
    const pdfBuffer = await this.pdfGeneratorService.generateOrderPdf(order);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="remision_pedido_${id.substring(0, 8)}.pdf"`,
    });

    return new StreamableFile(pdfBuffer);
  }

  @Patch(':id/status')
  @RequirePermissions(PermissionEnum.ORDER_UPDATE_STATUS)
  @ApiOperation({ summary: 'Actualizar el estado de un pedido (Bodega / Logística / Admin / Vendedor Propietario)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, req.user);
  }
}
