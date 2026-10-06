import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsDateString()
  @IsNotEmpty()
  routeDate: string;

  @IsString()
  @IsOptional()
  vehicle?: string;

  @IsString()
  @IsNotEmpty()
  zone: string;

  @IsArray()
  @IsNotEmpty()
  customerIds: string[];
}
