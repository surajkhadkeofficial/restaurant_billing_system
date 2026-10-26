import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  X, 
  CheckCircle2, 
  Receipt as ReceiptIcon, 
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';
import { BillInvoice } from '../types';
import { formatINR, formatDateTime, numberToWordsINR, generateUpiUri } from '../utils/formatters';
import { generateQrDataUrl } from '../utils/qrCode';
import { exportReceiptToPdf } from '../utils/pdfExport';
import { Language, translations } from '../utils/translations';

interface ReceiptModalProps {
  invoice: BillInvoice;
  onClose: () => void;
  onNewBill: () => void;
  lang: Language;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  invoice,
  onClose,
  onNewBill,
  lang,
}) => {
  const t = translations[lang];
  const [receiptMode, setReceiptMode] = useState<'thermal' | 'a4'>('thermal');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const restaurant = invoice.restaurantSnapshot;
  const payeeName = restaurant.payeeName || 'Suraj Khadke';
  const upiId = restaurant.upiId || 'surajkhadke@upi';

  // Generate local in-memory data URL for UPI QR
  useEffect(() => {
    const upiUri = generateUpiUri(
      upiId,
      payeeName,
      invoice.grandTotal,
      invoice.invoiceNumber
    );

    generateQrDataUrl(upiUri, 180).then((dataUrl) => {
      setQrDataUrl(dataUrl);
    });
  }, [upiId, payeeName, invoice.grandTotal, invoice.invoiceNumber]);

  const handlePrint = () => {
    window.print();
  };

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);
    setNoticeMessage(null);

    const elementId = receiptMode === 'thermal' ? 'thermal-receipt-element' : 'a4-invoice-element';
    const cleanFileName = `LaturRoyalDarbar_${invoice.invoiceNumber}`;
    
    try {
      const success = await exportReceiptToPdf(elementId, cleanFileName, receiptMode, invoice);
      setIsExporting(false);

      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      } else {
        setNoticeMessage(
          lang === 'mr' 
            ? 'PDF डाऊनलोड सुरू झाले आहे. आपण थेट प्रिंट पर्यायातूनही PDF सेव्ह करू शकता.' 
            : 'PDF download initiated. You can also use Print -> Save as PDF anytime.'
        );
        setTimeout(() => setNoticeMessage(null), 5000);
      }
    } catch {
      setIsExporting(false);
      setNoticeMessage(
        lang === 'mr' 
          ? 'प्रिंट पर्यायातून (Ctrl+P / Command+P) PDF तात्काळ सेव्ह करता येते.' 
          : 'You can instantly save as PDF using the Print button.'
      );
      setTimeout(() => setNoticeMessage(null), 5000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `*${restaurant.name}* (${lang === 'mr' ? 'लातूर' : 'Latur'})\n` +
      `${t.billNo}: ${invoice.invoiceNumber}\n` +
      `${t.customer}: ${invoice.customerName} (${invoice.tableNumber})\n` +
      `${t.grandTotalLabel}: *${formatINR(invoice.grandTotal)}*\n` +
      `Payee: ${payeeName} (${invoice.paymentMode.toUpperCase()})\n` +
      `${lang === 'mr' ? 'पुन्हा अवश्य भेट द्या.' : 'Thank you for visiting!'}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-stone-200 flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Header & Controls (Hidden during print) */}
        <div className="bg-emerald-950 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-4 border-b border-emerald-900 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="font-display font-bold text-base sm:text-lg flex items-center gap-2">
                <span>{t.billGeneratedTitle}</span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-emerald-900 text-amber-300 border border-emerald-700/60 font-bold">
                  {invoice.invoiceNumber}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                {restaurant.name} · {invoice.customerName} · <span className="font-bold text-white">{formatINR(invoice.grandTotal)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle: 80mm thermal vs A4 invoice */}
            <div className="bg-emerald-900/80 p-0.5 rounded-lg border border-emerald-800 flex items-center">
              <button
                onClick={() => setReceiptMode('thermal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  receiptMode === 'thermal'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
                title="80mm Thermal Receipt"
              >
                <ReceiptIcon className="w-3.5 h-3.5" />
                <span>{t.receiptTab80mm}</span>
              </button>
              <button
                onClick={() => setReceiptMode('a4')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  receiptMode === 'a4'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
                title="A4 Tax Invoice"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.receiptTabA4}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors ml-1"
              title={t.closeButton}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Banner when PDF downloaded */}
        {downloadSuccess && (
          <div className="bg-emerald-700 text-white px-4 py-2 text-xs flex items-center justify-between font-bold print:hidden">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{t.pdfSuccessNotice}</span>
            </div>
            <button onClick={() => setDownloadSuccess(false)} className="text-white hover:opacity-80">✕</button>
          </div>
        )}

        {/* Informational Notice Banner */}
        {noticeMessage && (
          <div className="bg-amber-700 text-white px-4 py-2 text-xs flex items-center justify-between font-semibold print:hidden">
            <div className="flex items-center gap-2">
              <ReceiptIcon className="w-4 h-4 text-amber-200" />
              <span>{noticeMessage}</span>
            </div>
            <button onClick={() => setNoticeMessage(null)} className="text-white hover:opacity-80">✕</button>
          </div>
        )}

        {/* Scrollable Receipt Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          <div id="printable-receipt-area" className="w-full flex justify-center">
            
            {/* FORMAT 1: COMPACT 80MM THERMAL RECEIPT */}
            {receiptMode === 'thermal' && (
              <div
                id="thermal-receipt-element"
                className="bg-white text-stone-900 w-full max-w-[360px] p-6 rounded-xl shadow-lg border border-stone-300 font-sans text-xs leading-normal relative print:shadow-none print:border-none print:w-[80mm] print:max-w-[80mm] print:p-3"
                style={{ backgroundColor: '#ffffff', color: '#111827' }}
              >
                {/* Header */}
                <div className="text-center pb-3 border-b-2 border-dashed border-stone-400">
                  <h2 className="font-extrabold text-lg uppercase tracking-tight text-stone-950 font-display">
                    {restaurant.name}
                  </h2>
                  <div className="text-xs text-stone-700 font-bold mt-0.5">
                    {lang === 'mr' ? 'लातूर रॉयल दरबार (Latur)' : 'Latur Royal Darbar (लातूर)'}
                  </div>
                  <div className="text-xs text-stone-600 font-medium mt-0.5">
                    {restaurant.tagline}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1">
                    {restaurant.address}, {restaurant.city} - {restaurant.pincode}
                  </div>
                  <div className="text-[11px] text-stone-700 font-medium mt-0.5">
                    {t.phone}: {restaurant.phone}
                  </div>
                  <div className="text-[11px] font-bold text-stone-900 font-mono mt-0.5">
                    GSTIN: {restaurant.gstin}
                  </div>
                  <div className="text-[10px] text-stone-600 font-mono">
                    FSSAI: {restaurant.fssai}
                  </div>
                </div>

                {/* Cash Memo Title */}
                <div className="text-center py-2 font-bold text-xs uppercase tracking-wider border-b-2 border-dashed border-stone-400 bg-stone-50 my-1">
                  {t.taxInvoiceMemo}
                </div>

                {/* Bill Meta Details */}
                <div className="py-2.5 border-b border-dashed border-stone-400 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-600">{t.billNo}:</span>
                    <span className="font-mono font-bold text-stone-950">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">{t.dateTime}:</span>
                    <span className="font-mono text-stone-900">{formatDateTime(invoice.dateTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">{t.table}:</span>
                    <span className="font-bold text-stone-950">{invoice.tableNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">{t.customer}:</span>
                    <span className="font-semibold text-stone-950 truncate max-w-[180px]">{invoice.customerName}</span>
                  </div>
                  {invoice.customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-stone-600">{t.phone}:</span>
                      <span className="font-mono">{invoice.customerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-600">{t.cashier}:</span>
                    <span className="font-medium text-stone-900">{payeeName} ({lang === 'mr' ? 'सुरज खडके' : 'Suraj Khadke'})</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="py-3 border-b-2 border-dashed border-stone-400">
                  <div className="grid grid-cols-12 text-[11px] font-bold pb-1.5 text-stone-800 uppercase border-b border-stone-300">
                    <div className="col-span-6">{t.itemCol}</div>
                    <div className="col-span-2 text-center">{t.qtyCol}</div>
                    <div className="col-span-2 text-right">{t.rateCol}</div>
                    <div className="col-span-2 text-right">{t.totalCol}</div>
                  </div>

                  <div className="py-1.5 space-y-2">
                    {invoice.items.map((item, idx) => {
                      const primaryName = lang === 'mr' ? (item.menuItem.marathiName || item.menuItem.name) : item.menuItem.name;
                      const secondaryName = lang === 'mr' ? item.menuItem.name : item.menuItem.marathiName;

                      return (
                        <div key={idx} className="grid grid-cols-12 text-xs leading-snug">
                          <div className="col-span-6 pr-1">
                            <span className="font-bold text-stone-950 block">
                              {primaryName}
                            </span>
                            {secondaryName && (
                              <span className="text-[11px] text-stone-600 block font-medium">
                                {secondaryName}
                              </span>
                            )}
                            {item.notes && (
                              <div className="text-[10px] text-stone-500 italic">
                                * {item.notes}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 text-center font-bold font-mono">
                            {item.quantity}
                          </div>
                          <div className="col-span-2 text-right font-mono text-stone-700">
                            {item.unitPrice}
                          </div>
                          <div className="col-span-2 text-right font-bold font-mono text-stone-950">
                            {item.itemTotal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Calculations */}
                <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-700">
                    <span>{t.subtotalLabel}:</span>
                    <span className="font-mono font-semibold">{formatINR(invoice.subtotal)}</span>
                  </div>

                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-medium">
                      <span>{t.discountLabel}:</span>
                      <span className="font-mono">-{formatINR(invoice.discountAmount)}</span>
                    </div>
                  )}

                  {invoice.applyGst && (
                    <>
                      <div className="flex justify-between text-stone-700">
                        <span>CGST @ 2.5% ({lang === 'mr' ? 'केंद्रीय कर' : 'Central Tax'}):</span>
                        <span className="font-mono">{formatINR(invoice.cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-stone-700">
                        <span>SGST @ 2.5% ({lang === 'mr' ? 'राज्य कर' : 'State Tax'}):</span>
                        <span className="font-mono">{formatINR(invoice.sgstAmount)}</span>
                      </div>
                    </>
                  )}

                  {invoice.roundOffAmount !== 0 && (
                    <div className="flex justify-between text-stone-500 text-[11px] font-mono">
                      <span>{t.roundOff}:</span>
                      <span>{invoice.roundOffAmount > 0 ? `+${invoice.roundOffAmount.toFixed(2)}` : invoice.roundOffAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="py-3 border-b-2 border-stone-900 text-center bg-stone-50 my-1 rounded-lg">
                  <div className="text-xs text-stone-700 font-bold uppercase">
                    {t.grandTotalLabel}
                  </div>
                  <div className="text-2xl font-black text-emerald-950 font-display tracking-tight mt-0.5">
                    {formatINR(invoice.grandTotal)}
                  </div>
                  <div className="text-[11px] text-stone-600 italic mt-0.5 capitalize px-2">
                    ({numberToWordsINR(invoice.grandTotal)})
                  </div>
                </div>

                {/* Payment info */}
                <div className="py-2 border-b border-dashed border-stone-400 text-center text-[11px]">
                  <span className="font-bold uppercase text-stone-800">
                    PAID VIA {invoice.paymentMode.toUpperCase()}
                  </span>
                  <span className="mx-1.5">·</span>
                  <span className="text-emerald-800 font-bold">STATUS: {invoice.paymentStatus.toUpperCase()}</span>
                </div>

                {/* UPI QR Code: SURAJ KHADKE */}
                <div className="py-3 text-center border-b border-dashed border-stone-400 flex flex-col items-center">
                  <div className="text-xs font-extrabold text-stone-900 mb-1 tracking-wide">
                    {t.scanToPay}
                  </div>

                  {qrDataUrl && (
                    <div className="p-1.5 bg-white border-2 border-stone-400 rounded-lg inline-block shadow-xs">
                      <img
                        src={qrDataUrl}
                        alt="Suraj Khadke UPI QR Code"
                        className="w-28 h-28 object-contain"
                      />
                    </div>
                  )}

                  <div className="text-xs font-bold text-emerald-950 mt-1">
                    {t.payeeNameLabel}: <span className="text-amber-800 font-extrabold">{payeeName}</span>
                  </div>
                  <div className="text-[11px] font-mono font-medium text-stone-700 mt-0.5">
                    {t.upiIdLabel}: {upiId}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {t.upiApps}
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="pt-3 text-center text-[11px] text-stone-700 space-y-1">
                  <div className="font-medium">{restaurant.footerNote}</div>
                  <div className="text-[10px] text-stone-500 font-mono">
                    System by Suraj Khadke (SurajKhadkeofficial)
                  </div>
                </div>
              </div>
            )}

            {/* FORMAT 2: FORMAL A4 GST TAX INVOICE */}
            {receiptMode === 'a4' && (
              <div
                id="a4-invoice-element"
                className="bg-white text-stone-900 w-full max-w-2xl p-8 rounded-xl shadow-md border border-stone-300 font-sans text-xs leading-normal print:shadow-none print:border-none print:w-full print:p-4"
                style={{ backgroundColor: '#ffffff', color: '#111827' }}
              >
                {/* Official Tax Invoice Header */}
                <div className="border-b-2 border-emerald-900 pb-4 mb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="inline-block px-3 py-1 bg-emerald-950 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-md mb-1.5">
                        {t.taxInvoiceMemo}
                      </div>
                      <h1 className="text-2xl font-black font-display text-emerald-950">
                        {restaurant.name}
                      </h1>
                      <div className="text-sm font-bold text-stone-800">
                        लातूर रॉयल दरबार (Latur, Maharashtra)
                      </div>
                      <p className="text-stone-700 font-medium text-xs mt-0.5">{restaurant.tagline}</p>
                      <p className="text-stone-600 text-xs mt-1">
                        {restaurant.address}, {restaurant.city}, {restaurant.state} - {restaurant.pincode}
                      </p>
                      <p className="text-stone-600 text-xs">
                        {t.phone}: {restaurant.phone} · Email: {restaurant.email}
                      </p>
                    </div>

                    <div className="text-right border border-emerald-900/30 p-3 rounded-lg bg-emerald-50/50">
                      <div className="text-[11px] text-stone-500 uppercase font-semibold">{t.billNo}</div>
                      <div className="font-mono font-bold text-base text-emerald-950">{invoice.invoiceNumber}</div>
                      <div className="text-[11px] text-stone-500 uppercase font-semibold mt-1.5">{t.dateTime}</div>
                      <div className="text-xs text-stone-800 font-medium">{formatDateTime(invoice.dateTime)}</div>
                    </div>
                  </div>

                  {/* GSTIN and FSSAI Bar */}
                  <div className="mt-4 pt-3 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-stone-500">GSTIN:</span>{' '}
                      <span className="font-mono font-bold text-stone-900">{restaurant.gstin}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">FSSAI:</span>{' '}
                      <span className="font-mono font-medium text-stone-900">{restaurant.fssai}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">HSN/SAC:</span>{' '}
                      <span className="font-mono font-medium text-stone-900">9963 ({lang === 'mr' ? 'रेस्टॉरंट सेवा' : 'Restaurant Services'})</span>
                    </div>
                  </div>
                </div>

                {/* Billed To / Customer Section */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider mb-1">
                      {lang === 'mr' ? 'ग्राहक माहिती (Billed To):' : 'Billed To (Customer):'}
                    </div>
                    <div className="font-bold text-sm text-stone-900">{invoice.customerName}</div>
                    <div className="text-stone-600 text-xs">{invoice.customerPhone || 'Walk-in Guest'}</div>
                    <div className="text-stone-700 text-xs mt-1">
                      {t.table}: <span className="font-bold uppercase text-stone-900">{invoice.orderType}</span> ({invoice.tableNumber})
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider mb-1">
                      {t.cashier}:
                    </div>
                    <div className="text-stone-800 font-medium">{payeeName} ({lang === 'mr' ? 'सुरज खडके' : 'Suraj Khadke'})</div>
                    <div className="text-stone-800">
                      Payment Mode: <span className="font-bold uppercase text-emerald-900">{invoice.paymentMode}</span>
                    </div>
                    <div className="text-emerald-800 font-bold text-xs mt-1">
                      Status: {invoice.paymentStatus.toUpperCase()} (PAID)
                    </div>
                  </div>
                </div>

                {/* Detailed Table */}
                <table className="w-full text-left border-collapse border border-stone-300 mb-4 text-xs">
                  <thead>
                    <tr className="bg-emerald-950 text-white font-semibold">
                      <th className="p-2.5 border border-emerald-900 w-10 text-center">#</th>
                      <th className="p-2.5 border border-emerald-900">{t.itemCol}</th>
                      <th className="p-2.5 border border-emerald-900 text-center w-20">HSN/SAC</th>
                      <th className="p-2.5 border border-emerald-900 text-center w-14">{t.qtyCol}</th>
                      <th className="p-2.5 border border-emerald-900 text-right w-24">{t.rateCol} (₹)</th>
                      <th className="p-2.5 border border-emerald-900 text-right w-28">{t.totalCol} (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => {
                      const primaryName = lang === 'mr' ? (item.menuItem.marathiName || item.menuItem.name) : item.menuItem.name;
                      const secondaryName = lang === 'mr' ? item.menuItem.name : item.menuItem.marathiName;

                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                          <td className="p-2.5 border border-stone-300 text-center text-stone-500 font-mono">{idx + 1}</td>
                          <td className="p-2.5 border border-stone-300">
                            <span className="font-bold text-stone-950 block">
                              {primaryName}
                            </span>
                            {secondaryName && (
                              <span className="text-[11px] text-stone-600 block font-medium">
                                {secondaryName}
                              </span>
                            )}
                            {item.notes && <span className="block text-[10px] text-stone-500 italic">Note: {item.notes}</span>}
                          </td>
                          <td className="p-2.5 border border-stone-300 text-center font-mono text-stone-600">9963</td>
                          <td className="p-2.5 border border-stone-300 text-center font-bold font-mono">{item.quantity}</td>
                          <td className="p-2.5 border border-stone-300 text-right font-mono tabular-nums">{item.unitPrice.toFixed(2)}</td>
                          <td className="p-2.5 border border-stone-300 text-right font-mono font-bold tabular-nums">{item.itemTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Tax Breakdown & Total Summary */}
                <div className="grid grid-cols-12 gap-4 items-start mb-6">
                  {/* Left: Amount in Words & QR Code */}
                  <div className="col-span-7 space-y-3">
                    <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                      <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                        {t.amountInWords}:
                      </div>
                      <div className="text-stone-950 font-semibold mt-0.5 italic">
                        {numberToWordsINR(invoice.grandTotal)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      {qrDataUrl && (
                        <img 
                          src={qrDataUrl} 
                          alt="Suraj Khadke UPI QR" 
                          className="w-20 h-20 object-contain bg-white p-1 rounded-md border border-stone-300 shrink-0" 
                        />
                      )}
                      <div>
                        <div className="text-xs font-bold text-emerald-950 uppercase">{t.scanToPay}</div>
                        <div className="text-xs font-bold text-amber-900 mt-0.5">{t.payeeNameLabel}: {payeeName} ({lang === 'mr' ? 'सुरज खडके' : 'Suraj Khadke'})</div>
                        <div className="text-[11px] text-stone-700 font-mono">{t.upiIdLabel}: {upiId}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">{t.upiApps}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Calculations */}
                  <div className="col-span-5 bg-stone-50 p-4 rounded-xl border border-stone-300 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-700">
                      <span>{t.subtotalLabel}:</span>
                      <span className="font-mono font-semibold tabular-nums">{formatINR(invoice.subtotal)}</span>
                    </div>

                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-800 font-semibold">
                        <span>{t.discountLabel}:</span>
                        <span className="font-mono tabular-nums">-{formatINR(invoice.discountAmount)}</span>
                      </div>
                    )}

                    {invoice.applyGst && (
                      <>
                        <div className="flex justify-between text-stone-700">
                          <span>CGST @ 2.5%:</span>
                          <span className="font-mono tabular-nums">{formatINR(invoice.cgstAmount)}</span>
                        </div>
                        <div className="flex justify-between text-stone-700">
                          <span>SGST @ 2.5%:</span>
                          <span className="font-mono tabular-nums">{formatINR(invoice.sgstAmount)}</span>
                        </div>
                      </>
                    )}

                    {invoice.roundOffAmount !== 0 && (
                      <div className="flex justify-between text-stone-500 text-[11px]">
                        <span>{t.roundOff}:</span>
                        <span className="font-mono tabular-nums">
                          {invoice.roundOffAmount > 0 ? `+${invoice.roundOffAmount.toFixed(2)}` : invoice.roundOffAmount.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="border-t-2 border-stone-900 pt-2 flex justify-between items-center text-stone-950 font-bold text-sm">
                      <span>{t.grandTotalLabel}:</span>
                      <span className="font-mono tabular-nums text-emerald-950 text-lg font-black">{formatINR(invoice.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Stamp & Authorized Signatory Area */}
                <div className="border-t border-stone-300 pt-4 mt-6 flex justify-between items-end text-xs">
                  <div className="space-y-1 max-w-sm">
                    <div className="font-semibold text-stone-800">{t.termsTitle}:</div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      {t.terms1}<br />
                      {t.terms2}<br />
                      {t.terms3}
                    </p>
                  </div>

                  {/* Circular Restaurant Stamp / Seal */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-900/60 flex flex-col items-center justify-center p-1 text-center text-emerald-950 rotate-[-6deg] select-none">
                      <ShieldCheck className="w-5 h-5 mb-0.5 text-emerald-800" />
                      <span className="text-[8px] font-extrabold uppercase leading-tight font-display">
                        LATUR ROYAL DARBAR
                      </span>
                      <span className="text-[7px] tracking-widest font-mono text-emerald-900 font-extrabold mt-0.5">
                        ★ VERIFIED ★
                      </span>
                      <span className="text-[7px] font-mono">लातूर दरबार</span>
                    </div>
                    <div className="mt-2 text-stone-800 font-bold text-xs">
                      {t.authorizedSignatory}: {payeeName}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Action Footer (Hidden during print) */}
        <div className="bg-stone-50 border-t border-stone-200 px-4 py-3 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="text-xs text-stone-600">
            {lang === 'mr' ? 'थर्मल पावती किंवा A4 इनव्हॉइस निवडून प्रिंट किंवा PDF डाऊनलोड करा.' : 'Choose 80mm thermal receipt or A4 invoice to print or download PDF.'}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              title={t.printReceipt}
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{t.printReceipt}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              title={t.downloadPdf}
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>{isExporting ? t.generatingPdf : `${t.downloadPdf} (${receiptMode.toUpperCase()})`}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title={t.whatsappShare}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.whatsappShare}</span>
            </button>

            <button
              onClick={onNewBill}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm ml-1"
            >
              {t.newBillButton}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
