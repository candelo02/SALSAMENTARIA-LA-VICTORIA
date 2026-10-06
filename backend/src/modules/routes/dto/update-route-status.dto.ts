import { IsEnum, IsNotEmpty } from 'class-validator';
import { RouteStatusEnum } from '@prisma/client';

export class UpdateRouteStatusDto {
  @IsEnum(RouteStatusEnum)
  @IsNotEmpty()
  status: RouteStatusEnum;
}
