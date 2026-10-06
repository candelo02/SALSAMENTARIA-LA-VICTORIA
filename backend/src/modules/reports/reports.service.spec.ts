import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatusEnum, ProductStatusEnum, Prisma } from '@prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: any;

  const mockCustomer = {
    id: 'cust-1',
    name: 'Restaurante El Sabor del Valle',
    nitDocument: '900.123.456-1',
  };

  const mockVendor = {
    id: 'vendor-1',
    fullName: 'Carlos Vendedor',
  };

  const mockOrder = {
    id: 'order-1',
    orderNumber: 1001,
    createdAt: new Date(),
    status: OrderStatusEnum.RECIBIDO,
    paymentTerm: 'CONTADO',
    totalAmount: new Prisma.Decimal(116000),
    customer: mockCustomer,
    vendor: mockVendor,
    items: [
      {
        quantity: 10,
        unitPrice: new Prisma.Decimal(9800),
        subtotal: new Prisma.Decimal(98000),
        product: {
          name: 'Salsa de Tomate Especial 500ml',
          presentation: 'Frasco PET 500 ml',
        },
      },
    ],
  };

  const mockProduct = {
    id: 'prod-1',
    name: 'Salsa de Tomate Especial 500ml',
    presentation: 'Frasco PET 500 ml',
    price: new Prisma.Decimal(9800),
    stock: 120,
    minStock: 10,
    status: ProductStatusEnum.DISPONIBLE,
    category: { name: 'Salsas Tradicionales' },
  };

  beforeEach(async () => {
    prisma = {
      order: {
        findMany: jest.fn(),
      },
      product: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should generate a valid Excel workbook buffer for sales report', async () => {
    prisma.order.findMany.mockResolvedValue([mockOrder]);

    const buffer = await service.generateSalesReportExcel();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
  });

  it('should generate a valid Excel workbook buffer for inventory report', async () => {
    prisma.product.findMany.mockResolvedValue([mockProduct]);

    const buffer = await service.generateInventoryReportExcel();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
  });
});
