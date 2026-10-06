import { IsEmail, IsNotEmpty, IsString, IsEnum, MinLength } from 'class-validator';
import { RoleEnum } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'vendedor3@lavictoria.com', description: 'Correo electrónico institucional del nuevo colaborador' })
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  email: string;

  @ApiProperty({ example: 'Victoria2026!', description: 'Contraseña otorgada por el Super Admin (mínimo 6 caracteres)' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @ApiProperty({ example: 'Camilo Vendedor Campo', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  fullName: string;

  @ApiProperty({ enum: RoleEnum, default: RoleEnum.VENDEDOR, description: 'Rol de usuario en el sistema' })
  @IsEnum(RoleEnum, { message: 'El rol especificado no es un rol válido del sistema.' })
  role: RoleEnum;
}
