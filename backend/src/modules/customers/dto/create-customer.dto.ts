import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Restaurante Don Pedro', description: 'Nombre comercial del cliente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '900555444-2', description: 'Documento de identidad o NIT' })
  @IsString()
  @IsNotEmpty()
  nitDocument: string;

  @ApiProperty({ example: '3001234567', description: 'Teléfono de contacto' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Calle 10 # 5-15', description: 'Dirección física de entrega' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Tumaco', description: 'Municipio o ciudad' })
  @IsString()
  @IsNotEmpty()
  municipality: string;

  @ApiProperty({ example: 'Barrio Miramar', required: false })
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiProperty({ example: 'Pedro Gómez', required: false })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ example: 'Restaurante', required: false })
  @IsString()
  @IsOptional()
  customerType?: string;

  @ApiProperty({ example: 1.8015, required: false })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiProperty({ example: -78.7621, required: false })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiProperty({ example: 'Recibir pedidos antes de las 12pm', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
