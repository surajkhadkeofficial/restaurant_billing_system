import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BillInvoice } from '../types';
import { formatINR, formatDateTime, numberToWordsINR } from './formatters';

/**
 * Configure and execute PDF export using html2canvas and jsPDF.
 * Includes Tailwind v4 color sanitization to prevent "oklch unsupported color" parser crashes.
 * Also includes a direct jsPDF vector renderer fallback.
 */
export async function exportReceiptToPdf(
  elementId: string,
  fileName: string,
  format: 'thermal' | 'a4' = 'thermal',
  invoice?: BillInvoice
): Promise<boolean> {
  const element = document.getElementById(elementId);

  // Method 1: HTML2Canvas + jsPDF with style sanitization
  if (element) {
    try {
      // Ensure images inside are loaded
      const images = Array.from(element.getElementsByTagName('img'));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Sanitize styles in the cloned DOM to prevent Tailwind v4 oklch() crashes
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.style.color = '#111827';
            // Force standard RGB/HEX color rendering
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const computed = window.getComputedStyle(htmlEl);
              if (computed.color && computed.color.includes('oklch')) {
                htmlEl.style.color = '#111827';
              }
              if (computed.borderColor && computed.borderColor.includes('oklch')) {
                htmlEl.style.borderColor = '#d1d5db';
              }
            });
          }
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      let pdf: jsPDF;
      let fullFileName: string;

      if (format === 'thermal') {
        const pdfWidth = 80;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [pdfWidth, Math.max(pdfHeight + 4, 80)],
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        fullFileName = `${fileName}_Receipt_80mm.pdf`;
      } else {
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 8;
        const contentWidth = pageWidth - margin * 2;
        const contentHeight = (canvas.height * contentWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, Math.min(contentHeight, pageHeight - margin * 2));
        fullFileName = `${fileName}_Tax_Invoice.pdf`;
      }

      // Trigger download using Blob + standard object URL
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fullFileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
      }, 3000);

      return true;
    } catch (canvasErr) {
      console.warn('html2canvas rasterization encountered an issue, trying direct vector jsPDF generator:', canvasErr);
    }
  }

  // Method 2: Direct pure jsPDF Vector Generator Fallback
  // If html2canvas fails, this direct vector builder generates and saves the PDF without canvas dependencies!
  if (invoice) {
    try {
      return generateDirectVectorPdf(invoice, format);
    } catch (vectorErr) {
      console.error('Vector PDF fallback failed:', vectorErr);
    }
  }

  return false;
}

/**
 * Pure jsPDF Vector PDF Generator
 * Guarantees crisp, instant desktop downloads with zero rasterization errors.
 */
export function generateDirectVectorPdf(invoice: BillInvoice, format: 'thermal' | 'a4' = 'thermal'): boolean {
  const restaurant = invoice.restaurantSnapshot;
  const isThermal = format === 'thermal';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isThermal ? [80, 160 + invoice.items.length * 10] : 'a4',
  });

  const pageWidth = isThermal ? 80 : 210;
  const margin = isThermal ? 5 : 14;
  let y = margin + 4;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(isThermal ? 13 : 18);
  doc.text(restaurant.name || 'Latur Royal Darbar', pageWidth / 2, y, { align: 'center' });
  y += isThermal ? 5 : 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(isThermal ? 8 : 10);
  doc.text(restaurant.tagline || 'Authentic Latur Delicacies', pageWidth / 2, y, { align: 'center' });
  y += isThermal ? 4 : 5;

  doc.setFontSize(isThermal ? 7 : 9);
  doc.text(`${restaurant.address}, ${restaurant.city}`, pageWidth / 2, y, { align: 'center' });
  y += isThermal ? 4 : 5;
  doc.text(`Phone: ${restaurant.phone}  |  GSTIN: ${restaurant.gstin}`, pageWidth / 2, y, { align: 'center' });
  y += isThermal ? 4 : 5;
  doc.text(`FSSAI Lic. No: ${restaurant.fssai}`, pageWidth / 2, y, { align: 'center' });
  y += isThermal ? 4 : 6;

  // Divider
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, y, pageWidth - margin, y);
  y += isThermal ? 4 : 6;
  doc.setLineDashPattern([], 0); // reset

  // Bill Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(isThermal ? 8 : 11);
  doc.text(`TAX INVOICE / CASH MEMO - ${invoice.invoiceNumber}`, margin, y);
  y += isThermal ? 4 : 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(isThermal ? 7 : 9);
  doc.text(`Date: ${formatDateTime(invoice.dateTime)}`, margin, y);
  doc.text(`Table: ${invoice.tableNumber}`, pageWidth - margin, y, { align: 'right' });
  y += isThermal ? 4 : 5;
  doc.text(`Customer: ${invoice.customerName}`, margin, y);
  if (invoice.customerPhone) {
    doc.text(`Phone: ${invoice.customerPhone}`, pageWidth - margin, y, { align: 'right' });
  }
  y += isThermal ? 4 : 5;
  doc.text(`Cashier / Payee: ${restaurant.payeeName || 'Suraj Khadke'}`, margin, y);
  y += isThermal ? 5 : 7;

  // Table Header
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += isThermal ? 3.5 : 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(isThermal ? 7 : 9);
  doc.text('Item Description', margin, y);
  doc.text('Qty', pageWidth - margin - (isThermal ? 28 : 50), y, { align: 'center' });
  doc.text('Rate', pageWidth - margin - (isThermal ? 14 : 25), y, { align: 'right' });
  doc.text('Amount (Rs)', pageWidth - margin, y, { align: 'right' });
  y += isThermal ? 3.5 : 4.5;
  doc.line(margin, y, pageWidth - margin, y);
  y += isThermal ? 4 : 6;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(isThermal ? 7 : 9);

  invoice.items.forEach((item) => {
    const itemTitle = `${item.menuItem.name} ${item.menuItem.marathiName ? `(${item.menuItem.marathiName})` : ''}`;
    const truncatedTitle = itemTitle.length > (isThermal ? 24 : 45) ? itemTitle.substring(0, isThermal ? 22 : 43) + '..' : itemTitle;

    doc.text(truncatedTitle, margin, y);
    doc.text(item.quantity.toString(), pageWidth - margin - (isThermal ? 28 : 50), y, { align: 'center' });
    doc.text(item.unitPrice.toFixed(2), pageWidth - margin - (isThermal ? 14 : 25), y, { align: 'right' });
    doc.text(item.itemTotal.toFixed(2), pageWidth - margin, y, { align: 'right' });
    y += isThermal ? 4 : 5.5;
  });

  doc.line(margin, y, pageWidth - margin, y);
  y += isThermal ? 4 : 6;

  // Subtotals & Tax
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageWidth - margin - (isThermal ? 30 : 60), y);
  doc.text(formatINR(invoice.subtotal), pageWidth - margin, y, { align: 'right' });
  y += isThermal ? 3.5 : 5;

  if (invoice.discountAmount > 0) {
    doc.text('Discount:', pageWidth - margin - (isThermal ? 30 : 60), y);
    doc.text(`-${formatINR(invoice.discountAmount)}`, pageWidth - margin, y, { align: 'right' });
    y += isThermal ? 3.5 : 5;
  }

  if (invoice.applyGst) {
    doc.text(`CGST @ ${invoice.cgstRate}%:`, pageWidth - margin - (isThermal ? 30 : 60), y);
    doc.text(formatINR(invoice.cgstAmount), pageWidth - margin, y, { align: 'right' });
    y += isThermal ? 3.5 : 5;

    doc.text(`SGST @ ${invoice.sgstRate}%:`, pageWidth - margin - (isThermal ? 30 : 60), y);
    doc.text(formatINR(invoice.sgstAmount), pageWidth - margin, y, { align: 'right' });
    y += isThermal ? 3.5 : 5;
  }

  // Grand Total Box
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(isThermal ? 9 : 12);
  doc.text('GRAND TOTAL:', pageWidth - margin - (isThermal ? 30 : 60), y);
  doc.text(formatINR(invoice.grandTotal), pageWidth - margin, y, { align: 'right' });
  y += isThermal ? 5 : 7;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(isThermal ? 6.5 : 8);
  doc.text(`(${numberToWordsINR(invoice.grandTotal)})`, pageWidth / 2, y, { align: 'center' });
  y += isThermal ? 5 : 7;

  // UPI Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(isThermal ? 7 : 9);
  doc.text(`Pay via UPI to: ${restaurant.payeeName || 'Suraj Khadke'}`, pageWidth / 2, y, { align: 'center' });
  y += isThermal ? 3.5 : 4.5;
  doc.text(`UPI ID: ${restaurant.upiId || 'surajkhadke@upi'}`, pageWidth / 2, y, { align: 'center' });
  y += isThermal ? 5 : 7;

  // Footer Note
  doc.setFontSize(isThermal ? 6.5 : 8);
  doc.text('Thank you! Please visit again (पुन्हा अवश्य भेट द्या)', pageWidth / 2, y, { align: 'center' });
  y += isThermal ? 3.5 : 4.5;
  doc.text('Software by Suraj Khadke (SurajKhadkeofficial)', pageWidth / 2, y, { align: 'center' });

  // Save PDF file
  const fullFileName = isThermal
    ? `LaturRoyalDarbar_${invoice.invoiceNumber}_Thermal_80mm.pdf`
    : `LaturRoyalDarbar_${invoice.invoiceNumber}_Tax_Invoice.pdf`;

  doc.save(fullFileName);
  return true;
}
