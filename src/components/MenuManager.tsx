import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  BookOpen, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { MenuItem, FoodCategory } from '../types';
import { VegBadge, SpiceLevelIndicator } from './FoodBadge';
import { formatINR } from '../utils/formatters';
import { Language, translations } from '../utils/translations';

interface MenuManagerProps {
  menuItems: MenuItem[];
  onAddMenuItem: (newItem: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  lang: Language;
}

export const MenuManager: React.FC<MenuManagerProps> = ({
  menuItems,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  lang,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    marathiName: '',
    hindiName: '',
    category: 'Starters',
    price: 250,
    isVeg: true,
    spiceLevel: 'medium',
    code: '',
    description: '',
    stockQuantity: 50,
    lowStockThreshold: 5,
    trackInventory: true,
    unit: lang === 'mr' ? 'नग' : 'Plate',
    isAvailable: true,
  });

  const categories: { key: FoodCategory; label: string }[] = [
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

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.marathiName && item.marathiName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAdd = () => {
    const prefix = formData.category.slice(0, 3).toUpperCase();
    const count = menuItems.filter((i) => i.category === formData.category).length + 1;
    const generatedCode = `${prefix}${count.toString().padStart(2, '0')}`;

    setFormData({
      name: '',
      marathiName: '',
      hindiName: '',
      category: 'Starters',
      price: 250,
      isVeg: true,
      spiceLevel: 'medium',
      code: generatedCode,
      description: '',
      stockQuantity: 50,
      lowStockThreshold: 5,
      trackInventory: true,
      unit: lang === 'mr' ? 'नग' : 'Plate',
      isAvailable: true,
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      marathiName: item.marathiName || '',
      hindiName: item.hindiName || '',
      category: item.category,
      price: item.price,
      isVeg: item.isVeg,
      spiceLevel: item.spiceLevel,
      code: item.code,
      description: item.description || '',
      stockQuantity: item.stockQuantity,
      lowStockThreshold: item.lowStockThreshold,
      trackInventory: item.trackInventory,
      unit: item.unit || (lang === 'mr' ? 'नग' : 'Plate'),
      isAvailable: item.isAvailable,
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      onUpdateMenuItem({
        ...editingItem,
        ...formData,
      });
    } else {
      onAddMenuItem(formData);
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-display font-black text-xl text-stone-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-800" />
            <span>{t.menuCatalogTitle}</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            {t.menuCatalogSubtitle}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addNewDishButton}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchMenuPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-emerald-950 text-amber-300 shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const primaryName = lang === 'mr' ? (item.marathiName || item.name) : item.name;
          const secondaryName = lang === 'mr' ? item.name : item.marathiName;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                !item.isAvailable ? 'opacity-60 bg-stone-50 border-stone-200' : 'border-stone-200 hover:border-emerald-700 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <VegBadge isVeg={item.isVeg} size="sm" />
                    <span className="font-mono text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      {item.code}
                    </span>
                    <span className="text-xs text-stone-600 font-medium">
                      {item.category}
                    </span>
                  </div>
                  <SpiceLevelIndicator level={item.spiceLevel} />
                </div>

                <h3 className="font-bold text-stone-950 text-base leading-snug">
                  {primaryName}
                </h3>
                {secondaryName && (
                  <div className="text-xs text-stone-500 font-medium mt-0.5">
                    {secondaryName}
                  </div>
                )}

                {item.description && (
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="font-mono font-extrabold text-lg text-emerald-950 tabular-nums">
                  {formatINR(item.price)}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onUpdateMenuItem({ ...item, isAvailable: !item.isAvailable })}
                    className={`p-2 rounded-lg transition-colors ${
                      item.isAvailable 
                        ? 'text-emerald-700 hover:bg-emerald-50' 
                        : 'text-stone-400 hover:bg-stone-100'
                    }`}
                    title={item.isAvailable ? 'Active on menu' : 'Hidden from menu'}
                  >
                    {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
                    title="Edit dish"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {deletingId === item.id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded-lg border border-red-200">
                      <button
                        onClick={() => {
                          onDeleteMenuItem(item.id);
                          setDeletingId(null);
                        }}
                        className="px-2 py-1 text-[11px] font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        title="Confirm Delete"
                      >
                        {lang === 'mr' ? 'नक्की हटवा?' : 'Confirm?'}
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-1.5 py-1 text-[11px] text-stone-600 hover:text-stone-900"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT DISH MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-300 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between border-b border-emerald-900 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-base">
                  {editingItem ? t.editDishModalTitle : t.addDishModalTitle}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    {t.dishNameEnglish}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Special Mutton Sukka"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    {t.dishNameMarathi}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. लातूर स्पेशल मटण सुक्का"
                    value={formData.marathiName}
                    onChange={(e) => setFormData({ ...formData, marathiName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                  >
                    <option value="Starters">{t.catStarters}</option>
                    <option value="Tandoor">{t.catTandoor}</option>
                    <option value="Main Course">{t.catMainCourse}</option>
                    <option value="Biryani & Rice">{t.catBiryani}</option>
                    <option value="Breads">{t.catBreads}</option>
                    <option value="Beverages">{t.catBeverages}</option>
                    <option value="Desserts">{t.catDesserts}</option>
                    <option value="Thalis">{t.catThalis}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    {t.dishCodeLabel}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STR05"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono uppercase font-bold border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    {t.dietaryTypeLabel}
                  </label>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVeg: true })}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 ${
                        formData.isVeg
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      <VegBadge isVeg={true} size="sm" />
                      {lang === 'mr' ? 'शाकाहारी' : 'Veg'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isVeg: false })}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 ${
                        !formData.isVeg
                          ? 'bg-red-50 border-red-600 text-red-900'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      <VegBadge isVeg={false} size="sm" />
                      {lang === 'mr' ? 'मांसाहारी' : 'Non-Veg'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    {t.priceLabel}
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    {t.spiceLevelLabel}
                  </label>
                  <select
                    value={formData.spiceLevel}
                    onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                  >
                    <option value="mild">{t.spiceMild}</option>
                    <option value="medium">{t.spiceMedium}</option>
                    <option value="spicy">{t.spiceSpicy}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  {t.descriptionLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder={lang === 'mr' ? 'उदा. काळ्या मसाल्यातील मऊ शिजवलेले मटण...' : 'e.g. Traditional Marathwada spiced mutton...'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  {t.cancelButton}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-amber-300 font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? t.saveDishButton : t.addDishConfirmButton}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
