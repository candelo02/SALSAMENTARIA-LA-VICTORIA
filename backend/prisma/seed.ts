import { PrismaClient, RoleEnum, ProductStatusEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding La Victoria database with all department users...');

  // 1. Password Hash
  const passwordHash = await bcrypt.hash('Victoria2026!', 10);

  // 2. Create All Required Department Users
  const users = [
    {
      email: 'admin@lavictoria.com',
      fullName: 'Carlos Administrador',
      role: RoleEnum.ADMINISTRADOR,
    },
    {
      email: 'vendedor1@lavictoria.com',
      fullName: 'Carlos Vendedor',
      role: RoleEnum.VENDEDOR,
    },
    {
      email: 'vendedor2@lavictoria.com',
      fullName: 'Ana Vendedora Campo',
      role: RoleEnum.VENDEDOR,
    },
    {
      email: 'contabilidad@lavictoria.com',
      fullName: 'Laura Auxiliar Contable',
      role: RoleEnum.AUXILIAR_CONTABLE,
    },
    {
      email: 'bodega1@lavictoria.com',
      fullName: 'Mario Encargado Bodega',
      role: RoleEnum.BODEGA,
    },
    {
      email: 'ventas@lavictoria.com',
      fullName: 'Roberto Jefe de Ventas',
      role: RoleEnum.ENCARGADO_VENTAS,
    },
    {
      email: 'produccion@lavictoria.com',
      fullName: 'Ing. Fernando Producción Salsas',
      role: RoleEnum.ENCARGADO_PRODUCCION,
    },
    {
      email: 'supervisor@lavictoria.com',
      fullName: 'Patricia Supervisora Operaciones',
      role: RoleEnum.SUPERVISOR,
    },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, fullName: u.fullName },
      create: {
        email: u.email,
        fullName: u.fullName,
        password: passwordHash,
        role: u.role,
      },
    });
    createdUsers.push(user.email);
  }

  console.log('Department Users created:', createdUsers);

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

  // 4. Create Customers
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
