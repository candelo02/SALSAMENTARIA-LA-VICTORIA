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

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  characteristics?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  presentation?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStock?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  barcode?: string;
}
