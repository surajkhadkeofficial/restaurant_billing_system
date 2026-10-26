import React from 'react';
import { 
  UtensilsCrossed, 
  Receipt, 
  BookOpen, 
  History, 
  Settings, 
  ChevronDown,
  UserCheck,
  Github,
  Languages,
  FileText
} from 'lucide-react';
import { RestaurantProfile } from '../types';
import { Language, translations } from '../utils/translations';
import { generateProjectDocumentationPdf } from '../utils/documentationPdf';

interface HeaderProps {
  currentRestaurant: RestaurantProfile;
  restaurants: RestaurantProfile[];
  onSelectRestaurant: (restaurant: RestaurantProfile) => void;
  activeTab: 'billing' | 'menu' | 'ledger' | 'settings';
  setActiveTab: (tab: 'billing' | 'menu' | 'ledger' | 'settings') => void;
  cashierName: string;
  onOpenSettings: () => void;
  lang: Language;
  onToggleLang: (newLang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRestaurant,
  restaurants,
  onSelectRestaurant,
  activeTab,
  setActiveTab,
  cashierName,
  onOpenSettings,
  lang,
  onToggleLang,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const t = translations[lang];

  return (
    <header className="bg-emerald-950 text-white border-b border-emerald-900/60 sticky top-0 z-30 shadow-md">
      {/* Main Top Bar: 3 Zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Zone 1: Restaurant Name & Marathi Tagline */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-left group hover:opacity-95 transition-opacity"
              title={`${t.switchOutlet} / Switch branch`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white whitespace-nowrap">
                    {currentRestaurant.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-emerald-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="text-[11px] text-amber-300 font-medium tracking-wide truncate max-w-[170px] sm:max-w-xs">
                  {lang === 'mr' ? currentRestaurant.tagline : 'Authentic Latur Royal Cuisine'}
                </div>
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)} 
                />
                <div className="absolute left-0 mt-2 w-72 bg-emerald-900 border border-emerald-700/60 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                    {t.selectBranch}
                  </div>
                  {restaurants.map((rest) => (
                    <button
                      key={rest.id}
                      onClick={() => {
                        onSelectRestaurant(rest);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                        rest.id === currentRestaurant.id
                          ? 'bg-emerald-800 text-amber-300 font-medium'
                          : 'text-emerald-100 hover:bg-emerald-800/60'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{rest.name}</div>
                        <div className="text-xs text-emerald-300/70">{rest.city}, {rest.state}</div>
                      </div>
                      {rest.id === currentRestaurant.id && (
                        <span className="text-xs text-amber-400 font-mono font-bold">{t.activeBranch}</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-emerald-800 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-emerald-300 hover:text-amber-300 flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      {t.manageSettings}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'billing'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>{t.tabBilling}</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.tabMenu}</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{t.tabLedger}</span>
          </button>
        </nav>

        {/* Zone 3: Language Switcher, GitHub, Cashier & Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* LANGUAGE SWITCHER TOGGLE */}
          <div className="flex items-center bg-emerald-900/90 border border-emerald-700/80 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => onToggleLang('mr')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 ${
                lang === 'mr'
                  ? 'bg-amber-500 text-emerald-950 shadow-sm scale-102'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="मराठी भाषा निवडा (Switch to Marathi)"
            >
              <span>मराठी</span>
            </button>
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all flex items-center gap-1 ${
                lang === 'en'
                  ? 'bg-amber-500 text-emerald-950 shadow-sm scale-102'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="Switch to English (इंग्रजी भाषा निवडा)"
            >
              <span>ENG</span>
            </button>
          </div>

          {/* Download Project & Code Explanation PDF */}
          <button
            onClick={() => generateProjectDocumentationPdf()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-bold text-amber-300 transition-colors shadow-xs"
            title={lang === 'mr' ? 'प्रकल्प माहिती व संपूर्ण कोड स्पष्टीकरण (PDF डाऊनलोड करा)' : 'Download Project Documentation & Code Explanation (PDF)'}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">{lang === 'mr' ? 'प्रकल्प PDF' : 'Doc PDF'}</span>
          </button>

          {/* GitHub Profile link for SurajKhadkeofficial */}
          <a
            href="https://github.com/SurajKhadkeofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-700/60 text-xs font-medium text-emerald-200 hover:text-white transition-colors"
            title="Suraj Khadke Official GitHub Profile"
          >
            <Github className="w-4 h-4 text-amber-300" />
            <span className="hidden lg:inline">SurajKhadkeofficial</span>
          </a>

          {/* Cashier / Operator indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-900/50 border border-emerald-800 text-xs text-emerald-100">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{lang === 'mr' ? 'सुरज खडके' : 'Suraj Khadke'}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-900/60 rounded-lg transition-colors border border-emerald-800/60"
            title={t.manageSettings}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-emerald-900/80 bg-emerald-950 px-2 py-2">
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold rounded ${
            activeTab === 'billing' ? 'text-amber-400 bg-emerald-900/50' : 'text-emerald-200'
          }`}
        >
          <Receipt className="w-4 h-4 mb-0.5" />
          <span>{lang === 'mr' ? 'बिलिंग' : 'Billing'}</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold rounded ${
            activeTab === 'menu' ? 'text-amber-400 bg-emerald-900/50' : 'text-emerald-200'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>{lang === 'mr' ? 'मेनू' : 'Menu'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold rounded ${
            activeTab === 'ledger' ? 'text-amber-400 bg-emerald-900/50' : 'text-emerald-200'
          }`}
        >
          <History className="w-4 h-4 mb-0.5" />
          <span>{lang === 'mr' ? 'इतिहास' : 'Ledger'}</span>
        </button>

        <button
          onClick={() => generateProjectDocumentationPdf()}
          className="flex flex-col items-center py-1 px-2.5 text-xs font-semibold rounded text-amber-300 hover:text-white"
          title="Download Project & Code Documentation PDF"
        >
          <FileText className="w-4 h-4 mb-0.5 text-amber-400" />
          <span>{lang === 'mr' ? 'दस्तऐवज' : 'Doc PDF'}</span>
        </button>
      </div>
    </header>
  );
};
