import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { RequirePermissions } from '../auth/permissions/require-permissions.decorator';
import { PermissionEnum } from '../auth/permissions/permissions.enum';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteStatusDto } from './dto/update-route-status.dto';

@ApiTags('Gestión de Rutas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Post()
  @RequirePermissions(PermissionEnum.ROUTE_CREATE)
  @ApiOperation({ summary: 'Crear y programar nueva ruta de distribución' })
  async create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Consultar rutas asignadas con aislamiento por rol y propietario' })
  @ApiQuery({ name: 'vendorId', type: String, required: false })
  async findAll(@Query('vendorId') vendorId?: string, @Request() req?: any) {
    return this.routesService.findAll(vendorId, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de ruta con verificación de propiedad / IDOR' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.routesService.findOne(id, req.user);
  }

  @Get(':id/stock-check')
  @ApiOperation({ summary: 'Verificar inventario requerido de la ruta vs stock de bodega' })
  async checkRouteStock(@Param('id') id: string, @Request() req: any) {
    return this.routesService.checkRouteStock(id, req.user);
  }

  @Patch(':id/status')
  @RequirePermissions(PermissionEnum.ROUTE_UPDATE_STATUS)
  @ApiOperation({ summary: 'Actualizar estado de la ruta (PLANIFICADA, EN_PROGRESO, COMPLETADA, CANCELADA)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateRouteStatusDto, @Request() req: any) {
    return this.routesService.updateStatus(id, dto.status, req.user);
  }
}
