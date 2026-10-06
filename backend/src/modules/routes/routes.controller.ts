import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleEnum } from '@prisma/client';

@ApiTags('Gestión de Rutas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar rutas asignadas' })
  @ApiQuery({ name: 'vendorId', type: String, required: false })
  async findAll(@Query('vendorId') vendorId?: string, @Request() req?: any) {
    const activeVendorId = req.user.role === RoleEnum.VENDEDOR ? req.user.id : vendorId;
    return this.routesService.findAll(activeVendorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de ruta con clientes y verificación de inventario requerida' })
  async findOne(@Param('id') id: string) {
    return this.routesService.findOne(id);
  }
}
