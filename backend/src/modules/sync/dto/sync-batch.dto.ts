import { IsArray, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOrderDto } from '../../orders/dto/create-order.dto';
import { CreateCustomerDto } from '../../customers/dto/create-customer.dto';

export class SyncBatchDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'UUID de lote de sincronización generado por el cliente' })
  @IsUUID()
  @IsNotEmpty()
  clientSyncId: string;

  @ApiProperty({ type: [CreateCustomerDto], description: 'Clientes creados offline' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerDto)
  customers?: CreateCustomerDto[];

  @ApiProperty({ type: [CreateOrderDto], description: 'Pedidos creados offline' })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  orders?: CreateOrderDto[];
}
