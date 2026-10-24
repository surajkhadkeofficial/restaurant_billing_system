export type FoodCategory =
  | 'All'
  | 'Starters'
  | 'Tandoor'
  | 'Main Course'
  | 'Biryani & Rice'
  | 'Breads'
  | 'Beverages'
  | 'Desserts'
  | 'Thalis';

export interface MenuItem {
  id: string;
  name: string;
  marathiName?: string;
  hindiName?: string;
  category: Exclude<FoodCategory, 'All'>;
  price: number;
  isVeg: boolean;
  spiceLevel: 'mild' | 'medium' | 'spicy';
  code: string;
  description?: string;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  unit: string;
  isAvailable: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  unitPrice: number;
  itemTotal: number;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type PaymentMode = 'cash' | 'upi' | 'card';
export type PaymentStatus = 'paid' | 'pending';

export interface RestaurantProfile {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  gstin: string;
  fssai: string;
  upiId: string;
  payeeName: string; // e.g. "Suraj Khadke"
  githubUrl: string; // e.g. "https://github.com/SurajKhadkeofficial"
  currencySymbol: string;
  taxRateCgst: number; // e.g. 2.5
  taxRateSgst: number; // e.g. 2.5
  serviceChargeRate: number; // e.g. 5
  footerNote: string;
  sealText?: string;
}

export interface BillInvoice {
  id: string;
  invoiceNumber: string;
  dateTime: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountAmount: number;
  applyGst: boolean;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  applyServiceCharge: boolean;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  roundOffAmount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  cashierName: string;
  restaurantSnapshot: RestaurantProfile;
  notes?: string;
}

export type StockLogReason =
  | 'bill_sale'
  | 'manual_restock'
  | 'spoilage'
  | 'adjustment'
  | 'initial_setup';

export interface StockLog {
  id: string;
  itemId: string;
  itemName: string;
  changeAmount: number;
  previousStock: number;
  newStock: number;
  reason: StockLogReason;
  referenceId?: string; // invoiceNumber or PO number
  timestamp: string;
  notes?: string;
}
