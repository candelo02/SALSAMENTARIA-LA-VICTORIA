import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions/permissions.guard';
import { RequirePermissions } from '../auth/permissions/require-permissions.decorator';
import { PermissionEnum } from '../auth/permissions/permissions.enum';

@ApiTags('Catálogo de Productos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @RequirePermissions(PermissionEnum.PRODUCT_CREATE)
  @ApiOperation({ summary: 'Agregar un nuevo producto al catálogo de la fábrica' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Patch(':id')
  @RequirePermissions(PermissionEnum.PRODUCT_UPDATE)
  @ApiOperation({ summary: 'Editar / actualizar descripción, precios o datos del producto' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Get()
  @RequirePermissions(PermissionEnum.PRODUCT_READ)
  @ApiOperation({ summary: 'Obtener todo el catálogo de productos activo de la fábrica' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get('categories')
  @RequirePermissions(PermissionEnum.PRODUCT_READ)
  @ApiOperation({ summary: 'Obtener todas las categorías activas' })
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Post('categories')
  @RequirePermissions(PermissionEnum.PRODUCT_CREATE)
  @ApiOperation({ summary: 'Crear una nueva categoría de productos en el catálogo' })
  async createCategory(@Body() body: { name: string; description?: string }) {
    return this.productsService.createCategory(body.name, body.description);
  }

  @Get('barcode/:code')
  @RequirePermissions(PermissionEnum.PRODUCT_READ)
  @ApiOperation({ summary: 'Buscar producto por código de barras o QR para bodega' })
  async findByBarcode(@Param('code') code: string) {
    return this.productsService.findByBarcode(code);
  }

  @Get(':id')
  @RequirePermissions(PermissionEnum.PRODUCT_READ)
  @ApiOperation({ summary: 'Obtener detalle de un producto por ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
