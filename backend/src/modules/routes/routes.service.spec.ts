import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { RouteStatusEnum, OrderStatusEnum, RoleEnum, Prisma } from '@prisma/client';

describe('RoutesService', () => {
  let service: RoutesService;
  let prisma: any;

  const mockVendor = {
    id: 'vendor-1',
    fullName: 'Carlos Conductor',
    email: 'carlos@lavictoria.com',
    role: RoleEnum.VENDEDOR,
  };

  const mockAdmin = {
    id: 'admin-1',
    fullName: 'Admin Super',
    email: 'admin@lavictoria.com',
    role: RoleEnum.ADMINISTRADOR,
  };

  const mockCustomer = {
    id: 'cust-1',
    name: 'Restaurante El Pacífico',
    address: 'Calle 5 # 10-20',
    municipality: 'Tumaco',
    lat: 1.8015,
    lng: -78.7621,
    orders: [
      {
        id: 'ord-1',
        status: OrderStatusEnum.RECIBIDO,
        items: [
          {
            productId: 'prod-1',
            quantity: 10,
            product: {
              id: 'prod-1',
              name: 'Salsa de Tomate 500g',
              presentation: 'Doypack 500g',
              unitOfMeasure: 'Unidad',
              stock: 50,
            },
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      route: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      order: {
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
  });

  it('should create a route successfully with sequenced customer stops', async () => {
    prisma.route.findUnique.mockResolvedValue(null);

    const mockCreatedRoute = {
      id: 'route-1',
      code: 'RUT-TUMACO-01',
      vendorId: mockVendor.id,
      routeDate: new Date(),
      vehicle: 'Furgón Isuzu NPR',
      zone: 'Tumaco Centro',
      status: RouteStatusEnum.PLANIFICADA,
      vendor: mockVendor,
      customers: [{ customerId: 'cust-1', visitOrder: 1, customer: mockCustomer }],
    };

    prisma.route.create.mockResolvedValue(mockCreatedRoute);

    const dto = {
      code: 'RUT-TUMACO-01',
      vendorId: mockVendor.id,
      routeDate: '2026-10-10',
      vehicle: 'Furgón Isuzu NPR',
      zone: 'Tumaco Centro',
      customerIds: ['cust-1'],
    };

    const result = await service.create(dto);
    expect(result.code).toBe('RUT-TUMACO-01');
    expect(result.status).toBe(RouteStatusEnum.PLANIFICADA);
  });

  it('should throw BadRequestException if route code already exists', async () => {
    prisma.route.findUnique.mockResolvedValue({ id: 'existing-id', code: 'RUT-01' });

    const dto = {
      code: 'RUT-01',
      vendorId: mockVendor.id,
      routeDate: '2026-10-10',
      zone: 'Tumaco',
      customerIds: ['cust-1'],
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should check route stock and report LISTO_PARA_DESPACHO when stock is sufficient', async () => {
    const mockRoute = {
      id: 'route-1',
      code: 'RUT-01',
      vendorId: mockVendor.id,
      zone: 'Tumaco',
      customers: [{ customer: mockCustomer }],
    };

    prisma.route.findUnique.mockResolvedValue(mockRoute);

    const stockResult = await service.checkRouteStock('route-1', mockAdmin);
    expect(stockResult.readinessStatus).toBe('LISTO_PARA_DESPACHO');
    expect(stockResult.hasShortage).toBe(false);
    expect(stockResult.itemsSummary[0].requiredQuantity).toBe(10);
    expect(stockResult.itemsSummary[0].availableStock).toBe(50);
  });

  it('should update route status and cascade status to order records when dispatched', async () => {
    const mockRoute = {
      id: 'route-1',
      vendorId: mockVendor.id,
      customers: [{ customer: mockCustomer }],
    };

    prisma.route.findUnique.mockResolvedValue(mockRoute);
    prisma.route.update.mockResolvedValue({ ...mockRoute, status: RouteStatusEnum.EN_PROGRESO });

    const updated = await service.updateStatus('route-1', RouteStatusEnum.EN_PROGRESO, mockVendor);
    expect(updated.status).toBe(RouteStatusEnum.EN_PROGRESO);
    expect(prisma.order.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['ord-1'] } },
      data: { status: OrderStatusEnum.EN_RUTA },
    });
  });
});
