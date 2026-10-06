import { Injectable, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RoleEnum } from '@prisma/client';
import { PermissionEnum } from './permissions/permissions.enum';
import { hasPermission } from './permissions/permission-matrix';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    return user;
  }

  async updateUser(id: string, updateData: { fullName?: string; password?: string; role?: RoleEnum }, requestingUser: { id: string; role: RoleEnum }) {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }

    // Anti Privilege Escalation & IDOR Protection:
    // If attempting to change user role, verify requestingUser has USER_MANAGE_ROLES or SUPER_ADMIN
    if (updateData.role && updateData.role !== targetUser.role) {
      const canManageRoles = hasPermission(requestingUser.role, PermissionEnum.USER_MANAGE_ROLES);
      if (!canManageRoles) {
        throw new ForbiddenException('Acceso denegado (Elevación de Privilegios): No tiene autorización para asignar o cambiar roles de usuario.');
      }
    }

    // Normal users can only update their own profile if they don't have USER_UPDATE permission
    const canUpdateAll = hasPermission(requestingUser.role, PermissionEnum.USER_UPDATE);
    if (!canUpdateAll && requestingUser.id !== id) {
      throw new ForbiddenException('Acceso denegado (IDOR): No tiene permisos para modificar el perfil de otro usuario.');
    }

    const dataToUpdate: any = {};
    if (updateData.fullName) dataToUpdate.fullName = updateData.fullName;
    if (updateData.role && hasPermission(requestingUser.role, PermissionEnum.USER_MANAGE_ROLES)) {
      dataToUpdate.role = updateData.role;
    }
    if (updateData.password) {
      dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}
