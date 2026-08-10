'use client';

import React, { useState } from 'react';
import { Search, Plus, PackageCheck, AlertTriangle } from 'lucide-react';
import { Product, StockType } from '@/types/admin';

interface InventoryManagerProps {
  products: Product[];
  activeStockTab?: StockType;
  onUpdateStock: (variantId: string, stockType: StockType, newQuantity: number) => void;
  onAddProduct: () => void;
}

export default function InventoryManager({
  products = [],
  activeStockTab = 'DELIVERY',
  onUpdateStock,
  onAddProduct,
}: InventoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) =>
    p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockTabLabel = (type: StockType) => {
    switch (type) {
      case 'DELIVERY':
        return 'مخزون التوصيل (Delivery Stock)';
      case 'STORE':
        return 'مخزون المحل (Store / POS Stock)';
      case 'WHOLESALE':
        return 'مخزون الجملة (Wholesale Stock)';
      default:
        return 'المخزون العامة';
    }
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Clean Top Header: Title & Burgundy Action Button */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-pyjama-charcoal">
                {getStockTabLabel(activeStockTab)}
              </h2>
              <span className="px-3 py-1 bg-pyjama-pink-soft text-[#8A2B43] rounded-full text-xs font-bold font-mono">
                {activeStockTab}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              إدارة كميات المنتجات والمقاسات والألوان الخاصة بقسم {getStockTabLabel(activeStockTab)}
            </p>
          </div>

          <button
            onClick={onAddProduct}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد (New Product)</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 text-gray-400 absolute right-4 top-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو رمز SKU..."
            className="w-full pr-11 pl-4 py-2.5 bg-pyjama-cream/40 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43] transition-all font-sans"
          />
        </div>
      </div>

      {/* Products & Variants Table OR Clean Pyjama DZ Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-card space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-pyjama-cream border border-pyjama-pink/40 text-[#8A2B43] flex items-center justify-center mx-auto shadow-sm">
            <PackageCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-pyjama-charcoal">لا توجد منتجات حالياً في {getStockTabLabel(activeStockTab)}</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              قاعدة بيانات المنتجات فارغة. اضغط على زر "إضافة منتج جديد" للبدء في إضافة منتجات المتجر.
            </p>
          </div>
          <button
            onClick={onAddProduct}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد (New Product)</span>
          </button>
        </div>
      ) : (
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
                    المخزون الحالي ({activeStockTab === 'DELIVERY' ? 'التوصيل' : activeStockTab === 'STORE' ? 'المحل' : 'الجملة'})
                  </th>
                  <th className="py-4 px-5 text-center">العمليات السريعة</th>
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
      )}
    </div>
  );
}
