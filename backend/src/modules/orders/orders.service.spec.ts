import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrderStatusEnum, RoleEnum, ProductStatusEnum, Prisma } from '@prisma/client';

describe('OrdersService & PdfGeneratorService', () => {
  let ordersService: OrdersService;
  let pdfGeneratorService: PdfGeneratorService;
  let prismaService: any;
  let notificationsService: any;

  const mockVendor = {
    id: 'vendor-uuid-1',
    fullName: 'Vendedor Juan',
    email: 'juan@lavictoria.com',
    role: RoleEnum.VENDEDOR,
  };

  const mockAdmin = {
    id: 'admin-uuid-1',
    fullName: 'Admin Super',
    email: 'admin@lavictoria.com',
    role: RoleEnum.ADMINISTRADOR,
  };

  const mockCustomer = {
    id: 'cust-1',
    name: 'Tienda La Esquina',
    nitDocument: '900111222-1',
    phone: '3150000000',
    address: 'Calle 5 # 10-20',
    municipality: 'Tumaco',
  };

  const mockProduct = {
    id: 'prod-1',
    name: 'Salsa de Tomate 500g',
    presentation: 'Doypack 500g',
    price: new Prisma.Decimal(4500),
    stock: 50,
    isActive: true,
  };

  beforeEach(async () => {
    prismaService = {
      order: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      customer: {
        findUnique: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      orderStatusHistory: {
        create: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prismaService)),
    };

    notificationsService = {
      notifyNewOrderToBodega: jest.fn(),
      notifyOrderStatusChangeToVendor: jest.fn(),
      notifyLowStockToAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        PdfGeneratorService,
        { provide: PrismaService, useValue: prismaService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    pdfGeneratorService = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  it('should create an order successfully with custom payment terms', async () => {
    prismaService.customer.findUnique.mockResolvedValue(mockCustomer);
    prismaService.product.findUnique.mockResolvedValue(mockProduct);

    const createdMockOrder = {
      id: 'order-1',
      orderNumber: 1001,
      customerId: mockCustomer.id,
      vendorId: mockVendor.id,
      status: OrderStatusEnum.RECIBIDO,
      paymentTerm: 'CREDITO_15',
      totalAmount: new Prisma.Decimal(9000),
      notes: 'Despacho urgente',
      customer: mockCustomer,
      vendor: mockVendor,
      items: [
        {
          id: 'item-1',
          productId: mockProduct.id,
          quantity: 2,
          unitPrice: mockProduct.price,
          subtotal: new Prisma.Decimal(9000),
          product: mockProduct,
        },
      ],
      createdAt: new Date(),
    };

    prismaService.order.create.mockResolvedValue(createdMockOrder);

    const dto = {
      customerId: 'cust-1',
      paymentTerm: 'CREDITO_15',
      notes: 'Despacho urgente',
      items: [{ productId: 'prod-1', quantity: 2 }],
    };

    const result = await ordersService.create(dto, mockVendor.id);

    expect(result.paymentTerm).toBe('CREDITO_15');
    expect(result.status).toBe(OrderStatusEnum.RECIBIDO);
    expect(notificationsService.notifyNewOrderToBodega).toHaveBeenCalled();
  });

  it('should generate a valid PDF buffer for remision de despacho', async () => {
    const mockOrder = {
      id: 'order-123',
      orderNumber: 1050,
      status: OrderStatusEnum.EN_PREPARACION,
      paymentTerm: 'CONTADO',
      createdAt: new Date(),
      customer: mockCustomer,
      vendor: mockVendor,
      items: [
        {
          product: mockProduct,
          quantity: 5,
          unitPrice: 4500,
          subtotal: 22500,
        },
      ],
      notes: 'Remisión de prueba',
    };

    const pdfBuffer = await pdfGeneratorService.generateOrderPdf(mockOrder);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.toString('utf8', 0, 4)).toBe('%PDF');
  });

  it('should enforce IDOR ownership protection on order retrieval', async () => {
    const otherVendorOrder = {
      id: 'order-999',
      vendorId: 'other-vendor-id',
      customer: mockCustomer,
    };
    prismaService.order.findUnique.mockResolvedValue(otherVendorOrder);

    await expect(ordersService.findOne('order-999', mockVendor)).rejects.toThrow(ForbiddenException);
    
    // Admin should be able to read any order
    const adminResult = await ordersService.findOne('order-999', mockAdmin);
    expect(adminResult.id).toBe('order-999');
  });
});
