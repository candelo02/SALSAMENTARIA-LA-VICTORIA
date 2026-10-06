import { ConflictException, NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';

describe('CustomersService Unit Suite', () => {
  let customersService: CustomersService;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      customer: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    customersService = new CustomersService(mockPrismaService);
  });

  it('should create a new customer successfully if NIT is unique', async () => {
    mockPrismaService.customer.findUnique.mockResolvedValue(null);
    mockPrismaService.customer.create.mockResolvedValue({
      id: 'cust-123',
      name: 'Restaurante El Pacífico',
      nitDocument: '900123456-1',
      phone: '3001234567',
      address: 'Calle 5 # 10-20',
      municipality: 'Tumaco',
      lat: 1.801,
      lng: -78.762,
    });

    const result = await customersService.create({
      name: 'Restaurante El Pacífico',
      nitDocument: '900123456-1',
      phone: '3001234567',
      address: 'Calle 5 # 10-20',
      municipality: 'Tumaco',
      lat: 1.801,
      lng: -78.762,
    });

    expect(result).toBeDefined();
    expect(result.id).toBe('cust-123');
    expect(mockPrismaService.customer.create).toHaveBeenCalled();
  });

  it('should throw ConflictException if NIT already exists', async () => {
    mockPrismaService.customer.findUnique.mockResolvedValue({
      id: 'existing-cust',
      nitDocument: '900123456-1',
    });

    await expect(
      customersService.create({
        name: 'Cliente Duplicado',
        nitDocument: '900123456-1',
        phone: '3000000000',
        address: 'Carrera 1 # 2-3',
        municipality: 'Pasto',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should find customers by municipality', async () => {
    mockPrismaService.customer.findMany.mockResolvedValue([
      { id: 'c1', name: 'Cliente 1', municipality: 'Tumaco' },
    ]);

    const list = await customersService.findByMunicipality('Tumaco');
    expect(list).toHaveLength(1);
    expect(list[0].municipality).toBe('Tumaco');
  });
});
