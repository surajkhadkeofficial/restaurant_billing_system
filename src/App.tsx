/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MenuItem, 
  RestaurantProfile, 
  BillInvoice 
} from './types';
import { 
  INITIAL_RESTAURANTS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_BILLS 
} from './data/initialData';
import { Header } from './components/Header';
import { BillingDesk } from './components/BillingDesk';
import { MenuManager } from './components/MenuManager';
import { BillLedger } from './components/BillLedger';
import { ReceiptModal } from './components/ReceiptModal';
import { RestaurantSettingsModal } from './components/RestaurantSettingsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Github, FileText } from 'lucide-react';
import { Language } from './utils/translations';
import { generateProjectDocumentationPdf } from './utils/documentationPdf';

export default function App() {
  // Language State with local storage fallback (default to Marathi 'mr')
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('swaad_lang');
    return saved === 'en' || saved === 'mr' ? saved : 'mr';
  });

  useEffect(() => {
    localStorage.setItem('swaad_lang', lang);
  }, [lang]);

  // State Initialization with local storage fallback
  const [restaurants, setRestaurants] = useState<RestaurantProfile[]>(() => {
    const saved = localStorage.getItem('swaad_restaurants_latur');
    return saved ? JSON.parse(saved) : INITIAL_RESTAURANTS;
  });

  const [currentRestaurant, setCurrentRestaurant] = useState<RestaurantProfile>(() => {
    return restaurants[0] || INITIAL_RESTAURANTS[0];
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('swaad_menu_latur');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [invoices, setInvoices] = useState<BillInvoice[]>(() => {
    const saved = localStorage.getItem('swaad_invoices_latur');
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  // UI state: only billing, menu, ledger, settings (inventory & stock bar removed as requested!)
  const [activeTab, setActiveTab] = useState<'billing' | 'menu' | 'ledger' | 'settings'>('billing');
  const [cashierName] = useState('सुरज खडके (Suraj Khadke)');
  const [viewingInvoice, setViewingInvoice] = useState<BillInvoice | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('swaad_restaurants_latur', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('swaad_menu_latur', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('swaad_invoices_latur', JSON.stringify(invoices));
  }, [invoices]);

  // Next invoice sequence
  const nextInvoiceSequence = 1040 + invoices.length + 1;

  // BILL GENERATION HANDLER
  const handleGenerateBill = (invoice: BillInvoice) => {
    setInvoices((prev) => [invoice, ...prev]);
    // Open receipt modal immediately
    setViewingInvoice(invoice);
  };

  // MENU CATALOG HANDLERS
  const handleAddMenuItem = (newItemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...newItemData,
      id: `item_${Date.now()}`,
    };
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
    );
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
  };

  // RESTAURANT SETTINGS HANDLERS
  const handleSaveRestaurant = (updated: RestaurantProfile) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    setCurrentRestaurant(updated);
  };

  const handleAddNewRestaurant = (newProfile: RestaurantProfile) => {
    setRestaurants((prev) => [...prev, newProfile]);
    setCurrentRestaurant(newProfile);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col font-sans selection:bg-amber-200">
        
        {/* Top Header */}
        <Header
          currentRestaurant={currentRestaurant}
          restaurants={restaurants}
          onSelectRestaurant={setCurrentRestaurant}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cashierName={cashierName}
          onOpenSettings={() => setIsSettingsOpen(true)}
          lang={lang}
          onToggleLang={setLang}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          
          {activeTab === 'billing' && (
            <BillingDesk
              menuItems={menuItems}
              currentRestaurant={currentRestaurant}
              cashierName={cashierName}
              onGenerateBill={handleGenerateBill}
              nextInvoiceSequence={nextInvoiceSequence}
              lang={lang}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManager
              menuItems={menuItems}
              onAddMenuItem={handleAddMenuItem}
              onUpdateMenuItem={handleUpdateMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              lang={lang}
            />
          )}

          {activeTab === 'ledger' && (
            <BillLedger
              invoices={invoices}
              onViewInvoice={(invoice) => setViewingInvoice(invoice)}
              lang={lang}
            />
          )}

        </main>

        {/* Clean, Readable Footer */}
        <footer className="bg-stone-100 border-t border-stone-200 py-3.5 px-4 text-center text-xs text-stone-600 font-sans print:hidden">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="font-medium text-stone-800">
              <span className="font-extrabold text-stone-950 font-display">{currentRestaurant.name}</span> · {currentRestaurant.address}, {currentRestaurant.city} · GSTIN: <span className="font-mono font-bold">{currentRestaurant.gstin}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => generateProjectDocumentationPdf()}
                className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold hover:underline font-mono text-[11px]"
                title="Download Project Documentation & Code Explanation (PDF)"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === 'mr' ? 'प्रकल्प माहिती व कोड (PDF)' : 'Project & Code Doc (PDF)'}</span>
              </button>

              <span className="text-[11px] text-stone-500">
                {lang === 'mr' ? 'UPI:' : 'UPI:'}{' '}
                <strong className="text-stone-800">{currentRestaurant.payeeName || 'Suraj Khadke'}</strong>
              </span>

              <a
                href="https://github.com/SurajKhadkeofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-900 hover:text-emerald-700 font-bold hover:underline font-mono text-[11px]"
              >
                <Github className="w-3.5 h-3.5" />
                <span>SurajKhadkeofficial</span>
              </a>
            </div>
          </div>
        </footer>

        {/* RECEIPT PREVIEW / PRINT / PDF MODAL */}
        {viewingInvoice && (
          <ReceiptModal
            invoice={viewingInvoice}
            onClose={() => setViewingInvoice(null)}
            onNewBill={() => {
              setViewingInvoice(null);
              setActiveTab('billing');
            }}
            lang={lang}
          />
        )}

        {/* RESTAURANT SETTINGS MODAL */}
        {isSettingsOpen && (
          <RestaurantSettingsModal
            currentRestaurant={currentRestaurant}
            restaurants={restaurants}
            onSaveRestaurant={handleSaveRestaurant}
            onAddNewRestaurant={handleAddNewRestaurant}
            onClose={() => setIsSettingsOpen(false)}
            lang={lang}
          />
        )}

      </div>
    </ErrorBoundary>
  );
}
