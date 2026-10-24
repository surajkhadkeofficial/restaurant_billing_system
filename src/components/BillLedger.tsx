import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  FileSpreadsheet
} from 'lucide-react';
import { BillInvoice } from '../types';
import { formatINR, formatDateTime } from '../utils/formatters';
import { Language, translations } from '../utils/translations';

interface BillLedgerProps {
  invoices: BillInvoice[];
  onViewInvoice: (invoice: BillInvoice) => void;
  lang: Language;
}

export const BillLedger: React.FC<BillLedgerProps> = ({
  invoices,
  onViewInvoice,
  lang,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'cash' | 'upi' | 'card'>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerPhone.includes(searchTerm) ||
      inv.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment = paymentFilter === 'all' || inv.paymentMode === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalGst = invoices.reduce((acc, inv) => acc + (inv.cgstAmount + inv.sgstAmount), 0);
  const cashTotal = invoices.filter((i) => i.paymentMode === 'cash').reduce((acc, i) => acc + i.grandTotal, 0);
  const upiTotal = invoices.filter((i) => i.paymentMode === 'upi').reduce((acc, i) => acc + i.grandTotal, 0);

  const handleExportCsv = () => {
    const headers = lang === 'mr' 
      ? ['बिल क्रमांक', 'दिनांक व वेळ', 'ग्राहकाचे नाव', 'फोन', 'टेबल', 'प्रकार', 'उपबेरीज', 'CGST', 'SGST', 'एकूण रक्कम', 'पेमेंट']
      : ['Invoice Number', 'Date & Time', 'Customer Name', 'Phone', 'Table', 'Order Type', 'Subtotal', 'CGST', 'SGST', 'Grand Total', 'Payment Mode'];

    const rows = invoices.map(i => [
      i.invoiceNumber,
      `"${formatDateTime(i.dateTime)}"`,
      `"${i.customerName}"`,
      `"${i.customerPhone || ''}"`,
      `"${i.tableNumber}"`,
      i.orderType,
      i.subtotal,
      i.cgstAmount,
      i.sgstAmount,
      i.grandTotal,
      i.paymentMode,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${t.settlementCsvName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Day Settlement KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">{t.totalRevenueLabel}</span>
          <div className="mt-1.5 font-mono font-black text-2xl text-emerald-950 tabular-nums">
            {formatINR(totalRevenue)}
          </div>
          <span className="text-xs text-stone-500 font-mono mt-1 block font-medium">
            {invoices.length} {lang === 'mr' ? 'बिले तयार झाली' : 'bills settled'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">{t.gstCollectedLabel}</span>
          <div className="mt-1.5 font-mono font-black text-xl text-stone-900 tabular-nums">
            {formatINR(totalGst)}
          </div>
          <span className="text-xs text-stone-500 block mt-1">CGST 2.5% + SGST 2.5%</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
            {t.upiTotalLabel}
          </span>
          <div className="mt-1.5 font-mono font-black text-xl text-emerald-950 tabular-nums">
            {formatINR(upiTotal)}
          </div>
          <span className="text-xs text-stone-500 block mt-1 font-mono">
            {invoices.filter((i) => i.paymentMode === 'upi').length} {lang === 'mr' ? 'ट्रान्झॅक्शन्स' : 'transactions'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
            {t.cashTotalLabel}
          </span>
          <div className="mt-1.5 font-mono font-black text-xl text-stone-900 tabular-nums">
            {formatINR(cashTotal)}
          </div>
          <span className="text-xs text-stone-500 block mt-1 font-mono">
            {invoices.filter((i) => i.paymentMode === 'cash').length} {lang === 'mr' ? 'ट्रान्झॅक्शन्स' : 'transactions'}
          </span>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchLedgerPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-stone-200 p-0.5 rounded-lg text-xs font-bold">
              {[
                { id: 'all', label: lang === 'mr' ? 'सर्व' : 'All' },
                { id: 'upi', label: 'UPI' },
                { id: 'cash', label: lang === 'mr' ? 'कॅश' : 'Cash' },
                { id: 'card', label: lang === 'mr' ? 'कार्ड' : 'Card' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setPaymentFilter(mode.id as any)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    paymentFilter === mode.id
                      ? 'bg-white text-stone-950 shadow-xs'
                      : 'text-stone-700 hover:text-stone-950'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 border border-stone-300 transition-colors shadow-2xs"
              title="Export CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
              <span>{t.exportCsvButton}</span>
            </button>
          </div>
        </div>

        {/* Ledger Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 border-b border-stone-200 font-bold">
                <th className="py-3 px-4">{t.billNo}</th>
                <th className="py-3 px-4">{t.dateTime}</th>
                <th className="py-3 px-4">{t.customer} & {t.phone}</th>
                <th className="py-3 px-4">{t.table}</th>
                <th className="py-3 px-4 text-right">{t.grandTotalLabel} (₹)</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-stone-500 font-medium">
                    {t.noBillsFound}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-950 text-sm">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-stone-600">
                      {formatDateTime(inv.dateTime)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-950">{inv.customerName}</div>
                      {inv.customerPhone && (
                        <div className="text-[11px] text-stone-500 font-mono mt-0.5">{inv.customerPhone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-900">{inv.tableNumber}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-extrabold tabular-nums text-stone-950 text-sm">
                      {formatINR(inv.grandTotal)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-xs font-bold uppercase px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300">
                        {inv.paymentMode}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ml-auto"
                        title="View & Download PDF"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.viewPrintButton}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
