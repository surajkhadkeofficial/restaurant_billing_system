import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  User, 
  Phone, 
  RotateCcw, 
  AlertCircle
} from 'lucide-react';
import { 
  MenuItem, 
  CartItem, 
  FoodCategory, 
  OrderType, 
  PaymentMode, 
  RestaurantProfile, 
  BillInvoice 
} from '../types';
import { VegBadge, SpiceLevelIndicator } from './FoodBadge';
import { formatINR, generateInvoiceNumber } from '../utils/formatters';
import { Language, translations } from '../utils/translations';

interface BillingDeskProps {
  menuItems: MenuItem[];
  currentRestaurant: RestaurantProfile;
  cashierName: string;
  onGenerateBill: (invoice: BillInvoice) => void;
  nextInvoiceSequence: number;
  lang: Language;
}

export const BillingDesk: React.FC<BillingDeskProps> = ({
  menuItems,
  currentRestaurant,
  cashierName,
  onGenerateBill,
  nextInvoiceSequence,
  lang,
}) => {
  const t = translations[lang];

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Customer & Order Details
  const [customerName, setCustomerName] = useState(lang === 'mr' ? 'ग्राहक (Walk-in)' : 'Walk-in Guest');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState(lang === 'mr' ? 'टेबल १' : 'Table T-01');

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Taxes & Discounts
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [applyGst, setApplyGst] = useState<boolean>(true);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [orderNotes, setOrderNotes] = useState('');

  // Validation alert
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Category labels based on language
  const categoryMap: { key: FoodCategory; label: string }[] = [
    { key: 'All', label: t.catAll },
    { key: 'Starters', label: t.catStarters },
    { key: 'Tandoor', label: t.catTandoor },
    { key: 'Main Course', label: t.catMainCourse },
    { key: 'Biryani & Rice', label: t.catBiryani },
    { key: 'Breads', label: t.catBreads },
    { key: 'Beverages', label: t.catBeverages },
    { key: 'Desserts', label: t.catDesserts },
    { key: 'Thalis', label: t.catThalis },
  ];

  const quickTables = lang === 'mr' 
    ? ['टेबल १', 'टेबल २', 'टेबल ३', 'टेबल ४', 'टेबल ५', 'टेबल ६', 'फॅमिली हॉल', 'गार्डन']
    : ['Table T-01', 'Table T-02', 'Table T-03', 'Table T-04', 'Table T-05', 'Table T-06', 'Family Hall', 'Garden'];

  // Filtered menu
  const filteredMenu = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.marathiName && item.marathiName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.hindiName && item.hindiName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    let matchesDiet = true;
    if (dietaryFilter === 'veg') matchesDiet = item.isVeg;
    if (dietaryFilter === 'non-veg') matchesDiet = !item.isVeg;

    return matchesSearch && matchesCategory && matchesDiet;
  });

  const addToCart = (item: MenuItem) => {
    const existing = cartItems.find((ci) => ci.menuItem.id === item.id);
    if (existing) {
      setCartItems(
        cartItems.map((ci) =>
          ci.menuItem.id === item.id
            ? {
                ...ci,
                quantity: ci.quantity + 1,
                itemTotal: (ci.quantity + 1) * ci.unitPrice,
              }
            : ci
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          menuItem: item,
          quantity: 1,
          unitPrice: item.price,
          itemTotal: item.price,
        },
      ]);
    }
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems(cartItems.filter((ci) => ci.menuItem.id !== itemId));
      return;
    }

    setCartItems(
      cartItems.map((ci) =>
        ci.menuItem.id === itemId
          ? {
              ...ci,
              quantity: newQty,
              itemTotal: newQty * ci.unitPrice,
            }
          : ci
      )
    );
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setCartItems(
      cartItems.map((ci) =>
        ci.menuItem.id === itemId ? { ...ci, notes } : ci
      )
    );
  };

  const clearCart = () => {
    if (cartItems.length > 0 && window.confirm(t.resetCartConfirm)) {
      setCartItems([]);
      setDiscountValue(0);
      setOrderNotes('');
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);

  const discountAmount =
    discountType === 'percentage'
      ? (subtotal * Math.min(discountValue, 100)) / 100
      : Math.min(discountValue, subtotal);

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const cgstRate = currentRestaurant.taxRateCgst || 2.5;
  const sgstRate = currentRestaurant.taxRateSgst || 2.5;

  const cgstAmount = applyGst ? (taxableAmount * cgstRate) / 100 : 0;
  const sgstAmount = applyGst ? (taxableAmount * sgstRate) / 100 : 0;

  const rawTotal = taxableAmount + cgstAmount + sgstAmount;
  const roundedGrandTotal = Math.round(rawTotal);
  const roundOffAmount = roundedGrandTotal - rawTotal;

  const handleSettleBill = () => {
    if (cartItems.length === 0) {
      setAlertMessage(t.selectDishAlert);
      setTimeout(() => setAlertMessage(null), 3500);
      return;
    }

    const invoiceNumber = generateInvoiceNumber(nextInvoiceSequence);

    const invoice: BillInvoice = {
      id: `bill_${Date.now()}`,
      invoiceNumber,
      dateTime: new Date().toISOString(),
      customerName: customerName.trim() || (lang === 'mr' ? 'ग्राहक (Guest)' : 'Guest'),
      customerPhone: customerPhone.trim(),
      tableNumber: orderType === 'dine-in' ? tableNumber : orderType === 'takeaway' ? (lang === 'mr' ? 'पार्सल (Takeaway)' : 'Takeaway') : (lang === 'mr' ? 'डिलिव्हरी' : 'Delivery'),
      orderType,
      items: cartItems,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      applyGst,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      applyServiceCharge: false,
      serviceChargeRate: 0,
      serviceChargeAmount: 0,
      roundOffAmount,
      grandTotal: roundedGrandTotal,
      paymentMode,
      paymentStatus: 'paid',
      cashierName: currentRestaurant.payeeName || 'Suraj Khadke',
      restaurantSnapshot: currentRestaurant,
      notes: orderNotes,
    };

    onGenerateBill(invoice);

    // Reset current active cart
    setCartItems([]);
    setDiscountValue(0);
    setOrderNotes('');
    setCustomerName(lang === 'mr' ? 'ग्राहक (Walk-in)' : 'Walk-in Guest');
    setCustomerPhone('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Food Catalog Explorer (col-span-7) */}
      <div className="lg:col-span-7 space-y-4">
        
        {alertMessage && (
          <div className="p-3.5 bg-red-100 border border-red-300 text-red-950 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{alertMessage}</span>
          </div>
        )}

        {/* Clean, readable Search and Dietary Tabs */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchDishPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white text-stone-900 font-medium"
              />
            </div>

            {/* Veg / Non-Veg filter tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg shrink-0">
              <button
                onClick={() => setDietaryFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  dietaryFilter === 'all'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.allDishes}
              </button>
              <button
                onClick={() => setDietaryFilter('veg')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-700 hover:text-emerald-900'
                }`}
              >
                <VegBadge isVeg={true} size="sm" />
                {t.pureVeg}
              </button>
              <button
                onClick={() => setDietaryFilter('non-veg')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-red-800 text-white shadow-xs'
                    : 'text-stone-700 hover:text-red-900'
                }`}
              >
                <VegBadge isVeg={false} size="sm" />
                {t.nonVeg}
              </button>
            </div>
          </div>

          {/* Category Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {categoryMap.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-emerald-950 text-amber-300 shadow-sm border border-emerald-900'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clean, Readable Menu Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
          {filteredMenu.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-stone-500 bg-white rounded-xl border border-stone-200 text-sm font-medium">
              {t.noDishesFound}
            </div>
          ) : (
            filteredMenu.map((item) => {
              const cartQuantity = cartItems.find((ci) => ci.menuItem.id === item.id)?.quantity || 0;
              const primaryName = lang === 'mr' ? (item.marathiName || item.name) : item.name;
              const secondaryName = lang === 'mr' ? item.name : (item.marathiName || '');

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs hover:border-emerald-700 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <VegBadge isVeg={item.isVeg} size="md" />
                        <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                          {item.code}
                        </span>
                      </div>
                      <SpiceLevelIndicator level={item.spiceLevel} />
                    </div>

                    {/* Dish Name: adapted based on current language */}
                    <h3 className="font-bold text-stone-950 text-base leading-snug">
                      {primaryName}
                    </h3>
                    {secondaryName && (
                      <div className="text-xs text-stone-500 font-medium mt-0.5">
                        {secondaryName}
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs text-stone-600 mt-1.5 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Add */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="font-mono font-extrabold text-lg text-emerald-950 tabular-nums">
                      {formatINR(item.price)}
                    </div>

                    {cartQuantity > 0 ? (
                      <div className="flex items-center gap-2 bg-emerald-950 text-white rounded-lg p-1 px-2 shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, cartQuantity - 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-emerald-800 rounded text-amber-300 font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-sm px-1 text-white min-w-[20px] text-center">
                          {cartQuantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, cartQuantity + 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-emerald-800 rounded text-amber-300 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="px-4 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t.addButton}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Bill Cart (col-span-5) */}
      <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 shadow-md overflow-hidden flex flex-col">
        
        {/* Bill Cart Header */}
        <div className="bg-emerald-950 text-white p-4 border-b border-emerald-900">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <span className="font-display font-extrabold text-base">{t.activeCartTitle}</span>
            </div>
            <span className="font-mono text-xs text-amber-300 bg-emerald-900 px-2.5 py-1 rounded-md border border-emerald-800 font-bold">
              {t.seqNumber} {generateInvoiceNumber(nextInvoiceSequence)}
            </span>
          </div>

          {/* Dine-in / Takeaway / Delivery Switch */}
          <div className="grid grid-cols-3 gap-1.5 bg-emerald-900/80 p-1 rounded-lg text-xs font-semibold">
            {[
              { id: 'dine-in', label: t.orderDineIn },
              { id: 'takeaway', label: t.orderTakeaway },
              { id: 'delivery', label: t.orderDelivery },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setOrderType(mode.id as OrderType)}
                className={`py-1.5 text-center rounded-md transition-colors ${
                  orderType === mode.id
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer & Table details */}
        <div className="p-3.5 bg-stone-50 border-b border-stone-200 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                {t.customerNameLabel}
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={lang === 'mr' ? 'ग्राहकाचे नाव' : 'Guest Name'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                {t.customerPhoneLabel}
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="+91 98XXX XXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                />
              </div>
            </div>
          </div>

          {orderType === 'dine-in' && (
            <div>
              <label className="text-[11px] font-bold text-stone-600 block mb-1">
                {t.tableSelectLabel}
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {quickTables.map((tbl) => (
                  <button
                    key={tbl}
                    onClick={() => setTableNumber(tbl)}
                    className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap font-medium border transition-colors ${
                      tableNumber === tbl
                        ? 'bg-emerald-950 text-amber-300 border-emerald-950 font-bold'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Itemized List */}
        <div className="flex-1 overflow-y-auto max-h-64 p-3.5 space-y-2.5 divide-y divide-stone-100">
          {cartItems.length === 0 ? (
            <div className="py-10 text-center text-stone-500 text-xs font-medium">
              {t.emptyCartNotice}
            </div>
          ) : (
            cartItems.map((item) => {
              const displayName = lang === 'mr' ? (item.menuItem.marathiName || item.menuItem.name) : item.menuItem.name;
              const subName = lang === 'mr' ? item.menuItem.name : item.menuItem.marathiName;

              return (
                <div key={item.menuItem.id} className="pt-2 first:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="mt-0.5">
                        <VegBadge isVeg={item.menuItem.isVeg} size="sm" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-950">
                          {displayName}
                        </div>
                        {subName && (
                          <div className="text-[11px] text-stone-600 font-medium">
                            {subName}
                          </div>
                        )}
                        <div className="text-[11px] text-stone-500 font-mono">
                          {formatINR(item.unitPrice)} × {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center hover:bg-stone-200 rounded text-stone-800 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center hover:bg-stone-200 rounded text-stone-800 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="font-mono font-bold text-xs text-stone-950 tabular-nums w-16 text-right">
                        {formatINR(item.itemTotal)}
                      </div>

                      <button
                        onClick={() => updateQuantity(item.menuItem.id, 0)}
                        className="text-stone-400 hover:text-red-700 p-1 transition-colors"
                        title={lang === 'mr' ? 'काढून टाका' : 'Remove'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder={t.notesPlaceholder}
                    value={item.notes || ''}
                    onChange={(e) => updateItemNotes(item.menuItem.id, e.target.value)}
                    className="w-full mt-1 px-2.5 py-1 text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:border-stone-400 font-medium"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Calculations Box */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2 text-xs">
          
          <div className="flex justify-between text-stone-700 font-medium">
            <span>{t.subtotalLabel}:</span>
            <span className="font-mono font-bold tabular-nums">{formatINR(subtotal)}</span>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200">
            <span className="text-stone-700 font-medium">{t.discountLabel}:</span>
            <div className="flex items-center gap-1.5">
              {[0, 5, 10].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    setDiscountType('percentage');
                    setDiscountValue(val);
                  }}
                  className={`px-2 py-0.5 text-xs rounded-md font-mono font-semibold ${
                    discountType === 'percentage' && discountValue === val
                      ? 'bg-emerald-900 text-white'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  {val}%
                </button>
              ))}
              <span className="font-mono font-bold text-emerald-800 tabular-nums w-14 text-right">
                -{formatINR(discountAmount)}
              </span>
            </div>
          </div>

          {/* GST */}
          <div className="flex items-center justify-between text-stone-700 pt-1 border-t border-stone-200">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={applyGst}
                onChange={(e) => setApplyGst(e.target.checked)}
                className="rounded text-emerald-800"
              />
              <span>{t.gstLabel}</span>
            </label>
            <span className="font-mono font-bold tabular-nums">
              {formatINR(cgstAmount + sgstAmount)}
            </span>
          </div>

          {/* Grand Total */}
          <div className="border-t-2 border-stone-900 pt-2.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase font-bold text-stone-600">{t.grandTotalLabel}</div>
              <div className="text-2xl font-black text-emerald-950 font-display tabular-nums">
                {formatINR(roundedGrandTotal)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="flex items-center gap-1 bg-stone-200 p-1 rounded-lg">
              {[
                { id: 'upi', label: 'UPI QR' },
                { id: 'cash', label: lang === 'mr' ? 'कॅश (Cash)' : 'Cash' },
                { id: 'card', label: lang === 'mr' ? 'कार्ड (Card)' : 'Card' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMode(m.id as PaymentMode)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    paymentMode === m.id
                      ? 'bg-emerald-950 text-amber-300 shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Bill Button */}
        <div className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2">
          <button
            onClick={clearCart}
            disabled={cartItems.length === 0}
            className="p-2.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-stone-200 disabled:opacity-40"
            title={lang === 'mr' ? 'रद्द करा' : 'Reset Cart'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSettleBill}
            disabled={cartItems.length === 0}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-950 hover:bg-emerald-900 active:scale-[0.99] text-amber-300 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>{t.generateBillButton}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
