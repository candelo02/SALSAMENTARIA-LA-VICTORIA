import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 'prod-uuid-1234', description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 5, description: 'Cantidad solicitada' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'd3b07384-d113-4602-a5e2-632551d02c7b', description: 'UUID generado en la app móvil (SQLite) para idempotencia' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'cust-uuid-5678', description: 'ID del cliente' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ type: [OrderItemDto], description: 'Lista de ítems y cantidades del pedido' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'CONTADO', description: 'Forma de pago comercial: CONTADO, CREDITO_15, CREDITO_30, TRANSFERENCIA', required: false })
  @IsString()
  @IsOptional()
  paymentTerm?: string;

  @ApiProperty({ example: 'Facturar a crédito 15 días', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: '2026-10-05T19:50:00.000Z', required: false })
  @IsString()
  @IsOptional()
  clientCreatedAt?: string;
}
