'use client';

import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Trash2,
  Package,
  Building,
  Tag,
  PackageCheck,
  Edit3,
  Clock,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Product, StockType, Category } from '@/types/admin';

interface InventoryGridProps {
  products: Product[];
  categories?: Category[];
  activeStockTab: StockType;
  onUpdateStock: (variantId: string, stockType: StockType, newQuantity: number) => void;
  onDeleteProduct?: (productId: string, stockType: StockType) => void;
  onEditProduct?: (product: Product) => void;
  reFetchProducts?: () => Promise<void>;
}

export default function InventoryGrid({
  products = [],
  categories = [],
  activeStockTab = 'DELIVERY',
  onUpdateStock,
  onDeleteProduct,
  onEditProduct,
  reFetchProducts,
}: InventoryGridProps) {
  // Level 1 vs Level 2 state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Helper: Check if product has active stock > 0 in current warehouse context
  const hasStockInActiveWarehouse = (p: Product): boolean => {
    if (!p.variants || p.variants.length === 0) return true;
    return p.variants.some((v) => {
      if (activeStockTab === 'DELIVERY') return (v.deliveryStock || 0) > 0;
      if (activeStockTab === 'STORE') return (v.storeStock || 0) > 0;
      if (activeStockTab === 'WHOLESALE') return (v.wholesaleStock || 0) > 0;
      return true;
    });
  };

  // Group categories dynamically from DB categories AND active warehouse products
  const categoryStatsMap: Record<string, { id: string; name: string; count: number; imageUrl?: string }> = {};

  // Seed with registered categories from database
  categories.forEach((c) => {
    categoryStatsMap[c.id] = {
      id: c.id,
      name: c.name,
      count: 0,
      imageUrl: c.imageUrl,
    };
  });

  // Add product counts per category (filtered by active warehouse stock)
  products.forEach((p) => {
    if (hasStockInActiveWarehouse(p)) {
      const catId = p.categoryId || 'uncategorized';
      const catName = p.categoryNameAr || 'أقسام عامة';
      if (!categoryStatsMap[catId]) {
        categoryStatsMap[catId] = {
          id: catId,
          name: catName,
          count: 0,
          imageUrl: p.imageUrl,
        };
      }
      categoryStatsMap[catId].count += 1;
    }
  });

  const categoryCardsList = Object.values(categoryStatsMap);

  // Level 2 Products Filter (Filtered by Category AND Active Warehouse Stock)
  const activeProducts = products.filter((p) => {
    const matchesCategory =
      !selectedCategoryId ||
      p.categoryId === selectedCategoryId ||
      (!p.categoryId && selectedCategoryId === 'uncategorized');

    return matchesCategory && hasStockInActiveWarehouse(p);
  });

  const activeCategoryName =
    categoryCardsList.find((c) => c.id === selectedCategoryId)?.name || 'القسم المحدد';

  // Context-Isolated Scoped Warehouse Hiding & Sequential Delete Handler
  const handleDeleteProduct = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents triggering card edit modal

    const warehouseLabel =
      activeStockTab === 'DELIVERY'
        ? 'مخزون التوصيل'
        : activeStockTab === 'STORE'
        ? 'مخزون المحل'
        : 'مخزون الجملة';

    if (!confirm(`هل أنت تأكد من إزالة هذا المنتج من (${warehouseLabel})؟`)) {
      return;
    }

    try {
      if (onDeleteProduct) {
        await onDeleteProduct(productId, activeStockTab);
      } else {
        const stockColumn =
          activeStockTab === 'DELIVERY'
            ? 'delivery_stock'
            : activeStockTab === 'STORE'
            ? 'store_stock'
            : 'wholesale_stock';

        // 1. Scoped removal: zero out active warehouse stock column in product_variants
        await supabase
          .from('product_variants')
          .update({ [stockColumn]: 0 })
          .eq('product_id', productId);

        // 2. Check if product has remaining stock > 0 across ANY warehouse
        const { data: remainingVars } = await supabase
          .from('product_variants')
          .select('delivery_stock, store_stock, wholesale_stock')
          .eq('product_id', productId);

        const hasAnyStockLeft = remainingVars?.some(
          (v) => (v.delivery_stock || 0) > 0 || (v.store_stock || 0) > 0 || (v.wholesale_stock || 0) > 0
        );

        if (remainingVars && remainingVars.length > 0 && !hasAnyStockLeft) {
          // If total stock across ALL 3 warehouses is 0, execute hard delete
          await supabase.from('product_variants').delete().eq('product_id', productId);
          await supabase.from('products').delete().eq('id', productId);
          alert('تم حذف المنتج نهائياً من النظام لعدم وجود توفر في أي مستودع!');
        } else {
          alert(`تم إزالة المنتج من (${warehouseLabel}) بنجاح!`);
        }
      }

      // 3. Refresh UI dynamically
      if (typeof reFetchProducts === 'function') {
        await reFetchProducts();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء إزالة المنتج: ' + (err?.message || String(err)));
    }
  };

  // Helper to extract unique colors & variants for a product card
  const getGroupedColorVariants = (product: Product) => {
    const colorGroups: Record<string, typeof product.variants> = {};
    product.variants.forEach((v) => {
      const col = v.color || 'اللون الأساسي';
      if (!colorGroups[col]) colorGroups[col] = [];
      colorGroups[col].push(v);
    });
    return colorGroups;
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* LEVEL 1: Dynamic Category Cards View */}
      {selectedCategoryId === null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8A2B43]" />
              <span>أقسام المتجر المتاحة بمخزون ({activeStockTab === 'DELIVERY' ? 'التوصيل' : activeStockTab === 'STORE' ? 'المحل' : 'الجملة'})</span>
            </h3>
            <span className="text-xs font-mono font-bold text-gray-500">
              إجمالي الأقسام: {categoryCardsList.length}
            </span>
          </div>

          {categoryCardsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm space-y-3">
              <PackageCheck className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500 font-bold">لا توجد أقسام بمخزون متوفر حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryCardsList.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-card hover:shadow-xl hover:border-[#8A2B43]/40 transition-all cursor-pointer group flex items-center gap-4 relative overflow-hidden"
                >
                  {/* Category Image / Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-pyjama-cream/80 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <Layers className="w-6 h-6 text-[#8A2B43]" />
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-sm font-bold text-pyjama-charcoal group-hover:text-[#8A2B43] transition-colors truncate">
                      {cat.name}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 bg-pyjama-pink-soft text-[#8A2B43] text-[11px] font-mono font-bold rounded-lg border border-pyjama-pink/30">
                        {cat.count} منتج
                      </span>
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="w-8 h-8 rounded-xl bg-pyjama-cream text-[#8A2B43] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* LEVEL 2: Product Cards Grid View */
        <div className="space-y-6">
          {/* Back Action Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pyjama-cream text-[#8A2B43] hover:bg-[#8A2B43] hover:text-white text-xs font-bold transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى قائمة الأقسام (Back to Categories)</span>
            </button>

            <span className="text-xs font-bold text-pyjama-charcoal font-mono bg-pyjama-cream/80 px-3 py-1.5 rounded-xl border border-gray-200">
              قسم: {activeCategoryName} ({activeProducts.length} منتج)
            </span>
          </div>

          {/* Product Cards Grid */}
          {activeProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-card space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-pyjama-cream border border-pyjama-pink/40 text-[#8A2B43] flex items-center justify-center mx-auto shadow-sm">
                <PackageCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-pyjama-charcoal">لا توجد منتجات متوفرة بمخزون هذا المستودع</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                اضغط على زر العودة للأقسام لتصفح بقية أقسام المتجر.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProducts.map((product) => {
                const groupedColors = getGroupedColorVariants(product);

                return (
                  <div
                    key={product.id}
                    onClick={() => onEditProduct && onEditProduct(product)}
                    className="bg-white rounded-3xl border border-gray-100 shadow-card hover:shadow-xl hover:border-[#8A2B43]/40 transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
                    title="انقر على الكارت لتعديل بيانات المنتج"
                  >
                    {/* Top Bar inside Card */}
                    <div className="p-4 bg-pyjama-cream/30 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {product.categoryNameAr && (
                          <span className="px-2.5 py-1 bg-pyjama-pink-soft text-[#8A2B43] text-[10px] font-bold rounded-lg border border-pyjama-pink/30">
                            {product.categoryNameAr}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#8A2B43] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit3 className="w-3 h-3" /> تعديل
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProduct(product.id, e)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all z-10"
                          title={`إزالة هذا المنتج من ${activeStockTab === 'DELIVERY' ? 'مخزون التوصيل' : activeStockTab === 'STORE' ? 'مخزون المحل' : 'مخزون الجملة'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Main Card Content */}
                    <div className="p-5 space-y-4 flex-1">
                      {/* Product Image & Info Header */}
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-pyjama-cream border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.nameAr}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-[#8A2B43]" />
                          )}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-pyjama-charcoal line-clamp-2 leading-snug">
                            {product.nameAr}
                          </h4>
                          <p className="text-xs font-mono text-gray-400 font-bold">
                            SKU: {product.sku}
                          </p>

                          {/* Context Price Display */}
                          <div className="pt-1 flex items-center gap-2 flex-wrap">
                            {activeStockTab === 'WHOLESALE' ? (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-purple-900 font-mono">
                                  {product.wholesalePrice || 0} د.ج
                                </span>
                                {product.superGrosPrice && (
                                  <span className="text-[11px] font-bold text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                    سوبر: {product.superGrosPrice} د.ج
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-[#8A2B43] font-mono">
                                  {product.sellingPrice || 0} د.ج
                                </span>
                                {product.oldPrice && (
                                  <span className="text-xs text-gray-400 line-through font-mono">
                                    {product.oldPrice} د.ج
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Color & Size Breakdown per Color */}
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        {Object.entries(groupedColors).map(([colorName, colorVars]) => {
                          const firstColorImg = colorVars?.[0]?.colorImageUrl || product.imageUrl;

                          return (
                            <div
                              key={colorName}
                              className="bg-pyjama-cream/40 p-3 rounded-2xl border border-gray-100 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {firstColorImg ? (
                                    <img
                                      src={firstColorImg}
                                      alt={colorName}
                                      className="w-5 h-5 rounded-full object-cover border border-gray-200"
                                    />
                                  ) : (
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#8A2B43]" />
                                  )}
                                  <span className="text-xs font-bold text-pyjama-charcoal">
                                    {colorName}
                                  </span>
                                </div>
                              </div>

                              {/* Size Stock Chips */}
                              <div className="flex flex-wrap gap-1.5">
                                {colorVars.map((v) => {
                                  const stockQty =
                                    activeStockTab === 'DELIVERY'
                                      ? v.deliveryStock
                                      : activeStockTab === 'STORE'
                                      ? v.storeStock
                                      : v.wholesaleStock;

                                  return (
                                    <div
                                      key={v.id}
                                      className={`px-2 py-1 rounded-xl text-[10px] font-mono font-bold border flex items-center gap-1 ${
                                        stockQty > 0
                                          ? 'bg-white text-pyjama-charcoal border-gray-200 shadow-xs'
                                          : 'bg-rose-50 text-rose-500 border-rose-100 opacity-60'
                                      }`}
                                    >
                                      <span>{v.size}</span>
                                      <span className="text-gray-300">•</span>
                                      <span
                                        className={
                                          stockQty > 0
                                            ? 'text-[#8A2B43] font-black'
                                            : 'text-rose-500 font-black'
                                        }
                                      >
                                        {stockQty}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
