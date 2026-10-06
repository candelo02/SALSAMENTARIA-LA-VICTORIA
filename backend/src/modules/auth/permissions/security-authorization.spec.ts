import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoleEnum, OrderStatusEnum } from '@prisma/client';
import { PermissionEnum } from './permissions.enum';
import { hasPermission, ROLE_PERMISSIONS_MATRIX } from './permission-matrix';
import { OrdersService } from '../../orders/orders.service';
import { AuthService } from '../auth.service';

describe('Security & Authorization Suite (RBAC, IDOR & Privilege Escalation)', () => {
  describe('1. Role-Based Permissions Matrix (RBAC)', () => {
    it('SUPER_ADMIN should have absolute access with all permissions', () => {
      const allPermissions = Object.values(PermissionEnum);
      const superAdminPermissions = ROLE_PERMISSIONS_MATRIX[RoleEnum.SUPER_ADMIN];
      expect(superAdminPermissions).toEqual(expect.arrayContaining(allPermissions));
      expect(hasPermission(RoleEnum.SUPER_ADMIN, PermissionEnum.USER_MANAGE_ROLES)).toBe(true);
    });

    it('VENDEDOR should only have own permissions and cannot perform administrative user/role management', () => {
      expect(hasPermission(RoleEnum.VENDEDOR, PermissionEnum.ORDER_READ_OWN)).toBe(true);
      expect(hasPermission(RoleEnum.VENDEDOR, PermissionEnum.ORDER_READ_ALL)).toBe(false);
      expect(hasPermission(RoleEnum.VENDEDOR, PermissionEnum.USER_CREATE)).toBe(false);
      expect(hasPermission(RoleEnum.VENDEDOR, PermissionEnum.USER_MANAGE_ROLES)).toBe(false);
    });

    it('BODEGA should have ORDER_READ_ALL and ORDER_UPDATE_STATUS but not USER_CREATE', () => {
      expect(hasPermission(RoleEnum.BODEGA, PermissionEnum.ORDER_READ_ALL)).toBe(true);
      expect(hasPermission(RoleEnum.BODEGA, PermissionEnum.ORDER_UPDATE_STATUS)).toBe(true);
      expect(hasPermission(RoleEnum.BODEGA, PermissionEnum.USER_CREATE)).toBe(false);
    });

    it('LOGISTICA should have ROUTE_CREATE, ROUTE_READ_ALL, and ROUTE_UPDATE_STATUS', () => {
      expect(hasPermission(RoleEnum.LOGISTICA, PermissionEnum.ROUTE_CREATE)).toBe(true);
      expect(hasPermission(RoleEnum.LOGISTICA, PermissionEnum.ROUTE_READ_ALL)).toBe(true);
      expect(hasPermission(RoleEnum.LOGISTICA, PermissionEnum.ROUTE_UPDATE_STATUS)).toBe(true);
    });
  });

  describe('2. Resource Ownership & Anti-IDOR (OrdersService)', () => {
    let ordersService: OrdersService;
    let mockPrismaService: any;
    let mockNotificationsService: any;

    beforeEach(() => {
      mockPrismaService = {
        order: {
          findUnique: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
        },
      };
      mockNotificationsService = {
        notifyOrderStatusChangeToVendor: jest.fn(),
      };
      ordersService = new OrdersService(mockPrismaService, mockNotificationsService);
    });

    it('Vendor A SHOULD be allowed to read their OWN order', async () => {
      const mockOrder = {
        id: 'order-123',
        vendorId: 'vendor-A-id',
        status: OrderStatusEnum.RECIBIDO,
        customer: { name: 'Cliente A' },
        items: [],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const requestingUser = { id: 'vendor-A-id', role: RoleEnum.VENDEDOR };
      const order = await ordersService.findOne('order-123', requestingUser);

      expect(order).toBeDefined();
      expect(order.id).toBe('order-123');
    });

    it('Vendor A MUST BE BLOCKED (HTTP 403 Forbidden) when attempting to access Vendor B order (IDOR Prevention)', async () => {
      const mockOrder = {
        id: 'order-999',
        vendorId: 'vendor-B-id', // Belongs to Vendor B!
        status: OrderStatusEnum.RECIBIDO,
        customer: { name: 'Cliente B' },
        items: [],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const requestingUser = { id: 'vendor-A-id', role: RoleEnum.VENDEDOR }; // Vendor A trying IDOR attack!

      await expect(ordersService.findOne('order-999', requestingUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Admin or Bodega SHOULD be allowed to access any order due to ORDER_READ_ALL permission', async () => {
      const mockOrder = {
        id: 'order-999',
        vendorId: 'vendor-B-id',
        status: OrderStatusEnum.RECIBIDO,
        customer: { name: 'Cliente B' },
        items: [],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const adminUser = { id: 'admin-id', role: RoleEnum.ADMINISTRADOR };
      const order = await ordersService.findOne('order-999', adminUser);

      expect(order).toBeDefined();
      expect(order.id).toBe('order-999');
    });
  });

  describe('3. Anti Privilege Escalation (AuthService)', () => {
    let authService: AuthService;
    let mockPrismaService: any;
    let mockJwtService: any;

    beforeEach(() => {
      mockPrismaService = {
        user: {
          findUnique: jest.fn(),
          update: jest.fn(),
          create: jest.fn(),
        },
      };
      mockJwtService = {};
      authService = new AuthService(mockPrismaService, mockJwtService);
    });

    it('Regular VENDEDOR MUST BE BLOCKED when trying to escalate their role to SUPER_ADMIN', async () => {
      const mockUser = {
        id: 'vendedor-id',
        email: 'vendedor@lavictoria.com',
        role: RoleEnum.VENDEDOR,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const requestingUser = { id: 'vendedor-id', role: RoleEnum.VENDEDOR };

      // Attempting to pass role: SUPER_ADMIN in update payload!
      await expect(
        authService.updateUser('vendedor-id', { role: RoleEnum.SUPER_ADMIN }, requestingUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('SUPER_ADMIN SHOULD be allowed to update user roles', async () => {
      const mockTargetUser = {
        id: 'user-to-promote',
        email: 'user@lavictoria.com',
        role: RoleEnum.VENDEDOR,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockTargetUser);
      mockPrismaService.user.update.mockResolvedValue({
        id: 'user-to-promote',
        role: RoleEnum.ADMINISTRADOR,
      });

      const superAdmin = { id: 'super-admin-id', role: RoleEnum.SUPER_ADMIN };

      const updated = await authService.updateUser(
        'user-to-promote',
        { role: RoleEnum.ADMINISTRADOR },
        superAdmin,
      );

      expect(updated).toBeDefined();
      expect(updated.role).toBe(RoleEnum.ADMINISTRADOR);
    });

    it('SUPER_ADMIN SHOULD be allowed to create and provision new users with assigned credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'vendedor3@lavictoria.com',
        fullName: 'Camilo Vendedor Campo',
        role: RoleEnum.VENDEDOR,
        isActive: true,
      });

      const superAdmin = { id: 'super-admin-id', role: RoleEnum.SUPER_ADMIN };
      const created = await authService.createUser(
        {
          email: 'vendedor3@lavictoria.com',
          password: 'Victoria2026!',
          fullName: 'Camilo Vendedor Campo',
          role: RoleEnum.VENDEDOR,
        },
        superAdmin,
      );

      expect(created).toBeDefined();
      expect(created.email).toBe('vendedor3@lavictoria.com');
      expect(created.role).toBe(RoleEnum.VENDEDOR);
    });
  });
});
