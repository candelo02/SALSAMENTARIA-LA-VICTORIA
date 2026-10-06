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

      // Header Banner with Logo
      doc.rect(40, 40, 515, 65).fill('#C62828');
      
      // Vector Logo Badge (Shield / Bottle Icon)
      doc.save();
      doc.rect(52, 48, 36, 48).fill('#8E0000');
      doc.path('M 70 52 L 80 62 L 70 88 L 60 62 Z').fill('#FFD54F');
      doc.restore();

      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(16).text('LA VICTORIA - SALSAS Y ADEREZOS', 98, 49);
      doc.font('Helvetica').fontSize(9).text('Fábrica y Distribuidora B2B | Tumaco - Nariño | NIT: 900.123.456-7', 98, 69);
      doc.fontSize(8).text('Tel: +57 (315) 890-1234 | Ventas & Despachos Directos', 98, 83);

      // Order Title & Status
      doc.fillColor('#333333').font('Helvetica-Bold').fontSize(13).text(`REMISIÓN OFICIAL DE DESPACHO #${order.orderNumber || order.id.substring(0, 8)}`, 40, 118);
      doc.font('Helvetica').fontSize(10).text(`Estado: ${order.status}`, 400, 118, { align: 'right' });
      doc.fontSize(9).fillColor('#666666').text(`Fecha de Emisión: ${new Date(order.createdAt).toLocaleString('es-CO')}`, 40, 134);

      doc.moveTo(40, 148).lineTo(555, 148).strokeColor('#EEEEEE').stroke();

      // Customer & Vendor Info Box
      doc.rect(40, 155, 250, 90).fillAndStroke('#F9F9F9', '#E0E0E0');
      doc.fillColor('#C62828').font('Helvetica-Bold').fontSize(10).text('DATOS DEL CLIENTE', 50, 163);
      doc.fillColor('#333333').font('Helvetica').fontSize(8.5)
        .text(`Cliente: ${order.customer ? order.customer.name : 'N/A'}`, 50, 177)
        .text(`NIT/Doc: ${order.customer ? order.customer.nitDocument : 'N/A'}`, 50, 190)
        .text(`Dirección: ${order.customer ? order.customer.address : 'N/A'}`, 50, 203)
        .text(`Municipio: ${order.customer ? order.customer.municipality : 'N/A'}`, 50, 216)
        .text(`Teléfono: ${order.customer ? order.customer.phone : 'N/A'}`, 50, 229);

      doc.rect(305, 155, 250, 90).fillAndStroke('#F9F9F9', '#E0E0E0');
      doc.fillColor('#C62828').font('Helvetica-Bold').fontSize(10).text('DATOS DE VENTA & CONDICIONES', 315, 163);
      doc.fillColor('#333333').font('Helvetica').fontSize(8.5)
        .text(`Vendedor: ${order.vendor ? order.vendor.fullName : 'N/A'}`, 315, 177)
        .text(`Forma de Pago: ${order.paymentTerm || 'CONTADO'}`, 315, 190)
        .text(`Notas / Obs: ${order.notes || 'Sin observaciones'}`, 315, 203);

      // Table Header
      let y = 258;
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
