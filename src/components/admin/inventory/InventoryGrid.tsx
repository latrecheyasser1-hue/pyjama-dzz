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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Product, StockType, Category, ProductVariant } from '@/types/admin';

interface InventoryGridProps {
  products: Product[];
  categories?: Category[];
  activeStockTab: StockType;
  onUpdateStock: (variantId: string, stockType: StockType, newQuantity: number) => void;
  onDeleteProduct?: (productId: string, stockType: StockType) => void;
  onEditProduct?: (product: Product) => void;
  reFetchProducts?: () => Promise<void>;
}

// Letter Size Hierarchy Map for Ascending Sorting
const SIZE_LETTER_MAP: Record<string, number> = {
  '3XS': 1,
  '2XS': 2,
  'XS': 3,
  'S': 4,
  'M': 5,
  'L': 6,
  'XL': 7,
  '2XL': 8,
  'XXL': 8,
  '3XL': 9,
  'XXXL': 9,
  '4XL': 10,
  '5XL': 11,
  '6XL': 12,
};

// Helper: Sort Variants in Strict Ascending Size Order (from smallest to largest)
const sortVariantsAscending = (vars: ProductVariant[]): ProductVariant[] => {
  return [...vars].sort((a, b) => {
    const sizeA = (a.size || '').trim();
    const sizeB = (b.size || '').trim();

    const rankA = SIZE_LETTER_MAP[sizeA.toUpperCase()];
    const rankB = SIZE_LETTER_MAP[sizeB.toUpperCase()];

    if (rankA !== undefined && rankB !== undefined) {
      return rankA - rankB;
    }

    return sizeA.localeCompare(sizeB, undefined, { numeric: true, sensitivity: 'base' });
  });
};

// Interactive Touch/Click Swipe Carousel Subcomponent for Product Thumbnail with Clean Fallbacks
function ProductCardImageCarousel({ product }: { product: Product }) {
  const images: string[] = [];

  if (product.imageUrl) images.push(product.imageUrl);

  if (product.colors) {
    product.colors.forEach((c) => {
      if (c.imageUrl && !images.includes(c.imageUrl)) {
        images.push(c.imageUrl);
      }
    });
  }

  if (product.variants) {
    product.variants.forEach((v: any) => {
      const img = v.color_image_url || v.colorImageUrl || v.imageUrl;
      if (img && !images.includes(img)) {
        images.push(img);
      }
    });
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const activeSrc = images[currentIndex];
  const isCurrentFailed = !activeSrc || imageErrorMap[activeSrc];

  if (images.length === 0 || isCurrentFailed) {
    return (
      <div className="w-20 h-20 rounded-2xl bg-pyjama-cream border border-gray-200 overflow-hidden shrink-0 flex flex-col items-center justify-center gap-1 shadow-inner text-gray-400">
        <Package className="w-6 h-6 text-[#8A2B43]" />
        <span className="text-[9px] font-bold text-gray-400">بدون صورة</span>
      </div>
    );
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 25) {
      if (diff > 0) {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
  };

  return (
    <div
      dir="ltr"
      className="relative w-20 h-20 rounded-2xl bg-pyjama-cream border border-gray-200 overflow-hidden shrink-0 shadow-inner group/carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={activeSrc}
        alt=""
        className="w-full h-full object-cover transition-transform duration-300 group-hover/carousel:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          setImageErrorMap((prev) => ({ ...prev, [activeSrc]: true }));
        }}
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/70 hover:bg-[#8A2B43] text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all z-10 shadow-md transform hover:scale-110 active:scale-95"
            title="الصورة السابقة"
          >
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/70 hover:bg-[#8A2B43] text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all z-10 shadow-md transform hover:scale-110 active:scale-95"
            title="الصورة التالية"
          >
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentIndex ? 'w-2 bg-white shadow-xs' : 'w-1 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Color Hex Resolver Helper
const getColorHex = (colorName: string, variant: any, product?: Product): string => {
  if (variant?.color_hex && variant.color_hex.trim() !== '' && variant.color_hex.toLowerCase() !== '#ffffff') {
    return variant.color_hex;
  }
  if (variant?.colorHex && variant.colorHex.trim() !== '' && variant.colorHex.toLowerCase() !== '#ffffff') {
    return variant.colorHex;
  }

  if (product?.colors) {
    const foundCol = product.colors.find((c) => (c.colorName || '').trim().toLowerCase() === (colorName || '').trim().toLowerCase());
    if (foundCol?.colorHex && foundCol.colorHex.trim() !== '' && foundCol.colorHex.toLowerCase() !== '#ffffff') {
      return foundCol.colorHex;
    }
  }

  const normalized = (colorName || '').trim().toLowerCase();
  const colorMap: Record<string, string> = {
    أسود: '#000000',
    noire: '#000000',
    noir: '#000000',
    black: '#000000',
    أبيض: '#ffffff',
    blanc: '#ffffff',
    white: '#ffffff',
    أحمر: '#dc2626',
    rouge: '#dc2626',
    red: '#dc2626',
    وردي: '#ec4899',
    rose: '#ec4899',
    pink: '#ec4899',
    عنابي: '#800020',
    burgundy: '#800020',
    bordeaux: '#800020',
    أزرق: '#2563eb',
    bleu: '#2563eb',
    blue: '#2563eb',
    كحلي: '#1e3a8a',
    'navy blue': '#1e3a8a',
    أخضر: '#16a34a',
    vert: '#16a34a',
    green: '#16a34a',
    زيتي: '#556b2f',
    olive: '#556b2f',
    أصفر: '#eab308',
    jaune: '#eab308',
    yellow: '#eab308',
    رمادي: '#6b7280',
    gris: '#6b7280',
    grey: '#6b7280',
    gray: '#6b7280',
    بني: '#78350f',
    marron: '#78350f',
    brown: '#78350f',
    بيج: '#E5D3B3',
    beige: '#E5D3B3',
    بنفسجي: '#9333ea',
    violet: '#9333ea',
    purple: '#9333ea',
  };

  if (colorMap[normalized]) {
    return colorMap[normalized];
  }

  return variant?.color_hex || variant?.colorHex || '#8A2B43';
};

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

  // Helper: Master products exist globally across all 3 active warehouse contexts
  const hasStockInActiveWarehouse = (p: Product): boolean => {
    return true;
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

  // Direct Stock Quantity Change Handler via [+] / [-] Buttons on Size Chips
  const handleStockChange = async (
    variantId: string,
    currentQty: number,
    delta: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevents opening edit modal
    const newQty = Math.max(0, currentQty + delta);

    if (onUpdateStock) {
      onUpdateStock(variantId, activeStockTab, newQty);
    }

    const stockColumn =
      activeStockTab === 'DELIVERY'
        ? 'delivery_stock'
        : activeStockTab === 'STORE'
        ? 'store_stock'
        : 'wholesale_stock';

    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ [stockColumn]: newQty })
        .eq('id', variantId);

      if (error) {
        console.error('Error updating variant stock:', error);
      } else if (reFetchProducts) {
        await reFetchProducts();
      }
    } catch (err) {
      console.error('Exception updating variant stock:', err);
    }
  };

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
                        {/* Interactive Touch/Click Swipe Image Carousel */}
                        <ProductCardImageCarousel product={product} />

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
                              <div className="flex items-center gap-2 flex-wrap">
                                {product.wholesalePrice && Number(product.wholesalePrice) > 0 ? (
                                  <span className="text-sm font-black text-purple-900 font-mono">
                                    {product.wholesalePrice} د.ج
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                    سعر الجملة غير محدد
                                  </span>
                                )}
                                {product.superGrosPrice && Number(product.superGrosPrice) > 0 && (
                                  <span className="text-[11px] font-bold text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                    سوبر: {product.superGrosPrice} د.ج
                                  </span>
                                )}
                              </div>
                            ) : activeStockTab === 'STORE' ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                {(product.storePrice ?? product.sellingPrice) && Number(product.storePrice ?? product.sellingPrice) > 0 ? (
                                  <span className="text-sm font-black text-amber-900 font-mono bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                                    المحل: {product.storePrice ?? product.sellingPrice} د.ج
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                    سعر المحل غير محدد
                                  </span>
                                )}
                                {product.storeOldPrice && Number(product.storeOldPrice) > 0 && (
                                  <span className="text-xs text-gray-400 line-through font-mono">
                                    {product.storeOldPrice} د.ج
                                  </span>
                                )}
                                {product.storeBulkPrice && Number(product.storeBulkPrice) > 0 && (
                                  <span className="text-[10px] font-bold text-amber-900 font-mono bg-amber-100/60 px-2 py-0.5 rounded-md border border-amber-300/80" title="سعر 5 حبات فما فوق للمحل">
                                    5+ حبات المحل: {product.storeBulkPrice} د.ج
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                {product.sellingPrice && Number(product.sellingPrice) > 0 ? (
                                  <span className="text-sm font-black text-[#8A2B43] font-mono">
                                    {product.sellingPrice} د.ج
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                    السعر غير محدد
                                  </span>
                                )}
                                {product.oldPrice && Number(product.oldPrice) > 0 && (
                                  <span className="text-xs text-gray-400 line-through font-mono">
                                    {product.oldPrice} د.ج
                                  </span>
                                )}
                                {(product.bulk_price || product.bulkPrice || product.bulkDiscountPrice5) && (
                                  <span className="text-[10px] font-bold text-[#8A2B43] font-mono bg-pyjama-pink-soft px-2 py-0.5 rounded-md border border-pyjama-pink/40" title="سعر 5 حبات فما فوق">
                                    5+ حبات: {product.bulk_price || product.bulkPrice || product.bulkDiscountPrice5} د.ج
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Wholesale View: Série Composition & Color Swatch Badges vs Retail View */}
                      {activeStockTab === 'WHOLESALE' ? (
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                          {/* Top Section: Standard Wholesale Série Composition Breakdown */}
                          {(() => {
                            const firstColorVars = sortVariantsAscending(Object.values(groupedColors)[0] || []);

                            const getVariantSerieQty = (v: ProductVariant) => {
                              if (v.serieComposition && typeof v.serieComposition === 'object' && v.serieComposition[v.size] !== undefined) {
                                return Number(v.serieComposition[v.size]) || 2;
                              }
                              if (product.unitsPerSerie && firstColorVars.length > 0) {
                                const derived = Math.round(product.unitsPerSerie / firstColorVars.length);
                                return derived > 0 ? derived : 2;
                              }
                              return 2;
                            };

                            const actualUnitsPerSerie = product.unitsPerSerie || firstColorVars.reduce((acc, v) => acc + getVariantSerieQty(v), 0) || (firstColorVars.length * 2) || 8;

                            return (
                              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-purple-950 font-mono flex items-center gap-1.5" dir="ltr">
                                    <span>Série :</span>
                                  </span>
                                  <span className="text-[11px] font-mono font-black text-purple-900 bg-purple-100/90 px-2.5 py-0.5 rounded-md border border-purple-300/80">
                                    {actualUnitsPerSerie} قطعة / سيرية
                                  </span>
                                </div>

                                {/* Série Size Composition Badges */}
                                <div className="flex flex-wrap gap-1.5 pt-1 dir-ltr" dir="ltr">
                                  {firstColorVars.map((v) => {
                                    const compQty = getVariantSerieQty(v);
                                    return (
                                      <span
                                        key={v.id}
                                        className="px-2 py-1 rounded-xl bg-white text-purple-950 font-mono font-bold text-xs border border-purple-200 shadow-xs flex items-center gap-1"
                                      >
                                        <span className="font-extrabold">{v.size}</span>
                                        <span className="text-purple-700 font-black">×{compQty}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Bottom Section: Minimalist Color Swatches (No Misleading Red Badges) */}
                          <div className="bg-pyjama-cream/40 p-3 rounded-2xl border border-gray-200/80 space-y-2">
                            <h5 className="text-xs font-black text-gray-900">الألوان المتاحة للجملة:</h5>

                            <div className="flex flex-wrap gap-2">
                              {Object.entries(groupedColors).map(([colorName, colorVars]) => {
                                const hexColorVal = getColorHex(colorName, colorVars?.[0], product);

                                return (
                                  <div
                                    key={colorName}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-gray-200 shadow-xs"
                                  >
                                    <span
                                      className="w-4 h-4 rounded-full border border-gray-300 shadow-xs shrink-0"
                                      style={{ backgroundColor: hexColorVal }}
                                      title={`درجة اللون: ${colorName}`}
                                    />
                                    <span className="text-xs font-bold text-gray-900 font-mono">
                                      {colorName}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Retail & Store View: 2-Column Size Breakdown */
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                          {Object.entries(groupedColors).map(([colorName, colorVars]) => {
                            const hexColorVal = getColorHex(colorName, colorVars?.[0], product);
                            const sortedColorVars = sortVariantsAscending(colorVars);

                            return (
                              <div
                                key={colorName}
                                className="bg-pyjama-cream/50 p-3.5 rounded-2xl border border-gray-200/80 space-y-3"
                              >
                                {/* Color Title with Dynamic Color Swatch Circle */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-5 h-5 rounded-full border border-gray-300 shadow-sm shrink-0"
                                      style={{ backgroundColor: hexColorVal }}
                                      title={`درجة اللون: ${colorName}`}
                                    />
                                    <span className="text-xs font-black text-gray-900 tracking-wide">
                                      {colorName}
                                    </span>
                                  </div>
                                </div>

                                {/* 2-Column Side-by-Side Size Grid (Left-to-Right Flow) */}
                                <div className="grid grid-cols-2 gap-2 dir-ltr" dir="ltr">
                                  {sortedColorVars.map((v) => {
                                    const stockQty =
                                      activeStockTab === 'DELIVERY'
                                        ? v.deliveryStock
                                        : activeStockTab === 'STORE'
                                        ? v.storeStock
                                        : v.wholesaleStock;

                                    return (
                                      <div
                                        key={v.id}
                                        className={`px-2 py-1.5 rounded-2xl text-xs font-mono font-bold border flex items-center justify-between transition-all shadow-xs ${
                                          stockQty > 0
                                            ? 'bg-white text-gray-900 border-gray-300 hover:border-[#8A2B43]/50'
                                            : 'bg-rose-50/80 text-rose-700 border-rose-200 opacity-90'
                                        }`}
                                      >
                                        {/* Size Label Badge */}
                                        <span className="px-1.5 py-0.5 rounded-lg bg-gray-100 text-gray-900 font-extrabold text-xs border border-gray-200/80 shrink-0">
                                          {v.size}
                                        </span>

                                        {/* Stock Modifier Buttons & Quantity Display */}
                                        <div className="flex items-center gap-1 shrink-0">
                                          {/* Decrease Stock Button */}
                                          <button
                                            type="button"
                                            onClick={(e) => handleStockChange(v.id, stockQty, -1, e)}
                                            className="w-5 h-5 rounded-lg bg-gray-100 hover:bg-[#8A2B43] hover:text-white text-gray-800 font-black flex items-center justify-center text-xs transition-all shrink-0 active:scale-95 border border-gray-200/80"
                                            title="إنقاص الكمية -1"
                                          >
                                            -
                                          </button>

                                          <span
                                            className={
                                              stockQty > 0
                                                ? 'text-[#8A2B43] font-black text-xs min-w-[14px] text-center'
                                                : 'text-rose-600 font-black text-xs min-w-[14px] text-center'
                                            }
                                          >
                                            {stockQty}
                                          </span>

                                          {/* Increase Stock Button */}
                                          <button
                                            type="button"
                                            onClick={(e) => handleStockChange(v.id, stockQty, 1, e)}
                                            className="w-5 h-5 rounded-lg bg-gray-100 hover:bg-[#8A2B43] hover:text-white text-gray-800 font-black flex items-center justify-center text-xs transition-all shrink-0 active:scale-95 border border-gray-200/80"
                                            title="زيادة الكمية +1"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
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
