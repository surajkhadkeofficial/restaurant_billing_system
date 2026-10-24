/**
 * Utility formatters for Indian Restaurant Billing, Tax Calculation, and Currency
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-IN').format(val);
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = sequence.toString().padStart(4, '0');
  return `INV-${year}-${padded}`;
}

/**
 * Converts numeric amount to Indian English words (e.g. 1723 -> One Thousand Seven Hundred Twenty-Three Rupees Only)
 */
export function numberToWordsINR(num: number): string {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero Rupees Only';

  function convertGroup(n: number): string {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else if (n > 0) {
      str += a[n];
    }
    return str.trim();
  }

  const crore = Math.floor(rounded / 10000000);
  let rem = rounded % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundred = rem;

  let res = '';
  if (crore > 0) res += convertGroup(crore) + ' Crore ';
  if (lakh > 0) res += convertGroup(lakh) + ' Lakh ';
  if (thousand > 0) res += convertGroup(thousand) + ' Thousand ';
  if (hundred > 0) res += convertGroup(hundred);

  return (res.trim() + ' Rupees Only').replace(/\s+/g, ' ');
}

export function generateUpiUri(upiId: string, payeeName: string, amount: number, billNo: string): string {
  const cleanUpi = (upiId || 'surajkhadke@upi').trim();
  const cleanName = encodeURIComponent((payeeName || 'Suraj Khadke').trim());
  const formattedAmt = amount.toFixed(2);
  const note = encodeURIComponent(`Latur Royal Darbar Bill ${billNo}`);
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${formattedAmt}&cu=INR&tn=${note}`;
}
