import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Salsa Tártara Gourmet 500ml', description: 'Nombre comercial del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Salsa tártara suave con trozos de pepinillos y especias finas.', description: 'Descripción comercial del producto' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Fórmula especial para pescados, mariscos y sándwiches.', required: false })
  @IsString()
  @IsOptional()
  characteristics?: string;

  @ApiProperty({ example: 'Frasco PET 500 ml', description: 'Presentación física' })
  @IsString()
  @IsNotEmpty()
  presentation: string;

  @ApiProperty({ example: 'Unidad', default: 'Unidad' })
  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @ApiProperty({ example: 9800.00, description: 'Precio unitario en COP' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, description: 'Stock inicial en bodega' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 15, default: 10 })
  @IsNumber()
  @IsOptional()
  minStock?: number;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=600&q=80', required: false, description: 'URL de la fotografía del producto' })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiProperty({ example: '7701234567891', required: false, description: 'Código de barras EAN-13 o QR' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'cat-uuid-1234', description: 'ID de la categoría' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
