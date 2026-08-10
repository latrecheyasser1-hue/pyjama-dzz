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
import { Product, StockType, Category } from '@/types/admin';

interface InventoryGridProps {
  products: Product[];
  categories?: Category[];
  activeStockTab: StockType;
  onUpdateStock: (variantId: string, stockType: StockType, newQuantity: number) => void;
  onDeleteProduct?: (productId: string) => void;
  onEditProduct?: (product: Product) => void;
}

export default function InventoryGrid({
  products = [],
  categories = [],
  activeStockTab = 'DELIVERY',
  onUpdateStock,
  onDeleteProduct,
  onEditProduct,
}: InventoryGridProps) {
  // Level 1 vs Level 2 state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Group categories dynamically from DB categories AND products
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

  // Add product counts per category
  products.forEach((p) => {
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
  });

  const categoryCardsList = Object.values(categoryStatsMap);

  // Level 2 Products Filter
  const activeProducts = products.filter((p) => {
    if (!selectedCategoryId) return true;
    return p.categoryId === selectedCategoryId || (!p.categoryId && selectedCategoryId === 'uncategorized');
  });

  const activeCategoryName =
    categoryCardsList.find((c) => c.id === selectedCategoryId)?.name || 'القسم المحدد';

  const handleDelete = (e: React.MouseEvent, productId: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`هل أنت تأكد من حذف المنتج "${name}"؟`)) return;
    if (onDeleteProduct) {
      onDeleteProduct(productId);
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
      {/* LEVEL 1: Category Cards Grid View */}
      {selectedCategoryId === null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-pyjama-charcoal flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#8A2B43]" />
              <span>أقسام المخزون المتاحة (Inventory Categories)</span>
            </h3>
            <span className="text-xs font-bold text-gray-500">
              إجمالي الأقسام: {categoryCardsList.length}
            </span>
          </div>

          {categoryCardsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-card space-y-3">
              <Package className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-700">لا توجد أقسام مسجلة حالياً</h4>
              <p className="text-xs text-gray-400">انتقل لتبويب "الأقسام والتصنيفات" لإضافة أقسام جديدة للمتجر.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {/* Dynamic Category Cards ONLY */}
              {categoryCardsList.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="bg-white p-6 rounded-3xl shadow-card border border-gray-100 cursor-pointer transition-all hover:border-[#8A2B43]/30 hover:scale-[1.02] hover:shadow-md group flex flex-col justify-between min-h-[160px]"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-pyjama-cream text-[#8A2B43] flex items-center justify-center border border-pyjama-pink/40 group-hover:bg-[#8A2B43] group-hover:text-white transition-colors">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <Tag className="w-5 h-5" />
                      )}
                    </div>

                    <span className="px-3 py-1 bg-pyjama-pink-soft text-[#8A2B43] rounded-full text-xs font-mono font-bold">
                      {cat.count} منتجات
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-pyjama-charcoal group-hover:text-[#8A2B43] transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 font-medium">اضغط لاستعراض كروت منتجات هذا القسم</p>
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
              <h3 className="text-lg font-bold text-pyjama-charcoal">لا توجد منتجات في هذا القسم حالياً</h3>
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
                        <span className="px-2.5 py-1 bg-pyjama-pink-soft text-[#8A2B43] text-[10px] font-bold rounded-lg border border-pyjama-pink/30">
                          {product.categoryNameAr || 'منتج عام'}
                        </span>

                        {product.isSurCommande && (
                          <span className="px-2.5 py-1 bg-purple-100 text-purple-900 text-[10px] font-bold rounded-lg border border-purple-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Sur Commande
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#8A2B43] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit3 className="w-3 h-3" /> تعديل
                        </span>
                        <button
                          onClick={(e) => handleDelete(e, product.id, product.nameAr)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Main Card Content */}
                    <div className="p-5 space-y-4 flex-1">
                      {/* Product Image & Info Header */}
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 rounded-2xl bg-pyjama-cream border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.nameAr}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-300" />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-pyjama-charcoal line-clamp-2 leading-tight group-hover:text-[#8A2B43] transition-colors">
                            {product.nameAr}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-block text-[11px] font-mono font-bold text-[#8A2B43] bg-pyjama-pink-soft/50 px-2 py-0.5 rounded-md">
                              {product.sku}
                            </span>
                            {product.unitsPerSerie && (
                              <span className="text-[10px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                {product.unitsPerSerie} قطعة / Série
                              </span>
                            )}
                          </div>

                          {product.supplierName && (
                            <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 pt-0.5">
                              <Building className="w-3 h-3 text-gray-400" />
                              <span className="truncate">المورد: {product.supplierName}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Inline Multi-Stock & Variant Controls per Color & Size */}
                      <div className="space-y-3 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-bold text-gray-700 flex items-center justify-between">
                          <span>
                            المخزون ({activeStockTab === 'DELIVERY' ? 'التوصيل' : activeStockTab === 'STORE' ? 'المحل' : 'الجملة'}):
                          </span>
                          {activeStockTab === 'WHOLESALE' && product.isSurCommande && (
                            <span className="text-[10px] text-purple-700 font-bold">على الطلب</span>
                          )}
                        </span>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {Object.entries(groupedColors).map(([colorName, variantsList]) => (
                            <div key={colorName} className="bg-pyjama-cream/20 p-2.5 rounded-2xl border border-gray-100 space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#8A2B43]" />
                                <span className="text-xs font-bold text-gray-800">{colorName}:</span>
                              </div>

                              {/* Size Chips & Inline Qty Controls */}
                              <div className="flex flex-wrap gap-2">
                                {variantsList.map((variant) => {
                                  const stockVal =
                                    activeStockTab === 'DELIVERY'
                                      ? variant.deliveryStock
                                      : activeStockTab === 'STORE'
                                      ? variant.storeStock
                                      : variant.wholesaleStock;

                                  return (
                                    <div
                                      key={variant.id}
                                      className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-gray-200 shadow-2xs"
                                    >
                                      <span className="font-mono text-xs font-bold text-gray-700 ml-1">
                                        {variant.size}
                                      </span>

                                      {/* Quick Counter Buttons [-] Qty [+] */}
                                      <div className="flex items-center gap-1 dir-ltr">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateStock(
                                              variant.id,
                                              activeStockTab,
                                              Math.max(0, stockVal - 1)
                                            );
                                          }}
                                          className="w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs transition-all"
                                        >
                                          -
                                        </button>
                                        <span
                                          className={`font-mono text-xs font-black px-1 ${
                                            stockVal <= 3 ? 'text-rose-600' : 'text-[#8A2B43]'
                                          }`}
                                        >
                                          {stockVal}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateStock(
                                              variant.id,
                                              activeStockTab,
                                              stockVal + 1
                                            );
                                          }}
                                          className="w-5 h-5 rounded-md bg-[#8A2B43] hover:bg-[#7A1C32] text-white font-bold flex items-center justify-center text-xs transition-all shadow-xs"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Multi-Tier Pricing Display */}
                    <div className="p-4 bg-pyjama-cream/40 border-t border-gray-100 flex flex-col gap-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-sans">التكلفة (Achat):</span>
                          <span className="font-bold text-gray-600">
                            {product.costPrice ? `${product.costPrice.toLocaleString()} DZD` : '0 DZD'}
                          </span>
                        </div>

                        <div className="text-left">
                          <span className="text-[10px] text-[#8A2B43] block font-sans font-bold">التجزئة (Retail):</span>
                          <span className="font-bold text-[#8A2B43] text-sm">
                            {product.sellingPrice.toLocaleString()} DZD
                          </span>
                        </div>
                      </div>

                      {(product.wholesalePrice || product.superGrosPrice) && (
                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-[11px]">
                          {product.wholesalePrice && (
                            <div>
                              <span className="text-[9px] text-purple-800 font-sans block">الجملة (Gros):</span>
                              <span className="font-bold text-purple-900">{product.wholesalePrice.toLocaleString()} DZD</span>
                            </div>
                          )}

                          {product.superGrosPrice && (
                            <div className="text-left">
                              <span className="text-[9px] text-purple-900 font-sans font-bold flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Super Gros:
                              </span>
                              <span className="font-bold text-amber-700">{product.superGrosPrice.toLocaleString()} DZD</span>
                            </div>
                          )}
                        </div>
                      )}
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
