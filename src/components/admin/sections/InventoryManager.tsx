'use client';

import React, { useState } from 'react';
import { Truck, Store, Building2, Search, Plus, PackageCheck, AlertTriangle } from 'lucide-react';
import { Product, StockType } from '@/types/admin';

interface InventoryManagerProps {
  products: Product[];
  onUpdateStock: (variantId: string, stockType: StockType, newQuantity: number) => void;
  onAddProduct: () => void;
}

export default function InventoryManager({
  products,
  onUpdateStock,
  onAddProduct,
}: InventoryManagerProps) {
  const [activeStockTab, setActiveStockTab] = useState<StockType>('DELIVERY');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) =>
    p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockCount = (p: Product, type: StockType) => {
    return p.variants.reduce((acc, v) => {
      if (type === 'DELIVERY') return acc + v.deliveryStock;
      if (type === 'STORE') return acc + v.storeStock;
      if (type === 'WHOLESALE') return acc + v.wholesaleStock;
      return acc;
    }, 0);
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Top Header & Stock Pool Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-pyjama-charcoal">إدارة المخزون والمنتجات</h2>
            <p className="text-xs text-gray-500 mt-1">
              متابعة المخزون المستقل في المستودعات الثلاثة (التوصيل، المحل، الجملة)
            </p>
          </div>

          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد (New Product)</span>
          </button>
        </div>

        {/* 3 Isolated Stock Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => setActiveStockTab('DELIVERY')}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              activeStockTab === 'DELIVERY'
                ? 'bg-[#8A2B43] text-white border-[#8A2B43] shadow-lg scale-[1.02]'
                : 'bg-pyjama-cream/60 border-gray-200 text-gray-700 hover:bg-pyjama-cream'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${activeStockTab === 'DELIVERY' ? 'bg-[#E8A5B8] text-[#7A1C32]' : 'bg-white text-[#8A2B43]'}`}>
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold">مخزون التوصيل</span>
                <span className="text-[10px] opacity-80">Delivery Stock</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveStockTab('STORE')}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              activeStockTab === 'STORE'
                ? 'bg-[#8A2B43] text-white border-[#8A2B43] shadow-lg scale-[1.02]'
                : 'bg-pyjama-cream/60 border-gray-200 text-gray-700 hover:bg-pyjama-cream'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${activeStockTab === 'STORE' ? 'bg-[#E8A5B8] text-[#7A1C32]' : 'bg-white text-[#8A2B43]'}`}>
                <Store className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold">مخزون المحل (POS)</span>
                <span className="text-[10px] opacity-80">Store Stock</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveStockTab('WHOLESALE')}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              activeStockTab === 'WHOLESALE'
                ? 'bg-[#8A2B43] text-white border-[#8A2B43] shadow-lg scale-[1.02]'
                : 'bg-pyjama-cream/60 border-gray-200 text-gray-700 hover:bg-pyjama-cream'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${activeStockTab === 'WHOLESALE' ? 'bg-[#E8A5B8] text-[#7A1C32]' : 'bg-white text-[#8A2B43]'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold">مخزون الجملة</span>
                <span className="text-[10px] opacity-80">Wholesale Stock</span>
              </div>
            </div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو رمز SKU..."
            className="w-full pr-11 pl-4 py-2.5 bg-pyjama-cream/40 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43] transition-all"
          />
        </div>
      </div>

      {/* Products & Variants Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-pyjama-cream/80 text-pyjama-charcoal font-bold border-b border-gray-200">
              <tr>
                <th className="py-4 px-5">المنتج والرمز (SKU)</th>
                <th className="py-4 px-5">المقاس واللون</th>
                <th className="py-4 px-5">سعر التكلفة</th>
                <th className="py-4 px-5">سعر البيع</th>
                <th className="py-4 px-5">
                  المخزون المحدد (
                  {activeStockTab === 'DELIVERY' ? 'مخزون التوصيل' : activeStockTab === 'STORE' ? 'مخزون المحل' : 'مخزون الجملة'}
                  )
                </th>
                <th className="py-4 px-5 text-center">العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {filteredProducts.map((product) =>
                product.variants.map((variant, idx) => {
                  const stockVal =
                    activeStockTab === 'DELIVERY'
                      ? variant.deliveryStock
                      : activeStockTab === 'STORE'
                      ? variant.storeStock
                      : variant.wholesaleStock;

                  return (
                    <tr key={variant.id} className="hover:bg-pyjama-cream/30 transition-all">
                      {idx === 0 && (
                        <td
                          rowSpan={product.variants.length}
                          className="py-4 px-5 font-bold align-top border-l border-gray-100 bg-white"
                        >
                          <div className="font-bold text-pyjama-charcoal text-sm">{product.nameAr}</div>
                          <div className="text-[11px] text-[#8A2B43] font-mono mt-0.5">{product.sku}</div>
                          {product.categoryNameAr && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-pyjama-pink-soft text-[#8A2B43] text-[10px] rounded-md font-semibold">
                              {product.categoryNameAr}
                            </span>
                          )}
                        </td>
                      )}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded-md font-mono font-bold text-gray-700">
                            {variant.size}
                          </span>
                          <span className="text-gray-600 font-medium">{variant.color}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-gray-600">
                        {product.costPrice.toLocaleString()} DZD
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-pyjama-charcoal">
                        {product.sellingPrice.toLocaleString()} DZD
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                              stockVal <= 3
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {stockVal} قطعة
                          </span>
                          {stockVal <= 3 && (
                            <span className="text-[10px] text-rose-600 flex items-center gap-1 font-semibold">
                              <AlertTriangle className="w-3 h-3" /> مخزون منخفض
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1 dir-ltr">
                          <button
                            onClick={() => onUpdateStock(variant.id, activeStockTab, Math.max(0, stockVal - 1))}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm transition-all"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold w-8 text-center">{stockVal}</span>
                          <button
                            onClick={() => onUpdateStock(variant.id, activeStockTab, stockVal + 1)}
                            className="w-7 h-7 rounded-lg bg-[#8A2B43] hover:bg-[#7A1C32] text-white font-bold flex items-center justify-center text-sm transition-all shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
