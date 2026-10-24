import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  RefreshCw, 
  History, 
  Edit3, 
  Save, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { MenuItem, FoodCategory, StockLog, StockLogReason } from '../types';
import { VegBadge } from './FoodBadge';
import { formatINR, formatDateTime } from '../utils/formatters';

interface InventoryManagerProps {
  menuItems: MenuItem[];
  stockLogs: StockLog[];
  onUpdateStock: (itemId: string, newQuantity: number, reason: StockLogReason, notes?: string) => void;
  onUpdateThreshold: (itemId: string, newThreshold: number) => void;
  onBatchRestock: (itemId: string, addQuantity: number, reason: StockLogReason, notes?: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  menuItems,
  stockLogs,
  onUpdateStock,
  onUpdateThreshold,
  onBatchRestock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(0);

  // Restock batch modal state
  const [restockModalItem, setRestockModalItem] = useState<MenuItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [restockReason, setRestockReason] = useState<StockLogReason>('manual_restock');
  const [restockNote, setRestockNote] = useState<string>('Kitchen batch preparation');

  // Show audit logs tab vs inventory table
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'audit'>('inventory');

  // KPI Calculations
  const totalItems = menuItems.length;
  const lowStockItems = menuItems.filter(i => i.stockQuantity > 0 && i.stockQuantity <= i.lowStockThreshold);
  const outOfStockItems = menuItems.filter(i => i.stockQuantity <= 0);
  const healthyStockItems = menuItems.filter(i => i.stockQuantity > i.lowStockThreshold);

  // Filtering
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.hindiName && item.hindiName.includes(searchTerm)) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    let matchesStatus = true;
    if (stockStatusFilter === 'low') {
      matchesStatus = item.stockQuantity > 0 && item.stockQuantity <= item.lowStockThreshold;
    } else if (stockStatusFilter === 'out') {
      matchesStatus = item.stockQuantity <= 0;
    } else if (stockStatusFilter === 'healthy') {
      matchesStatus = item.stockQuantity > item.lowStockThreshold;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStartEdit = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditQuantity(item.stockQuantity);
    setEditThreshold(item.lowStockThreshold);
  };

  const handleSaveEdit = (itemId: string) => {
    if (editQuantity !== undefined) {
      onUpdateStock(itemId, Math.max(0, editQuantity), 'adjustment', 'Manual stock count adjustment');
    }
    if (editThreshold !== undefined) {
      onUpdateThreshold(itemId, Math.max(1, editThreshold));
    }
    setEditingItemId(null);
  };

  const handleQuickAdd = (item: MenuItem, amount: number) => {
    const newQty = Math.max(0, item.stockQuantity + amount);
    onUpdateStock(
      item.id, 
      newQty, 
      amount > 0 ? 'manual_restock' : 'adjustment', 
      amount > 0 ? `Quick restock (+${amount} ${item.unit})` : `Quick deduction (${amount} ${item.unit})`
    );
  };

  const submitBatchRestock = () => {
    if (!restockModalItem || restockAmount <= 0) return;
    onBatchRestock(restockModalItem.id, restockAmount, restockReason, restockNote);
    setRestockModalItem(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Tracked Items</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-stone-900">{totalItems}</span>
            <span className="text-xs text-stone-500">food dishes</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Healthy Stock</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-emerald-700">{healthyStockItems.length}</span>
            <span className="text-xs text-stone-500">ready to serve</span>
          </div>
        </div>

        <div 
          onClick={() => setStockStatusFilter(stockStatusFilter === 'low' ? 'all' : 'low')}
          className={`p-4 rounded-xl border cursor-pointer transition-all shadow-2xs ${
            lowStockItems.length > 0 
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 hover:bg-amber-100/60' 
              : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Low Stock Alerts</span>
            <div className="p-2 rounded-lg bg-amber-500 text-white shadow-2xs">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-amber-800">{lowStockItems.length}</span>
            <span className="text-xs font-medium text-amber-700">need prep / refill</span>
          </div>
        </div>

        <div 
          onClick={() => setStockStatusFilter(stockStatusFilter === 'out' ? 'all' : 'out')}
          className={`p-4 rounded-xl border cursor-pointer transition-all shadow-2xs ${
            outOfStockItems.length > 0 
              ? 'bg-red-50 border-red-300 ring-2 ring-red-400/20 hover:bg-red-100/60' 
              : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-900 uppercase tracking-wider">Out of Stock</span>
            <div className="p-2 rounded-lg bg-red-600 text-white">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-red-700">{outOfStockItems.length}</span>
            <span className="text-xs text-red-600 font-medium">orders blocked</span>
          </div>
        </div>
      </div>

      {/* Prominent Low Stock Alert Banner (when items are low) */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-amber-950 font-display">
                Attention: {lowStockItems.length} Indian dishes are below threshold!
              </h3>
              <p className="text-xs text-amber-800/90 mt-0.5">
                {lowStockItems.map(i => `${i.name} (${i.stockQuantity} ${i.unit})`).join(' · ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => {
                // Quick restock +10 for all low stock items
                lowStockItems.forEach(i => handleQuickAdd(i, 10));
              }}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restock All (+10 each)
            </button>
            <button
              onClick={() => setStockStatusFilter('low')}
              className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 text-xs font-medium transition-colors"
            >
              Filter Low Items
            </button>
          </div>
        </div>
      )}

      {/* Sub Tabs: Inventory Master Table vs Stock Audit Log */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'inventory'
                ? 'bg-emerald-900 text-white shadow-2xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Active Stock Inventory ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'audit'
                ? 'bg-emerald-900 text-white shadow-2xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Stock Movement Log ({stockLogs.length})
          </button>
        </div>

        {activeSubTab === 'inventory' && stockStatusFilter !== 'all' && (
          <button
            onClick={() => setStockStatusFilter('all')}
            className="text-xs text-amber-800 hover:underline font-medium"
          >
            Clear status filter ({stockStatusFilter})
          </button>
        )}
      </div>

      {activeSubTab === 'inventory' ? (
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          
          {/* Controls: Search, Category Filter & Stock Status */}
          <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food by name, Hindi name, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as FoodCategory)}
                className="px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="All">All Categories</option>
                <option value="Starters">Starters</option>
                <option value="Tandoor">Tandoor</option>
                <option value="Main Course">Main Course</option>
                <option value="Biryani & Rice">Biryani & Rice</option>
                <option value="Breads">Breads</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Thalis">Thalis</option>
              </select>

              <div className="flex items-center gap-1 bg-stone-200/70 p-0.5 rounded-lg">
                <button
                  onClick={() => setStockStatusFilter('all')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    stockStatusFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStockStatusFilter('low')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    stockStatusFilter === 'low' ? 'bg-amber-600 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Low Stock
                </button>
                <button
                  onClick={() => setStockStatusFilter('out')}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    stockStatusFilter === 'out' ? 'bg-red-600 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Out of Stock
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 text-stone-600 border-b border-stone-200 font-semibold">
                  <th className="py-2.5 px-3">Item Details</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Selling Price</th>
                  <th className="py-2.5 px-3 text-center">Current Stock</th>
                  <th className="py-2.5 px-3 text-center">Threshold Alert</th>
                  <th className="py-2.5 px-3 text-center">Quick Adjust</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400">
                      No food items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.stockQuantity > 0 && item.stockQuantity <= item.lowStockThreshold;
                    const isOut = item.stockQuantity <= 0;
                    const isEditing = editingItemId === item.id;

                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-stone-50/80 transition-colors ${
                          isOut ? 'bg-red-50/30' : isLow ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Item Details */}
                        <td className="py-3 px-3">
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              <VegBadge isVeg={item.isVeg} size="sm" />
                            </div>
                            <div>
                              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                                <span>{item.name}</span>
                                <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-1 py-0.2 rounded border border-stone-200">
                                  {item.code}
                                </span>
                              </div>
                              {item.hindiName && (
                                <div className="text-[11px] text-stone-500 font-normal">
                                  {item.hindiName}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 text-stone-600 font-medium">
                          {item.category}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 text-right font-mono font-semibold text-stone-800 tabular-nums">
                          {formatINR(item.price)}
                        </td>

                        {/* Current Stock */}
                        <td className="py-3 px-3 text-center">
                          {isEditing ? (
                            <div className="inline-flex items-center justify-center">
                              <input
                                type="number"
                                min={0}
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                                className="w-16 px-1.5 py-1 text-center font-mono font-bold text-sm bg-white border border-emerald-600 rounded focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className={`font-mono font-bold text-sm tabular-nums ${
                                isOut ? 'text-red-700' : isLow ? 'text-amber-800' : 'text-emerald-800'
                              }`}>
                                {item.stockQuantity} {item.unit}
                              </span>

                              <span className={`text-[10px] font-medium px-2 py-0.2 rounded mt-0.5 ${
                                isOut 
                                  ? 'bg-red-100 text-red-800 border border-red-200' 
                                  : isLow 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}>
                                {isOut ? 'Depleted' : isLow ? `Low Alert (≤${item.lowStockThreshold})` : 'In Stock'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Threshold Alert */}
                        <td className="py-3 px-3 text-center">
                          {isEditing ? (
                            <div className="inline-flex items-center justify-center gap-1">
                              <span className="text-[11px] text-stone-500">Alert at:</span>
                              <input
                                type="number"
                                min={1}
                                value={editThreshold}
                                onChange={(e) => setEditThreshold(parseInt(e.target.value) || 1)}
                                className="w-12 px-1 py-1 text-center font-mono text-xs bg-white border border-amber-600 rounded focus:outline-none"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-stone-600 font-mono">
                              ≤ {item.lowStockThreshold} {item.unit}
                            </span>
                          )}
                        </td>

                        {/* Quick Adjust Buttons */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
                            <button
                              onClick={() => handleQuickAdd(item, -1)}
                              disabled={item.stockQuantity <= 0}
                              className="w-6 h-6 rounded bg-white hover:bg-stone-200 text-stone-700 disabled:opacity-30 flex items-center justify-center transition-colors shadow-2xs font-bold"
                              title="Decrease 1"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleQuickAdd(item, 1)}
                              className="w-6 h-6 rounded bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors shadow-2xs font-bold"
                              title="Increase 1"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleQuickAdd(item, 5)}
                              className="px-1.5 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold flex items-center justify-center transition-colors"
                              title="Restock +5"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleQuickAdd(item, 10)}
                              className="px-1.5 h-6 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[10px] font-bold flex items-center justify-center transition-colors"
                              title="Restock +10"
                            >
                              +10
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                                title="Edit stock number & threshold"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setRestockModalItem(item);
                                  setRestockAmount(10);
                                }}
                                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Restock Batch
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* AUDIT LOG TAB */
        <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/60 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-stone-900 font-display">Inventory Audit & Movement Ledger</h3>
              <p className="text-xs text-stone-500">Every automatic deduction from bills and manual restock is chronologically tracked.</p>
            </div>
            <span className="font-mono text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded border border-stone-200">
              {stockLogs.length} audit records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 text-stone-600 border-b border-stone-200 font-semibold">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3 text-center">Movement</th>
                  <th className="py-2.5 px-3 text-center">Stock Before → After</th>
                  <th className="py-2.5 px-3">Reason & Context</th>
                  <th className="py-2.5 px-3">Reference / Bill No</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {stockLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">
                      No stock movements recorded yet. Complete a bill or restock items to view logs.
                    </td>
                  </tr>
                ) : (
                  stockLogs.map((log) => {
                    const isPositive = log.changeAmount > 0;
                    return (
                      <tr key={log.id} className="hover:bg-stone-50/70">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          {log.itemName}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center gap-0.5 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            isPositive 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isPositive ? `+${log.changeAmount}` : log.changeAmount}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums text-stone-700">
                          {log.previousStock} → <span className="font-bold text-stone-950">{log.newStock}</span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-700">
                          <span className="capitalize font-medium text-stone-900">
                            {log.reason.replace('_', ' ')}
                          </span>
                          {log.notes && (
                            <span className="block text-[10px] text-stone-500 italic mt-0.5">
                              {log.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-stone-600">
                          {log.referenceId ? (
                            <span className="px-1.5 py-0.5 bg-stone-100 rounded border border-stone-200 text-emerald-900 font-semibold">
                              {log.referenceId}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESTOCK BATCH MODAL */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-stone-300 w-full max-w-md overflow-hidden">
            <div className="bg-emerald-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-bold text-base">Restock Dish Inventory</h3>
              </div>
              <button 
                onClick={() => setRestockModalItem(null)}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase">Food Item</label>
                <div className="font-semibold text-stone-900 text-base mt-0.5 flex items-center gap-2">
                  <VegBadge isVeg={restockModalItem.isVeg} size="sm" />
                  <span>{restockModalItem.name}</span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Current Stock: <span className="font-bold text-stone-800">{restockModalItem.stockQuantity} {restockModalItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase block mb-1">
                  Quantity to Add ({restockModalItem.unit})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                  <div className="flex items-center gap-1">
                    {[5, 10, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRestockAmount(amt)}
                        className={`px-2 py-1.5 rounded text-xs font-mono font-medium border ${
                          restockAmount === amt 
                            ? 'bg-emerald-800 text-white border-emerald-800' 
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                        }`}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-emerald-800 font-medium mt-1">
                  New resulting stock will be: <span className="font-bold font-mono">{restockModalItem.stockQuantity + restockAmount} {restockModalItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase block mb-1">
                  Restock Reason
                </label>
                <select
                  value={restockReason}
                  onChange={(e) => setRestockReason(e.target.value as StockLogReason)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="manual_restock">Kitchen Fresh Preparation / Batch Cooking</option>
                  <option value="initial_setup">Vendor Raw Material Delivery / Mandi Restock</option>
                  <option value="adjustment">Physical Inventory Audit Reconcile</option>
                  <option value="spoilage">Replacement of Damaged / Spoiled Portion</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase block mb-1">
                  Reference Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Morning prep by Chef Kuldeep, Dairy delivery received"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitBatchRestock}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Confirm Restock (+{restockAmount} {restockModalItem.unit})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
