import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleEnum } from '@prisma/client';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteStatusDto } from './dto/update-route-status.dto';

@ApiTags('Gestión de Rutas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear y programar nueva ruta de distribución' })
  async create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar rutas asignadas' })
  @ApiQuery({ name: 'vendorId', type: String, required: false })
  async findAll(@Query('vendorId') vendorId?: string, @Request() req?: any) {
    const activeVendorId = req.user?.role === RoleEnum.VENDEDOR ? req.user.id : vendorId;
    return this.routesService.findAll(activeVendorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de ruta con clientes y pedidos asignados' })
  async findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }

  @Get(':id/stock-check')
  @ApiOperation({ summary: 'Verificar inventario requerido de la ruta vs stock de bodega' })
  async checkRouteStock(@Param('id') id: string) {
    return this.routesService.checkRouteStock(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de la ruta (PLANIFICADA, EN_PROGRESO, COMPLETADA, CANCELADA)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateRouteStatusDto) {
    return this.routesService.updateStatus(id, dto.status);
  }
}
