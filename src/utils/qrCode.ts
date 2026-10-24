import QRCode from 'qrcode';

/**
 * Generates an in-memory base64 Data URL for a UPI payment string.
 * Completely local (no external network/CORS), preventing html2canvas canvas-tainting issues.
 */
export async function generateQrDataUrl(text: string, size = 160): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate local QR code data URL', err);
    return '';
  }
}
