# SwaadPOS - Modern Indian Restaurant Billing, Tax Invoice & Inventory Management System

A high-performance Point of Sale (POS), billing, and real-time inventory application for Indian restaurants. Features quick table/customer bill generation, curated Indian food menu catalog, real-time GST (CGST/SGST) computation, stock tracking with automatic deduction on billing, low-stock threshold alerts, manual restocking, and downloadable/printable small thermal receipts (80mm/58mm) and formal GST tax invoices with restaurant seals.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed and enhanced with the new Inventory Management requirements:

- **Aesthetic Direction**: Contemporary Indian dining theme blending deep royal emerald (`#064e3b`), warm burnished copper (`#c2410c` / `#b45309`), saffron accent gold (`#d97706`), and warm ivory linen canvas (`#fcfbf9`).
- **Invoice & Receipt Format**: Dual-mode engine generating both a formal GST tax invoice (with legal GSTIN, restaurant seal/signature, itemized tax rates) and an ultra-compact 80mm/58mm thermal receipt layout optimized for instant thermal roll printing and one-click PDF export.
- **Inventory Management Module (New)**:
  - Each food item has tracked stock levels (`stockQuantity`, `lowStockThreshold`, `unit`, `isInventoryTracked`).
  - Automatic stock deduction upon bill generation and order confirmation.
  - Low-stock warning banner and alert badges when stock falls below the configured threshold.
  - Quick manual stock adjuster (+5, +10, -1, direct numeric override) and restock history log.
  - Out-of-stock protection preventing cashiers from overselling exhausted dishes.
- **Menu Catalog**: Preloaded with authentic Indian culinary categories (Tandoor & Starters, Main Curries, Biryani & Rice, Breads/Naan, Beverages, Desserts, and Thalis) with spice indicators, veg/non-veg markers, prep notes, price customization, and stock controls.
- **Multi-Tenant Restaurant Profiles**: Quick restaurant switch/login with custom credentials, address, GSTIN, FSSAI license number, contact info, and custom receipt footer notes.

---

## 1. Overview & Core Concept

- **What It Does**: Enables restaurant managers and cashiers to seamlessly take dine-in, takeaway, and delivery orders; select dishes by category or quick search; track real-time kitchen inventory with automatic stock depletion on every generated bill; assign customer names, phone numbers, and table numbers; calculate subtotal, CGST, SGST, service charges, and discounts; accept multi-mode payments (UPI QR, Cash, Card); and instantly download or print high-fidelity receipts in small thermal format or formal GST invoices.
- **Target Audience / Persona**: Restaurant owners, cashier captains, kitchen inventory managers, and billing desk staff running Indian restaurants, cafes, dhabas, or cloud kitchens.
- **Key Value**: Delivers an end-to-end operational engine uniting fast counter billing with automated stock depletion, low-stock warnings, and compliant Indian GST invoices.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Authentication & Restaurant Profile Setup**: Cashier or owner logs in / selects the active restaurant profile (pre-configured with GSTIN, FSSAI, header details, and UPI ID for instant QR code generation).
2. **Speed Billing & Order Desk**:
   - Left Pane: Interactive menu browser with category chips (Tandoori, Curries, Breads, Biryani, Drinks, Desserts), search by item or code, veg/non-veg toggle, real-time stock indicator (e.g. "8 left", "Out of stock"), and one-tap cart addition.
   - Right Pane: Active Bill / KOT order summary showing customer name, phone number, table number, order type (Dine-in / Takeaway / Delivery), quantity modifiers, item-level notes, and live price breakdown.
3. **Discount & Tax Computation**: Live calculation of 2.5% CGST + 2.5% SGST (5% restaurant GST standard in India), optional service charge, discount coupons/flat rupee discounts, and automated round-off.
4. **Checkout & Payment**: Selection of payment method (Cash, Card, UPI with dynamically rendered UPI QR code for the exact bill total).
5. **Bill Generation, Printing & PDF Download**:
   - Preview modal with toggle between **Small 80mm Thermal Slip** and **Formal A4 Tax Invoice**.
   - Immediate stock deduction in inventory for all billed quantities.
   - One-click browser native print with media styles stripped of UI chrome.
   - Vector-crisp client-side PDF export ready for sharing with customers via WhatsApp or saving locally.
6. **Inventory Management Module (Dedicated View)**:
   - Top Stat Bar: Total items tracked, items with healthy stock, low stock items requiring attention, and out-of-stock items.
   - Alert Banner: Prominently lists items currently at or below their low-stock threshold with a 1-click "Quick Restock" button.
   - Stock Table: Item name, category, current quantity, threshold, status, and quick increment/decrement buttons + direct input field.
   - Restock Drawer/Modal: Allows setting custom initial stock, updating thresholds, or adding a batch restock with notes.
7. **Menu & Food Item Management**: Dedicated modal/drawer to add new Indian dishes, modify prices, assign categories, and set initial stock & thresholds.
8. **Billing History & Day Settlement Ledger**: Past bills archive with status tags (Paid, Void, Pending), search by customer/bill number, and one-tap reprint/re-download.

### Visual Identity & Theme
- **Aesthetic Direction**: Contemporary Royal Indian Dining. Deep emerald green structural headers, warm brushed copper borders, subtle saffron gold accents, and rich off-white textured surfaces.
- **Color Palette**:
  - Neutral Canvas: `#fcfbf9` (Warm ivory) and `#f4f1ea` (Soft parchment)
  - Structural Dark: `#064e3b` (Deep emerald green) and `#022c22` (Midnight forest)
  - Accent Tones: `#c2410c` (Burnished copper), `#b45309` (Warm bronze), `#d97706` (Saffron gold)
  - Semantic Status: `#15803d` (Veg indicator / In Stock / Paid), `#b45309` (Low Stock Alert), `#b91c1c` (Out of Stock / Non-veg), `#64748b` (Archived)
- **Typography**:
  - Display & Wordmarks: `Plus Jakarta Sans` / `Outfit`
  - Body & Form Controls: `DM Sans`
  - Financial Figures, Bill Numbers, Stock Quantities: Tabular monospace figures (`font-mono tabular-nums`)
- **Zero-Pill Discipline & Anti-Slop**:
  - Clean unboxed category tabs with subtle borders; no candy pill badges.
  - Clear, legible stock status badges with text labels (`In Stock`, `Low Stock (4 left)`, `Depleted`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-time Stock Deduction on Bill Finalization**
  - *Chosen Approach*: Stock is automatically deducted when a bill is generated/settled. If an order in progress requests more than the available stock, a clear warning is displayed and cashier can override or adjust.
  - *Why*: Prevents inventory drift and guarantees accurate end-of-day stock balances.
- **Decision 2: Low-Stock Threshold Alert System**
  - *Chosen Approach*: User-configurable threshold per item (e.g. Biryani at 5 portions, Butter Chicken at 6 portions). An alert drawer/bar triggers automatically when any item drops to or below its threshold.
  - *Why*: Allows chefs and restaurant managers to prep ingredients or restock supplies before the dinner rush hits.
- **Decision 3: Receipt Generation Architecture (HTML/CSS Print + Direct PDF Export)**
  - *Chosen Approach*: Hybrid approach using tailored CSS `@media print` rules for instant thermal printer compatibility (58mm/80mm roll dimensions with monospace alignment and dashed tear lines) alongside an in-browser PDF download engine.
  - *Why*: Allows instantaneous printing to real thermal ESC/POS or desk printers without drivers or external paid cloud APIs, while letting users download a pristine PDF file with a single click.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SwaadPOS Application                            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌───────────────────┬─────────────┴─────────────┬──────────────────┐
     │                   │                           │                  │
┌────▼─────────────┐ ┌───▼──────────────────┐ ┌──────▼────────────┐ ┌───▼──────────────┐
│ Restaurant Header│ │ Speed Billing Desk   │ │ Inventory Module  │ │ Menu & Bill Ledger │
│ - Active Profile │ │ - Category & Search  │ │ - Real-time Stock │ │ - Add/Edit Dishes  │
│ - Staff / Cashier│ │ - Cart & Table/Phone │ │ - Low-Stock Alerts│ │ - Past Invoices    │
│ - Date & Shift   │ │ - GST & Payment Mode │ │ - Manual Restock  │ │ - Day Settlement   │
└──────────────────┘ └───────────┬──────────┘ └──────┬────────────┘ └──────────────────┘
                                 │                   │
                                 └───► Deduct Stock ◄┘
                                       │
                             ┌─────────▼──────────────┐
                             │  Print & Receipt Modal │
                             │ - 80mm Thermal Slip    │
                             │ - Formal A4 GST Invoice│
                             │ - Download PDF Action  │
                             └────────────────────────┘
```

### Key Data Entities
- **RestaurantProfile**: `id`, `name`, `tagline`, `address`, `phone`, `gstin`, `fssai`, `upiId`, `currencySymbol`, `footerNote`.
- **MenuItem**: `id`, `name`, `category`, `price`, `isVeg`, `spiceLevel`, `description`, `code`, `isAvailable`, `stockQuantity`, `lowStockThreshold`, `trackInventory`, `unit`.
- **CartItem**: `menuItem`, `quantity`, `customizationNotes`, `unitPrice`, `itemTotal`.
- **BillInvoice**: `invoiceNumber`, `dateTime`, `customerName`, `customerPhone`, `tableNumber`, `orderType`, `items`, `subtotal`, `cgstAmount`, `sgstAmount`, `discountAmount`, `serviceChargeAmount`, `totalAmount`, `paymentMode`, `paymentStatus`.
- **StockLog**: `id`, `itemId`, `itemName`, `changeAmount`, `previousStock`, `newStock`, `reason` (`bill_sale` | `manual_restock` | `spoilage` | `initial_setup`), `timestamp`, `billNumber`.
