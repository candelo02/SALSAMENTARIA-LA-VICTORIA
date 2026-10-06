import { RoleEnum } from '@prisma/client';
import { PermissionEnum } from './permissions.enum';

export const ROLE_PERMISSIONS_MATRIX: Record<RoleEnum, PermissionEnum[]> = {
  [RoleEnum.SUPER_ADMIN]: Object.values(PermissionEnum),

  [RoleEnum.ADMINISTRADOR]: [
    PermissionEnum.USER_CREATE,
    PermissionEnum.USER_READ_ALL,
    PermissionEnum.USER_UPDATE,
    PermissionEnum.USER_DELETE,
    PermissionEnum.PRODUCT_CREATE,
    PermissionEnum.PRODUCT_READ,
    PermissionEnum.PRODUCT_UPDATE,
    PermissionEnum.PRODUCT_DELETE,
    PermissionEnum.CUSTOMER_CREATE,
    PermissionEnum.CUSTOMER_READ_ALL,
    PermissionEnum.CUSTOMER_UPDATE,
    PermissionEnum.ORDER_CREATE,
    PermissionEnum.ORDER_READ_ALL,
    PermissionEnum.ORDER_UPDATE_STATUS,
    PermissionEnum.ORDER_CANCEL,
    PermissionEnum.ROUTE_CREATE,
    PermissionEnum.ROUTE_READ_ALL,
    PermissionEnum.ROUTE_UPDATE_STATUS,
    PermissionEnum.REPORT_READ_ALL,
    PermissionEnum.NOTIFICATION_READ,
  ],

  [RoleEnum.ENCARGADO_VENTAS]: [
    PermissionEnum.CUSTOMER_CREATE,
    PermissionEnum.CUSTOMER_READ_ALL,
    PermissionEnum.CUSTOMER_UPDATE,
    PermissionEnum.ORDER_CREATE,
    PermissionEnum.ORDER_READ_ALL,
    PermissionEnum.ORDER_UPDATE_STATUS,
    PermissionEnum.PRODUCT_READ,
    PermissionEnum.ROUTE_READ_ALL,
    PermissionEnum.REPORT_READ_ALL,
    PermissionEnum.NOTIFICATION_READ,
  ],

  [RoleEnum.VENDEDOR]: [
    PermissionEnum.ORDER_CREATE,
    PermissionEnum.ORDER_READ_OWN,
    PermissionEnum.CUSTOMER_CREATE,
    PermissionEnum.CUSTOMER_READ_ALL,
    PermissionEnum.CUSTOMER_READ_OWN,
    PermissionEnum.PRODUCT_READ,
    PermissionEnum.ROUTE_READ_OWN,
    PermissionEnum.REPORT_READ_OWN,
    PermissionEnum.NOTIFICATION_READ,
  ],

  [RoleEnum.BODEGA]: [
    PermissionEnum.ORDER_READ_ALL,
    PermissionEnum.ORDER_UPDATE_STATUS,
    PermissionEnum.PRODUCT_READ,
    PermissionEnum.PRODUCT_UPDATE,
    PermissionEnum.ROUTE_READ_ALL,
    PermissionEnum.NOTIFICATION_READ,
  ],

  [RoleEnum.LOGISTICA]: [
    PermissionEnum.ROUTE_CREATE,
    PermissionEnum.ROUTE_READ_ALL,
    PermissionEnum.ROUTE_UPDATE_STATUS,
    PermissionEnum.ORDER_READ_ALL,
    PermissionEnum.ORDER_UPDATE_STATUS,
    PermissionEnum.NOTIFICATION_READ,
  ],

  [RoleEnum.ENCARGADO_PRODUCCION]: [
    PermissionEnum.PRODUCT_CREATE,
    PermissionEnum.PRODUCT_READ,
    PermissionEnum.PRODUCT_UPDATE,
    PermissionEnum.ORDER_READ_ALL,
    PermissionEnum.REPORT_READ_ALL,
    PermissionEnum.NOTIFICATION_READ,
  ],

  [RoleEnum.AUXILIAR_CONTABLE]: [
    PermissionEnum.ORDER_READ_ALL,
    PermissionEnum.REPORT_READ_ALL,
    PermissionEnum.CUSTOMER_READ_ALL,
    PermissionEnum.PRODUCT_READ,
    PermissionEnum.NOTIFICATION_READ,
  ],

  [RoleEnum.SUPERVISOR]: [
    PermissionEnum.ORDER_READ_ALL,
    PermissionEnum.ROUTE_READ_ALL,
    PermissionEnum.REPORT_READ_ALL,
    PermissionEnum.CUSTOMER_READ_ALL,
    PermissionEnum.PRODUCT_READ,
    PermissionEnum.NOTIFICATION_READ,
  ],
};

export function hasPermission(role: RoleEnum, permission: PermissionEnum): boolean {
  const userPermissions = ROLE_PERMISSIONS_MATRIX[role] || [];
  return userPermissions.includes(permission);
}
