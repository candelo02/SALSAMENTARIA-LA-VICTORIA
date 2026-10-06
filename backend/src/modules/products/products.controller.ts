import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Catálogo de Productos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todo el catálogo de productos activo' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Obtener todas las categorías activas' })
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('barcode/:code')
  @ApiOperation({ summary: 'Buscar producto por código de barras o QR para bodega' })
  async findByBarcode(@Param('code') code: string) {
    return this.productsService.findByBarcode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un producto por ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
