import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { RequirePermissions } from '../auth/permissions/require-permissions.decorator';
import { PermissionEnum } from '../auth/permissions/permissions.enum';

@ApiTags('Gestión de Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  @RequirePermissions(PermissionEnum.CUSTOMER_CREATE)
  @ApiOperation({ summary: 'Crear nuevo cliente (Administrador y Vendedor)' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @RequirePermissions(PermissionEnum.CUSTOMER_READ_ALL, PermissionEnum.CUSTOMER_READ_OWN)
  @ApiOperation({ summary: 'Listar clientes activos' })
  async findAll() {
    return this.customersService.findAll();
  }

  @Get('municipality/:municipality')
  @RequirePermissions(PermissionEnum.CUSTOMER_READ_ALL, PermissionEnum.CUSTOMER_READ_OWN)
  @ApiOperation({ summary: 'Filtrar clientes por municipio o ciudad' })
  async findByMunicipality(@Param('municipality') municipality: string) {
    return this.customersService.findByMunicipality(municipality);
  }

  @Get(':id')
  @RequirePermissions(PermissionEnum.CUSTOMER_READ_ALL, PermissionEnum.CUSTOMER_READ_OWN)
  @ApiOperation({ summary: 'Consultar ficha de cliente e historial reciente de pedidos' })
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PermissionEnum.CUSTOMER_UPDATE)
  @ApiOperation({ summary: 'Actualizar información o coordenadas GPS del cliente' })
  async update(@Param('id') id: string, @Body() updateCustomerDto: any) {
    return this.customersService.update(id, updateCustomerDto);
  }
}
