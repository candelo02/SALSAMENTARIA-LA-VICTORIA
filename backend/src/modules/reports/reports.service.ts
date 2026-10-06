import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateSalesReportExcel(): Promise<Buffer> {
    const orders = await this.prisma.order.findMany({
      include: {
        customer: true,
        vendor: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'La Victoria System';
    workbook.created = new Date();

    // Sheet 1: Consolidad de Ventas y Pedidos
    const sheetOrders = workbook.addWorksheet('Resumen de Pedidos');
    sheetOrders.columns = [
      { header: 'ID Pedido', key: 'id', width: 36 },
      { header: 'No. Pedido', key: 'orderNumber', width: 12 },
      { header: 'Fecha', key: 'createdAt', width: 20 },
      { header: 'Cliente', key: 'customerName', width: 30 },
      { header: 'NIT / Doc', key: 'nitDocument', width: 18 },
      { header: 'Vendedor', key: 'vendorName', width: 25 },
      { header: 'Forma de Pago', key: 'paymentTerm', width: 18 },
      { header: 'Estado', key: 'status', width: 18 },
      { header: 'Total ($ COP)', key: 'totalAmount', width: 18 },
    ];

    // Style Header Row
    sheetOrders.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheetOrders.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C62828' } };

    orders.forEach((order) => {
      sheetOrders.addRow({
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: new Date(order.createdAt).toLocaleString('es-CO'),
        customerName: order.customer ? order.customer.name : 'N/A',
        nitDocument: order.customer ? order.customer.nitDocument : 'N/A',
        vendorName: order.vendor ? order.vendor.fullName : 'N/A',
        paymentTerm: (order as any).paymentTerm || 'CONTADO',
        status: order.status,
        totalAmount: Number(order.totalAmount),
      });
    });

    // Sheet 2: Detalle por Ítem
    const sheetItems = workbook.addWorksheet('Detalle de Productos Vendidos');
    sheetItems.columns = [
      { header: 'No. Pedido', key: 'orderNumber', width: 12 },
      { header: 'Producto', key: 'productName', width: 32 },
      { header: 'Presentación', key: 'presentation', width: 20 },
      { header: 'Cantidad', key: 'quantity', width: 12 },
      { header: 'Precio Unitario', key: 'unitPrice', width: 16 },
      { header: 'Subtotal ($ COP)', key: 'subtotal', width: 18 },
    ];

    sheetItems.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheetItems.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '333333' } };

    orders.forEach((order) => {
      order.items.forEach((item) => {
        sheetItems.addRow({
          orderNumber: order.orderNumber,
          productName: item.product ? item.product.name : 'N/A',
          presentation: item.product ? item.product.presentation : 'N/A',
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generateInventoryReportExcel(): Promise<Buffer> {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'La Victoria System';

    const sheet = workbook.addWorksheet('Inventario Bodega');
    sheet.columns = [
      { header: 'Código / ID', key: 'id', width: 36 },
      { header: 'Producto', key: 'name', width: 32 },
      { header: 'Categoría', key: 'category', width: 24 },
      { header: 'Presentación', key: 'presentation', width: 20 },
      { header: 'Precio ($ COP)', key: 'price', width: 16 },
      { header: 'Stock Actual', key: 'stock', width: 14 },
      { header: 'Min. Stock', key: 'minStock', width: 14 },
      { header: 'Estado Semáforo', key: 'status', width: 18 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1B5E20' } };

    products.forEach((p) => {
      const row = sheet.addRow({
        id: p.id,
        name: p.name,
        category: p.category ? p.category.name : 'N/A',
        presentation: p.presentation,
        price: Number(p.price),
        stock: p.stock,
        minStock: p.minStock,
        status: p.status,
      });

      if (p.status === 'STOCK_BAJO') {
        row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9C4' } };
      } else if (p.status === 'AGOTADO') {
        row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCDD2' } };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
