import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsGuard } from './permissions/permissions.guard';
import { RequirePermissions } from './permissions/require-permissions.decorator';
import { PermissionEnum } from './permissions/permissions.enum';
import { RoleEnum } from '@prisma/client';

@ApiTags('Gestión de Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private authService: AuthService) {}

  @Post()
  @RequirePermissions(PermissionEnum.USER_CREATE)
  @ApiOperation({ summary: 'Otorgar y crear un nuevo usuario con credenciales asignadas por el Super Admin' })
  async createUser(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    return this.authService.createUser(createUserDto, req.user);
  }

  @Get()
  @RequirePermissions(PermissionEnum.USER_READ_ALL)
  @ApiOperation({ summary: 'Listar todos los usuarios del sistema' })
  async findAll() {
    return this.authService.findAllUsers();
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  async getProfile(@Request() req: any) {
    return this.authService.findUserById(req.user.id);
  }

  @Get(':id')
  @RequirePermissions(PermissionEnum.USER_READ_ALL)
  @ApiOperation({ summary: 'Consultar usuario por ID' })
  async findOne(@Param('id') id: string) {
    return this.authService.findUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar perfil o rol de usuario (Con protección contra elevación de privilegios)' })
  async updateUser(
    @Param('id') id: string,
    @Body() body: { fullName?: string; password?: string; role?: RoleEnum },
    @Request() req: any,
  ) {
    return this.authService.updateUser(id, body, req.user);
  }
}
