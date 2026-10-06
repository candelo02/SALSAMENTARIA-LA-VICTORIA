import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfGeneratorService {
  generateOrderPdf(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#C62828');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(18).text('LA VICTORIA - SALSAS Y ADEREZOS', 55, 52);
      doc.font('Helvetica').fontSize(10).text('Fábrica y Distribuidora B2B | Tumaco - Nariño', 55, 75);

      // Order Title & Status
      doc.fillColor('#333333').font('Helvetica-Bold').fontSize(14).text(`REMISIÓN DE PEDIDO #${order.orderNumber || order.id.substring(0, 8)}`, 40, 115);
      doc.font('Helvetica').fontSize(10).text(`Estado: ${order.status}`, 400, 115, { align: 'right' });
      doc.fontSize(9).fillColor('#666666').text(`Fecha de Emisión: ${new Date(order.createdAt).toLocaleString('es-CO')}`, 40, 132);

      doc.moveTo(40, 148).lineTo(555, 148).strokeColor('#EEEEEE').stroke();

      // Customer & Vendor Info Box
      doc.rect(40, 155, 250, 85).fillAndStroke('#F9F9F9', '#E0E0E0');
      doc.fillColor('#C62828').font('Helvetica-Bold').fontSize(10).text('DATOS DEL CLIENTE', 50, 163);
      doc.fillColor('#333333').font('Helvetica').fontSize(9)
        .text(`Cliente: ${order.customer ? order.customer.name : 'N/A'}`, 50, 178)
        .text(`NIT/Doc: ${order.customer ? order.customer.nitDocument : 'N/A'}`, 50, 191)
        .text(`Dirección: ${order.customer ? order.customer.address : 'N/A'}`, 50, 204)
        .text(`Municipio: ${order.customer ? order.customer.municipality : 'N/A'}`, 50, 217);

      doc.rect(305, 155, 250, 85).fillAndStroke('#F9F9F9', '#E0E0E0');
      doc.fillColor('#C62828').font('Helvetica-Bold').fontSize(10).text('DATOS DE VENTA & RUTA', 315, 163);
      doc.fillColor('#333333').font('Helvetica').fontSize(9)
        .text(`Vendedor: ${order.vendor ? order.vendor.fullName : 'N/A'}`, 315, 178)
        .text(`Email: ${order.vendor ? order.vendor.email : 'N/A'}`, 315, 191)
        .text(`Notas: ${order.notes || 'Sin observaciones'}`, 315, 204);

      // Table Header
      let y = 255;
      doc.rect(40, y, 515, 20).fill('#333333');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9)
        .text('ÍTEM / PRODUCTO', 50, y + 5)
        .text('PRESENTACIÓN', 250, y + 5)
        .text('CANT.', 370, y + 5, { width: 40, align: 'center' })
        .text('PRECIO UNIT.', 420, y + 5, { width: 65, align: 'right' })
        .text('SUBTOTAL', 490, y + 5, { width: 60, align: 'right' });

      y += 20;

      // Items Rows
      let totalAmount = 0;
      doc.font('Helvetica');
      order.items.forEach((item: any, index: number) => {
        const itemBg = index % 2 === 0 ? '#FFFFFF' : '#F7F7F7';
        doc.rect(40, y, 515, 20).fill(itemBg);

        const productName = item.product ? item.product.name : 'Producto';
        const presentation = item.product ? item.product.presentation : '';
        const price = Number(item.unitPrice);
        const subtotal = Number(item.subtotal);
        totalAmount += subtotal;

        doc.fillColor('#333333').fontSize(8)
          .text(productName, 50, y + 5)
          .text(presentation, 250, y + 5)
          .text(`${item.quantity}`, 370, y + 5, { width: 40, align: 'center' })
          .text(`$${price.toLocaleString('es-CO')}`, 420, y + 5, { width: 65, align: 'right' })
          .text(`$${subtotal.toLocaleString('es-CO')}`, 490, y + 5, { width: 60, align: 'right' });

        y += 20;
      });

      // Total Box
      y += 10;
      doc.rect(340, y, 215, 30).fill('#C62828');
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11).text('TOTAL PEDIDO:', 350, y + 9);
      doc.fontSize(12).text(`$${totalAmount.toLocaleString('es-CO')} COP`, 440, y + 8, { align: 'right' });

      // Signatures Footer Block
      y += 60;
      doc.strokeColor('#CCCCCC').lineWidth(1)
        .moveTo(60, y + 30).lineTo(240, y + 30).stroke()
        .moveTo(315, y + 30).lineTo(495, y + 30).stroke();

      doc.fillColor('#666666').font('Helvetica').fontSize(8)
        .text('Firma Alistamiento Bodega', 60, y + 35, { width: 180, align: 'center' })
        .text('Firma y Sello Recibido Cliente', 315, y + 35, { width: 180, align: 'center' });

      doc.end();
    });
  }
}
