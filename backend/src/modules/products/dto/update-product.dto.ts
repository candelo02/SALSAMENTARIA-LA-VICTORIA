import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ example: 'Salsa Tártara Gourmet 500ml', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Nueva descripción actualizada desde la aplicación.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Características físicas y gastronómicas', required: false })
  @IsString()
  @IsOptional()
  characteristics?: string;

  @ApiProperty({ example: 'Frasco PET 500 ml', required: false })
  @IsString()
  @IsOptional()
  presentation?: string;

  @ApiProperty({ example: 'Unidad', required: false })
  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @ApiProperty({ example: 12500.00, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 150, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: 20, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStock?: number;

  @ApiProperty({ example: '7701234567899', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=600&q=80', required: false })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiProperty({ example: 'cat-uuid-1234', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;
}
