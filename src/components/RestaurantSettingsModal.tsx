import React, { useState } from 'react';
import { 
  Building, 
  Settings, 
  Save, 
  X, 
  ShieldCheck, 
  QrCode, 
  Github,
  FileText
} from 'lucide-react';
import { RestaurantProfile } from '../types';
import { Language, translations } from '../utils/translations';
import { generateProjectDocumentationPdf } from '../utils/documentationPdf';

interface RestaurantSettingsModalProps {
  currentRestaurant: RestaurantProfile;
  restaurants: RestaurantProfile[];
  onSaveRestaurant: (profile: RestaurantProfile) => void;
  onAddNewRestaurant: (profile: RestaurantProfile) => void;
  onClose: () => void;
  lang: Language;
}

export const RestaurantSettingsModal: React.FC<RestaurantSettingsModalProps> = ({
  currentRestaurant,
  restaurants,
  onSaveRestaurant,
  onAddNewRestaurant,
  onClose,
  lang,
}) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<RestaurantProfile>({ ...currentRestaurant });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRestaurant(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-300 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base">
                {t.settingsTitle}
              </h3>
              <p className="text-xs text-emerald-200">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Outlet Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-800 block mb-1">
                {t.hotelNameLabel}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs font-bold border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="font-bold text-stone-800 block mb-1">
                {t.hotelTaglineLabel}
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              />
            </div>
          </div>

          {/* Address, City, State, Pincode */}
          <div className="space-y-2">
            <div>
              <label className="font-bold text-stone-800 block mb-1">
                {t.hotelAddressLabel}
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t.hotelCityLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t.hotelStateLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t.hotelPincodeLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-800 block mb-1">
                {t.hotelPhoneLabel}
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">
                {t.hotelEmailLabel}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
              />
            </div>
          </div>

          {/* Suraj Khadke UPI & GitHub Settings */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
            <div className="font-bold text-emerald-950 flex items-center gap-2 text-sm">
              <QrCode className="w-4 h-4 text-emerald-800" />
              <span>Suraj Khadke UPI & Payment Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t.upiPayeeNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formData.payeeName}
                  onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t.upiIdSettingLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formData.upiId}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-800 block mb-1">
                {t.githubUrlLabel}
              </label>
              <input
                type="text"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Statutory Identifiers: GSTIN & FSSAI */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>{lang === 'mr' ? 'कायदेशीर परवाना व GST क्रमांक' : 'Legal Compliance & GST Details'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t.gstinLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs font-mono uppercase font-bold border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t.fssaiLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formData.fssai}
                  onChange={(e) => setFormData({ ...formData, fssai: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono font-medium border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Footer note on receipts */}
          <div>
            <label className="font-bold text-stone-800 block mb-1">
              {t.footerMsgLabel}
            </label>
            <input
              type="text"
              value={formData.footerNote}
              onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => generateProjectDocumentationPdf()}
                className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-emerald-950 font-bold rounded-lg text-xs border border-amber-500/40 flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Download Project Documentation & Code Explanation (PDF)"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-800" />
                <span>{lang === 'mr' ? 'प्रकल्प माहिती व कोड (PDF)' : 'Project & Code Doc (PDF)'}</span>
              </button>
              <span className="text-xs text-emerald-800 font-bold">
                {saveSuccess ? t.saveSuccessNotice : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                {t.cancelButton}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveSettingsButton}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
