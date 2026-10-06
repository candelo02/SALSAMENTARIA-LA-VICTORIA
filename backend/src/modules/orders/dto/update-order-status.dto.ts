import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatusEnum } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatusEnum, example: OrderStatusEnum.RECIBIDO, description: 'Nuevo estado del pedido' })
  @IsEnum(OrderStatusEnum)
  @IsNotEmpty()
  status: OrderStatusEnum;

  @ApiProperty({ example: 'Mercancía alistada en la mesa 3 de bodega.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
