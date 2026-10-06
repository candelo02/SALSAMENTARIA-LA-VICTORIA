import { PrismaClient, RoleEnum, ProductStatusEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding La Victoria database...');

  // 1. Password Hash
  const passwordHash = await bcrypt.hash('Victoria2026!', 10);

  // 2. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lavictoria.com' },
    update: {},
    create: {
      email: 'admin@lavictoria.com',
      fullName: 'Administrador Principal',
      password: passwordHash,
      role: RoleEnum.ADMINISTRADOR,
    },
  });

  const vendor = await prisma.user.upsert({
    where: { email: 'vendedor1@lavictoria.com' },
    update: {},
    create: {
      email: 'vendedor1@lavictoria.com',
      fullName: 'Carlos Vendedor',
      password: passwordHash,
      role: RoleEnum.VENDEDOR,
    },
  });

  const bodega = await prisma.user.upsert({
    where: { email: 'bodega1@lavictoria.com' },
    update: {},
    create: {
      email: 'bodega1@lavictoria.com',
      fullName: 'Mario Bodega',
      password: passwordHash,
      role: RoleEnum.BODEGA,
    },
  });

  console.log('Users created:', { admin: admin.email, vendor: vendor.email, bodega: bodega.email });

  // 3. Create Categories
  const catSalsas = await prisma.category.upsert({
    where: { name: 'Salsas Tradicionales' },
    update: {},
    create: {
      name: 'Salsas Tradicionales',
      description: 'Salsas de tomate, ajo, tártara y mostaza para restaurantes y distribuidores.',
    },
  });

  const catAderezos = await prisma.category.upsert({
    where: { name: 'Aderezos Especiales' },
    update: {},
    create: {
      name: 'Aderezos Especiales',
      description: 'Aderezos picantes, BBQ y fórmulas gourmet.',
    },
  });

  // 4. Create Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Salsa de Tomate Especial 500ml',
      description: 'Salsa elaborada con tomates seleccionados, consistencia espesa ideal para comidas rápidas.',
      characteristics: 'Producto nacional, sin conservantes artificiales excesivos, presentación 500ml.',
      presentation: 'Frasco PET 500 ml',
      unitOfMeasure: 'Unidad',
      price: 8500.00,
      stock: 120,
      minStock: 15,
      status: ProductStatusEnum.DISPONIBLE,
      categoryId: catSalsas.id,
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Salsa de Ajo Casera 250ml',
      description: 'Salsa sabor intenso a ajo natural con toques de finas hierbas.',
      characteristics: 'Ideal para carnes, patacones y aperitivos.',
      presentation: 'Botella PET 250 ml',
      unitOfMeasure: 'Unidad',
      price: 6200.00,
      stock: 45,
      minStock: 10,
      status: ProductStatusEnum.DISPONIBLE,
      categoryId: catSalsas.id,
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'Aderezo BBQ Ahumado 1kg',
      description: 'Salsa BBQ estilo americano con sabor ahumado profundo y nota dulce refinada.',
      characteristics: 'Uso industrial y restaurantes.',
      presentation: 'Galón PET 1000 gr',
      unitOfMeasure: 'Galón',
      price: 24500.00,
      stock: 8,
      minStock: 10,
      status: ProductStatusEnum.STOCK_BAJO,
      categoryId: catAderezos.id,
    },
  });

  console.log('Products created:', [prod1.name, prod2.name, prod3.name]);

  // 5. Create Customers
  const customer1 = await prisma.customer.upsert({
    where: { nitDocument: '900123456-1' },
    update: {},
    create: {
      name: 'Restaurante El Sabor del Valle',
      nitDocument: '900123456-1',
      phone: '3101234567',
      address: 'Calle 15 # 4-22, Centro',
      municipality: 'Tumaco',
      neighborhood: 'Centro',
      contactPerson: 'Don Juan Pérez',
      customerType: 'Restaurante',
      lat: 1.801,
      lng: -78.761,
      notes: 'Entregar preferiblemente en mañanas de 8am a 11am.',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { nitDocument: '900987654-3' },
    update: {},
    create: {
      name: 'Distribuidora La Economía',
      nitDocument: '900987654-3',
      phone: '3158765432',
      address: 'Carrera 8 # 12-50, Zona Industrial',
      municipality: 'Tumaco',
      neighborhood: 'La Libertad',
      contactPerson: 'María Gómez',
      customerType: 'Mayorista',
      lat: 1.805,
      lng: -78.765,
    },
  });

  console.log('Customers created:', [customer1.name, customer2.name]);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
