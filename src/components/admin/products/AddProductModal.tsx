'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  Wand2,
  Grid,
  DollarSign,
  Tag,
  Palette,
  Ruler,
  FileText,
  Truck,
  Phone,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Category, Product, ProductColor, ProductVariant, Supplier } from '@/types/admin';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProduct: Product) => void;
}

export type SizeCategoryKey = 'CLOTHING' | 'SHOES' | 'LINGERIE';

export const SIZE_CATEGORIES: Record<SizeCategoryKey, { label: string; sizes: string[] }> = {
  CLOTHING: {
    label: 'ملابس وبيجامات (Clothing)',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
  },
  SHOES: {
    label: 'أحذية وبانتوف (Shoes / Pointure)',
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42', '43'],
  },
  LINGERIE: {
    label: 'لانجري وصدريات (Lingerie Cups)',
    sizes: ['80B', '85B', '90B', '95B', '100B', '105B'],
  },
};

interface ColorInputItem {
  id: string;
  colorName: string;
  imageUrl: string;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onProductAdded,
}: AddProductModalProps) {
  // Basic Info Form State
  const [nameAr, setNameAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [sku, setSku] = useState('');

  // Detailed Pricing State (DZD)
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [oldPrice, setOldPrice] = useState<number | ''>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | ''>('');

  // Flexible Size System State
  const [sizeCategory, setSizeCategory] = useState<SizeCategoryKey>('CLOTHING');
  const [isStandardSize, setIsStandardSize] = useState(false);
  const [minSize, setMinSize] = useState('S');
  const [maxSize, setMaxSize] = useState('XL');

  // Color Variants State
  const [colors, setColors] = useState<ColorInputItem[]>([
    { id: 'c-1', colorName: 'Burgundy (عنابي)', imageUrl: '' },
  ]);

  // Description & Additional Notes
  const [description, setDescription] = useState('');

  // Dynamic DB Lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSuppliers, setIsLoadingLoadingSuppliers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Categories & Registered Suppliers from Supabase DB
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setIsLoadingCategories(true);
      setIsLoadingLoadingSuppliers(true);

      try {
        // 1. Fetch Categories
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (catData && catData.length > 0) {
          const mappedCats: Category[] = catData.map((item: any) => ({
            id: String(item.id),
            name: item.name || item.name_ar || '',
            slug: item.slug,
          }));
          setCategories(mappedCats);
          if (!categoryId && mappedCats.length > 0) {
            setCategoryId(mappedCats[0].id);
          }
        }

        // 2. Fetch Suppliers
        const { data: supData } = await supabase
          .from('suppliers')
          .select('*')
          .order('name', { ascending: true });

        if (supData && supData.length > 0) {
          const mappedSups: Supplier[] = supData.map((item: any) => ({
            id: String(item.id),
            name: item.name || item.supplier_name || '',
            phone: item.phone || item.supplier_phone || '',
            totalOrders: item.total_orders || 0,
            outstandingBalance: item.outstanding_balance || 0,
          }));
          setSuppliers(mappedSups);
        }
      } catch (err) {
        console.warn('Notice fetching initial data for modal:', err);
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingLoadingSuppliers(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Handle Supplier Selection
  const handleSupplierChange = (supId: string) => {
    setSelectedSupplierId(supId);
    if (supId === 'CUSTOM' || supId === '') {
      setSupplierName('');
      setSupplierPhone('');
      return;
    }

    const foundSup = suppliers.find((s) => s.id === supId);
    if (foundSup) {
      setSupplierName(foundSup.name);
      setSupplierPhone(foundSup.phone);
    }
  };

  // Helper to generate random SKU
  const handleAutoGenerateSku = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setSku(`PYJ-${randomNum}`);
  };

  // Handle Size Category Change
  const handleSizeCategoryChange = (catKey: SizeCategoryKey) => {
    setSizeCategory(catKey);
    setIsStandardSize(false);
    const availableSizes = SIZE_CATEGORIES[catKey].sizes;
    setMinSize(availableSizes[0]);
    setMaxSize(availableSizes[Math.min(3, availableSizes.length - 1)]);
  };

  // Toggle Standard Size
  const handleToggleStandardSize = () => {
    setIsStandardSize((prev) => !prev);
  };

  // Helper to calculate sizes array
  const getGeneratedSizes = (): string[] => {
    if (isStandardSize) {
      return ['Standard / Free Size'];
    }

    const currentSizes = SIZE_CATEGORIES[sizeCategory].sizes;
    const minIndex = currentSizes.indexOf(minSize);
    const maxIndex = currentSizes.indexOf(maxSize);

    if (minIndex === -1 || maxIndex === -1 || minIndex > maxIndex) {
      return [minSize];
    }
    return currentSizes.slice(minIndex, maxIndex + 1);
  };

  // Color Handlers
  const handleAddColor = () => {
    setColors((prev) => [
      ...prev,
      { id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, colorName: '', imageUrl: '' },
    ]);
  };

  const handleUpdateColor = (id: string, field: 'colorName' | 'imageUrl', value: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveColor = (id: string) => {
    if (colors.length <= 1) return;
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  // Calculate discount percentage
  const calculateDiscountPercentage = (): number | null => {
    if (oldPrice && sellingPrice && Number(oldPrice) > Number(sellingPrice)) {
      const discount = ((Number(oldPrice) - Number(sellingPrice)) / Number(oldPrice)) * 100;
      return Math.round(discount);
    }
    return null;
  };

  // Form Reset
  const resetForm = () => {
    setNameAr('');
    setSelectedSupplierId('');
    setSupplierName('');
    setSupplierPhone('');
    setSku('');
    setCostPrice('');
    setSellingPrice('');
    setOldPrice('');
    setWholesalePrice('');
    setSizeCategory('CLOTHING');
    setIsStandardSize(false);
    setMinSize('S');
    setMaxSize('XL');
    setColors([{ id: 'c-1', colorName: 'Burgundy (عنابي)', imageUrl: '' }]);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameAr.trim()) {
      alert('الرجاء إدخال اسم المنتج');
      return;
    }

    if (!sellingPrice || Number(sellingPrice) <= 0) {
      alert('الرجاء إدخال سعر البيع الحالي بشكل صحيح');
      return;
    }

    const finalSku = sku.trim() || `PYJ-${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedSizes = getGeneratedSizes();
    const activeColors = colors.filter((c) => c.colorName.trim() !== '');

    if (activeColors.length === 0) {
      alert('الرجاء إدخال اسم لون واحد على الأقل للمنتج');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare Product Base Payload
      const productPayload = {
        name: nameAr.trim(),
        sku: finalSku,
        category_id: categoryId || null,
        supplier_name: supplierName.trim() || null,
        supplier_phone: supplierPhone.trim() || null,
        cost_price: Number(costPrice) || 0,
        selling_price: Number(sellingPrice) || 0,
        old_price: oldPrice !== '' ? Number(oldPrice) : null,
        wholesale_price: wholesalePrice !== '' ? Number(wholesalePrice) : null,
        description: description.trim() || null,
        image_url: activeColors[0]?.imageUrl || null,
      };

      // 2. Insert into Supabase `products` table
      let insertedProductId = `prod-${Date.now()}`;
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .insert([productPayload])
        .select();

      if (prodError) {
        console.warn('Supabase product insert notice:', prodError.message || prodError);
      } else if (prodData && prodData.length > 0) {
        insertedProductId = String(prodData[0].id);

        // 3. Insert Child `product_colors`
        const colorRows = activeColors.map((c) => ({
          product_id: insertedProductId,
          color_name: c.colorName.trim(),
          image_url: c.imageUrl.trim() || null,
        }));
        await supabase.from('product_colors').insert(colorRows);

        // 4. Insert Child `product_sizes`
        const sizeRows = generatedSizes.map((s) => ({
          product_id: insertedProductId,
          size_name: s,
        }));
        await supabase.from('product_sizes').insert(sizeRows);

        // 5. Insert Child `product_variants`
        const variantRows: any[] = [];
        activeColors.forEach((c) => {
          generatedSizes.forEach((s) => {
            variantRows.push({
              product_id: insertedProductId,
              color_name: c.colorName.trim(),
              size_name: s,
              delivery_stock: 10,
              store_stock: 10,
              wholesale_stock: 10,
            });
          });
        });
        await supabase.from('product_variants').insert(variantRows);
      }

      // 6. Build Local Product Object for instant UI sync
      const generatedVariants: ProductVariant[] = [];
      activeColors.forEach((c) => {
        generatedSizes.forEach((s) => {
          generatedVariants.push({
            id: `v-${Date.now()}-${c.colorName}-${s}`,
            productId: insertedProductId,
            size: s,
            color: c.colorName.trim(),
            deliveryStock: 10,
            storeStock: 10,
            wholesaleStock: 10,
          });
        });
      });

      const selectedCat = categories.find((cat) => cat.id === categoryId);

      const newProduct: Product = {
        id: insertedProductId,
        sku: finalSku,
        nameAr: nameAr.trim(),
        categoryId: categoryId || undefined,
        categoryNameAr: selectedCat?.name || undefined,
        supplierName: supplierName.trim() || undefined,
        supplierPhone: supplierPhone.trim() || undefined,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        oldPrice: oldPrice !== '' ? Number(oldPrice) : null,
        wholesalePrice: wholesalePrice !== '' ? Number(wholesalePrice) : null,
        description: description.trim() || undefined,
        imageUrl: activeColors[0]?.imageUrl || undefined,
        colors: activeColors.map((c) => ({ colorName: c.colorName, imageUrl: c.imageUrl })),
        sizes: generatedSizes,
        variants: generatedVariants,
      };

      onProductAdded(newProduct);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Error adding product:', err);
      alert('حدث خطأ أثناء حفظ المنتج: ' + (err?.message || String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const generatedSizesList = getGeneratedSizes();
  const discountPercent = calculateDiscountPercentage();
  const currentCategorySizes = SIZE_CATEGORIES[sizeCategory].sizes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm dir-rtl" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#8A2B43] to-[#7A1C32] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Package className="w-5 h-5 text-pyjama-pink" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">إضافة منتج جديد (Add New Product)</h2>
              <p className="text-xs text-white/80 mt-0.5">
                تحديد أنواع المقاسات والمرونة (الملابس، الأحذية، الصدريات، والمقاس الموحد)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* SECTION A: Basic Info & Dynamic Supplier Integration */}
          <div className="space-y-4 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2 border-b border-gray-200/80 pb-3">
              <Grid className="w-4 h-4 text-[#8A2B43]" />
              <span>أولاً: البيانات الأساسية والمورّد (Basic Info & Supplier)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  اسم المنتج (Product Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: بيجاما حرير صيفي راقية مطرّزة"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  القسم (Category)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                >
                  {isLoadingCategories ? (
                    <option value="">جاري تحميل الأقسام...</option>
                  ) : categories.length === 0 ? (
                    <option value="">لا توجد أقسام متاحة</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Barcode / SKU Code */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  رمز SKU / البارلود (Barcode / SKU)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="مثال: PYJ-882910"
                    className="flex-1 px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateSku}
                    className="px-3 py-3 rounded-xl bg-pyjama-pink-soft text-[#8A2B43] hover:bg-[#8A2B43] hover:text-white transition-all text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm"
                    title="توليد SKU تلقائي"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">توليد</span>
                  </button>
                </div>
              </div>

              {/* Supplier Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  اختيار المورّد / الورشة (Supplier Name)
                </label>
                <div className="relative">
                  <Truck className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                  >
                    <option value="">-- اختر المورّد من القائمة المسجلة --</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.phone || 'بدون هاتف'})
                      </option>
                    ))}
                    <option value="CUSTOM">+ أدخل مورد جديد يدوياً</option>
                  </select>
                </div>
                {selectedSupplierId === 'CUSTOM' && (
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="اكتب اسم المورد الجديد يدوياً..."
                    className="w-full mt-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43]"
                  />
                )}
              </div>

              {/* Auto-Filled Supplier Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  رقم هاتف المورّد (Supplier Phone)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3.5" />
                  <input
                    type="text"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="يتم ملؤه تلقائياً..."
                    className="w-full pr-10 pl-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: Pricing & Volume Promotions (DZD) */}
          <div className="space-y-4 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
              <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#8A2B43]" />
                <span>ثانياً: الأسعار والتخفيضات والخصم عند شراء 5 حبات (DZD Pricing)</span>
              </h3>

              {discountPercent !== null && (
                <span className="px-3 py-1 bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>خصم {discountPercent}% 🔥</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Purchase Cost Price */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  سعر الشراء / التكلفة (DZD)
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder=""
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                />
              </div>

              {/* 2. Current Selling Price */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  سعر البيع للتجزئة (DZD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder=""
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold text-[#8A2B43] focus:outline-none focus:border-[#8A2B43] shadow-sm"
                  required
                />
              </div>

              {/* 3. Old Price Before Discount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  السعر القديم قبل الخصم (DZD)
                </label>
                <input
                  type="number"
                  value={oldPrice}
                  onChange={(e) => setOldPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder=""
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-400 focus:outline-none focus:border-[#8A2B43] shadow-sm"
                />
              </div>

              {/* 4. 5+ Units Retail Incentive Price */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  سعر الخصم عند شراء 5 حبات فما فوق (DZD)
                </label>
                <input
                  type="number"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder=""
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-[#8A2B43] shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION C: Flexible Size Selection System */}
          <div className="space-y-5 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-3">
              <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#8A2B43]" />
                <span>ثالثاً: نظام اختيار المقاسات والمرونة (Flexible Size System)</span>
              </h3>

              {/* Quick Standard Size Button */}
              <button
                type="button"
                onClick={handleToggleStandardSize}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isStandardSize
                    ? 'bg-[#8A2B43] text-white ring-2 ring-[#8A2B43]/30'
                    : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isStandardSize ? '✓ مقاس موحد مفّعل (Standard)' : '⚡ مقاس موحد (Free Size / Standard)'}</span>
              </button>
            </div>

            {/* Size Category Selector & Range Inputs */}
            {!isStandardSize && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Size Category Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      نوع المقاس (Size Category)
                    </label>
                    <select
                      value={sizeCategory}
                      onChange={(e) => handleSizeCategoryChange(e.target.value as SizeCategoryKey)}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-bold text-[#8A2B43] focus:outline-none focus:border-[#8A2B43] shadow-sm"
                    >
                      {Object.entries(SIZE_CATEGORIES).map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Smallest Size */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      أصغر مقاس (Smallest Size)
                    </label>
                    <select
                      value={minSize}
                      onChange={(e) => setMinSize(e.target.value)}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                    >
                      {currentCategorySizes.map((s) => (
                        <option key={`min-${s}`} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Largest Size */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      أكبر مقاس (Largest Size)
                    </label>
                    <select
                      value={maxSize}
                      onChange={(e) => setMaxSize(e.target.value)}
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                    >
                      {currentCategorySizes.map((s) => (
                        <option key={`max-${s}`} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Sizes Preview Badges */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200 flex flex-wrap items-center gap-2 shadow-sm">
              <span className="text-xs font-bold text-gray-600 ml-2">المقاسات المحدّدة تلقائياً:</span>
              {generatedSizesList.map((size) => (
                <span
                  key={size}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-black shadow-sm ${
                    isStandardSize
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-pyjama-pink-soft text-[#8A2B43] border border-pyjama-pink/40'
                  }`}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION D: Color Variants with Dedicated Images */}
          <div className="space-y-4 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
              <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#8A2B43]" />
                <span>رابعاً: ألوان المنتج والصور المخصصة (Colors & Dedicated Images)</span>
              </h3>

              <button
                type="button"
                onClick={handleAddColor}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ إضافة لون آخر</span>
              </button>
            </div>

            <div className="space-y-3">
              {colors.map((colorItem, index) => (
                <div
                  key={colorItem.id}
                  className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-pyjama-cream text-[#8A2B43] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Color Name */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={colorItem.colorName}
                      onChange={(e) => handleUpdateColor(colorItem.id, 'colorName', e.target.value)}
                      placeholder="اسم اللون (مثال: عنابي / أسود / بيج / Rose)"
                      className="w-full px-3 py-2.5 bg-pyjama-cream/20 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43]"
                      required
                    />
                  </div>

                  {/* Dedicated Image URL */}
                  <div className="flex-[2] relative">
                    <ImageIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      value={colorItem.imageUrl}
                      onChange={(e) => handleUpdateColor(colorItem.id, 'imageUrl', e.target.value)}
                      placeholder="رابط صورة هذا اللون المخصصة (URL)"
                      className="w-full pr-9 pl-3 py-2.5 bg-pyjama-cream/20 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#8A2B43]"
                    />
                  </div>

                  {/* Remove Color Button */}
                  {colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(colorItem.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                      title="حذف هذا اللون"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION E: Description & Fabric Specs */}
          <div className="space-y-3 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2 border-b border-gray-200/80 pb-3">
              <FileText className="w-4 h-4 text-[#8A2B43]" />
              <span>خامساً: الوصف وتفاصيل القماش (Description & Notes)</span>
            </h3>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف اختياري للمنتج (مثال: بيجاما صيفية مصنوعة من الحرير الطبيعي 100%، ملمس ناعم ومريح للنوم، غسيل يدوي بماء بارد)..."
              className="w-full p-4 bg-white rounded-2xl border border-gray-200 text-xs font-sans focus:outline-none focus:border-[#8A2B43] shadow-sm"
            />
          </div>

          {/* Action Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
              disabled={isSubmitting}
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جاري حفظ المنتج...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>حفظ المنتج في قاعدة البيانات (Save Product)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
