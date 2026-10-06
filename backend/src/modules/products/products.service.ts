import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatusEnum } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    if (createProductDto.barcode) {
      const existing = await this.prisma.product.findUnique({
        where: { barcode: createProductDto.barcode },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un producto registrado con el código de barras ${createProductDto.barcode}.`);
      }
    }

    let status: ProductStatusEnum = ProductStatusEnum.DISPONIBLE;
    if (createProductDto.stock === 0) {
      status = ProductStatusEnum.AGOTADO;
    } else if (createProductDto.stock <= (createProductDto.minStock || 10)) {
      status = ProductStatusEnum.STOCK_BAJO;
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        status,
      },
      include: { category: true },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    let status = product.status;
    if (updateProductDto.stock !== undefined) {
      const minStock = updateProductDto.minStock ?? product.minStock;
      if (updateProductDto.stock === 0) {
        status = ProductStatusEnum.AGOTADO;
      } else if (updateProductDto.stock <= minStock) {
        status = ProductStatusEnum.STOCK_BAJO;
      } else {
        status = ProductStatusEnum.DISPONIBLE;
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        status,
      },
      include: { category: true },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { barcode, isActive: true },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Producto con código de barras ${barcode} no encontrado.`);
    }

    return product;
  }

  async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async createCategory(name: string, description?: string) {
    return this.prisma.category.create({
      data: { name, description },
    });
  }
}
