# Latur Royal Darbar (लातूर रॉयल दरबार)
### Modern Indian Restaurant POS, Billing & GST Tax Invoice System

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Netlify Status](https://img.shields.io/badge/Netlify-Ready-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

**Developer & Author:** [Suraj Khadke](https://github.com/SurajKhadkeofficial)  
**Official GitHub:** [@SurajKhadkeofficial](https://github.com/SurajKhadkeofficial)  
**Email:** surajvitthalkhadke07@gmail.com  

---

## 📌 Overview

**Latur Royal Darbar** is an enterprise-grade, high-speed Point-of-Sale (POS) and billing web application engineered specifically for authentic Indian restaurants. It replaces clunky legacy billing machines with a clean, human-designed reactive interface capable of rapid order settlement, tax calculations, live UPI payments, and dual-format receipt printing.

The application is completely client-side resilient, storing data locally with zero-latency `localStorage` persistence, and features an integrated **React Error Boundary** to guarantee 100% demo stability.

---

## ✨ Key Features

- **🌐 Bilingual Staff Experience (मराठी & English)**:
  - Instant one-click toggle in the header between Marathi (`mr`) and English (`en`).
  - Full localization across billing categories, table selectors, dish descriptions, tax invoice headers, and audit metrics.
  - Persistent language preference remembered across reloads.

- **🖨️ Dual Receipt Printing Modes**:
  - **80mm Thermal Receipt**: Compact slip format designed for kitchen roll printers and customer cash memos.
  - **A4 Formal Tax Invoice**: Comprehensive GST tax invoice with authorized restaurant verification seal, GSTIN breakdown, and customer details.

- **📱 Dynamic Suraj Khadke UPI QR Code**:
  - Generates live, in-memory UPI QR codes for each invoice.
  - Payee: **Suraj Khadke** (`surajkhadke@upi`).
  - Encoded with exact grand total and invoice reference for fast mobile payment scanning (PhonePe, GPay, Paytm).

- **📥 Reliable Desktop PDF Downloads**:
  - Equipped with `jsPDF` and `html2canvas`.
  - Solves modern CSS `oklch()` color syntax crashes in Tailwind v4 through custom DOM cloning sanitization.
  - Features an automated fail-safe direct-vector PDF generator ensuring instant downloads on any desktop browser.

- **🍽️ Authentic Indian Menu Catalog**:
  - Preloaded delicacies across Starters, Tandoor, Main Course, Biryani, Breads, Beverages, and Special Thalis.
  - Real-time catalog manager for adding, updating, and toggling dishes with spice ratings and dietary badges.
  - Non-blocking two-step inline delete confirmations.

- **📊 Audit Transaction Ledger**:
  - Real-time KPI summaries: Total Revenue, Total GST Collected, Cash vs. UPI payment breakdown.
  - Null-safe instant search and payment mode filtering.
  - One-click CSV export for accounting and tax audits.

- **📄 Built-in Project Documentation Generator**:
  - Integrated multi-page PDF generator explaining the system architecture, mathematical tax formulas, and module breakdowns.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Reactive frontend UI library |
| **TypeScript** | Static typing and interfaces |
| **Vite 8** | Modern, ultra-fast build tool |
| **Tailwind CSS v4** | Modern styling framework |
| **Lucide React** | Clean vector iconography |
| **jsPDF & html2canvas** | Dual-pipeline client-side PDF compilation |
| **qrcode** | In-memory zero-CORS QR code data URI generation |
| **Netlify** | Production static site deployment with SPA routing |

---

## 🗂️ Project Structure

```text
├── netlify.toml                # Netlify build & redirect rules
├── public/
│   ├── _redirects              # Static SPA routing fallback
│   └── Latur_Royal_Darbar...pdf # Bundled documentation PDF
├── src/
│   ├── App.tsx                 # Central state coordinator & ErrorBoundary
│   ├── components/
│   │   ├── BillingDesk.tsx     # Cashier workstation & calculation engine
│   │   ├── Header.tsx          # 3-Zone top navigation & language toggle
│   │   ├── ReceiptModal.tsx    # 80mm & A4 receipt modal with UPI QR
│   │   ├── MenuManager.tsx     # Menu catalog CRUD with bilingual naming
│   │   ├── BillLedger.tsx      # Financial audit ledger & CSV export
│   │   ├── RestaurantSettingsModal.tsx # Profile, GST, and UPI settings
│   │   ├── FoodBadge.tsx       # Veg/Non-Veg & spice indicators
│   │   └── ErrorBoundary.tsx   # React crash-guard shield
│   ├── data/
│   │   └── initialData.ts      # Preloaded restaurants, menus & bills
│   ├── types/
│   │   └── index.ts            # TypeScript data models
│   └── utils/
│       ├── documentationPdf.ts # Multi-page project doc PDF generator
│       ├── formatters.ts       # INR currency, date, and number-to-words
│       ├── pdfExport.ts        # Desktop PDF export with vector fallback
│       ├── qrCode.ts           # In-memory QR code generator
│       └── translations.ts     # Marathi & English bilingual dictionary
├── index.html                  # HTML entry point
├── package.json                # Project dependencies and build scripts
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SurajKhadkeofficial/latur-royal-darbar.git
   cd latur-royal-darbar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```
   Production-ready files will be bundled into the `dist/` folder.

---

## 🌐 Deploy to Netlify

The project includes `netlify.toml` and `public/_redirects` out-of-the-box.

### Option 1: Git-Connected Deployment (Recommended)
1. Push your repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/SurajKhadkeofficial/latur-royal-darbar.git
   git branch -M main
   git push -u origin main
   ```
2. In the [Netlify Dashboard](https://app.netlify.com/):
   - Click **Add new site** > **Import an existing project**.
   - Select **GitHub** and choose your repository.
   - Build settings will automatically populate:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Click **Deploy Site**.

### Option 2: Drag & Drop (Instant Demo)
1. Run `npm run build` locally.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `dist` folder directly onto the screen.

---

## 📐 Billing & Tax Mathematics

```text
Subtotal        = ∑ (item.quantity × item.unitPrice)
Discount Amount = (discountType === "percentage") ? (Subtotal × %)/100 : FlatValue
Taxable Amount  = Math.max(0, Subtotal - Discount Amount)
CGST (2.5%)     = Taxable Amount × 0.025
SGST (2.5%)     = Taxable Amount × 0.025
Raw Total       = Taxable Amount + CGST + SGST
Grand Total     = Math.round(Raw Total)
Round-off       = Grand Total - Raw Total
```

---

## 👤 Author & Support

- **Lead Developer:** [Suraj Khadke](https://github.com/SurajKhadkeofficial)
- **GitHub:** [@SurajKhadkeofficial](https://github.com/SurajKhadkeofficial)
- **Email:** [surajvitthalkhadke07@gmail.com](mailto:surajvitthalkhadke07@gmail.com)

---

## 📜 License

Distributed under the Apache-2.0 License. See `LICENSE` for details.
