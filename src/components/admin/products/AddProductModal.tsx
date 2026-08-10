'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Package,
  Wand2,
  Grid,
  DollarSign,
  Palette,
  Ruler,
  FileText,
  Truck,
  Phone,
  CheckCircle,
  Sparkles,
  Zap,
  Pipette,
  UploadCloud,
  Check,
  Boxes,
  Layers,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Category, Product, ProductVariant, Supplier, StockType } from '@/types/admin';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWarehouse?: StockType; // 'DELIVERY' | 'STORE' | 'WHOLESALE'
  onProductAdded: (newProduct: Product) => void;
  onProductUpdated?: (updatedProduct: Product) => void;
  reFetchProducts?: () => Promise<void>;
  productToEdit?: Product | null;
}

export type SizeCategoryKey = 'CLOTHING' | 'SHOES' | 'LINGERIE';

export const SIZE_CATEGORIES: Record<SizeCategoryKey, { label: string; sizes: string[] }> = {
  CLOTHING: {
    label: 'ملابس وبيجامات (Clothing & Pyjamas)',
    sizes: ['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'],
  },
  SHOES: {
    label: 'أحذية وبانتوف (Shoes & Footwear)',
    sizes: [
      '16', '17', '18', '19', '20', '21', '22', '23', '24', '25',
      '26', '27', '28', '29', '30', '31', '32', '33', '34', '35',
      '36', '37', '38', '39', '40', '41', '42', '43', '44', '45',
      '46', '47', '48', '49', '50',
    ],
  },
  LINGERIE: {
    label: 'لانجري وصدريات (Lingerie Cups)',
    sizes: [
      '70A', '75A', '80A', '85A', '90A',
      '70B', '75B', '80B', '85B', '90B', '95B', '100B', '105B', '110B', '115B', '120B',
      '80C', '85C', '90C', '95C', '100C', '105C', '110C', '115C', '120C',
      '85D', '90D', '95D', '100D', '105D', '110D',
    ],
  },
};

interface ColorInputItem {
  id: string;
  colorName: string;
  colorHex: string;
  imageUrl: string;
  // Warehouse Stock Quantity Maps
  deliveryStocks: Record<string, number>;
  storeStocks: Record<string, number>;
  wholesaleStocks: Record<string, number>;
  // Wholesale Serie Composition per Color
  serieComposition: Record<string, number>;
  activeSizes: string[];
}

export default function AddProductModal({
  isOpen,
  onClose,
  activeWarehouse = 'DELIVERY',
  onProductAdded,
  onProductUpdated,
  reFetchProducts,
  productToEdit,
}: AddProductModalProps) {
  // Basic Info Form State - Initialized strictly to empty string for Category
  const [nameAr, setNameAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [sku, setSku] = useState('');

  // Pricing State (DZD) - bulk_price mapped strictly
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [oldPrice, setOldPrice] = useState<number | ''>('');
  const [bulkDiscountPrice5, setBulkDiscountPrice5] = useState<number | ''>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | ''>('');
  const [superGrosPrice, setSuperGrosPrice] = useState<number | ''>('');

  // Wholesale System Thresholds State
  const [minWholesaleSeries, setMinWholesaleSeries] = useState<number>(1);
  const [superGrosThreshold, setSuperGrosThreshold] = useState<number>(10);

  // Flexible Size System State
  const [sizeCategory, setSizeCategory] = useState<SizeCategoryKey>('CLOTHING');
  const [isStandardSize, setIsStandardSize] = useState(false);
  const [minSize, setMinSize] = useState('S');
  const [maxSize, setMaxSize] = useState('XL');

  // Color Variants State - Default Neutral Blank State
  const [colors, setColors] = useState<ColorInputItem[]>([
    {
      id: 'c-1',
      colorName: '',
      colorHex: '#ffffff',
      imageUrl: '',
      deliveryStocks: { S: 10, M: 10, L: 10, XL: 10 },
      storeStocks: { S: 0, M: 0, L: 0, XL: 0 },
      wholesaleStocks: { S: 0, M: 0, L: 0, XL: 0 },
      serieComposition: { S: 2, M: 2, L: 2, XL: 2 },
      activeSizes: ['S', 'M', 'L', 'XL'],
    },
  ]);

  // Description & Additional Notes
  const [description, setDescription] = useState('');

  // Dynamic DB Lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingSuppliers, setIsLoadingLoadingSuppliers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!productToEdit;

  // Clean Form Reset
  const resetForm = () => {
    setNameAr('');
    setCategoryId('');
    setSelectedSupplierId('');
    setSupplierName('');
    setSupplierPhone('');
    setSku('');
    setCostPrice('');
    setSellingPrice('');
    setOldPrice('');
    setBulkDiscountPrice5('');
    setWholesalePrice('');
    setSuperGrosPrice('');
    setMinWholesaleSeries(1);
    setSuperGrosThreshold(10);
    setSizeCategory('CLOTHING');
    setIsStandardSize(false);
    setMinSize('S');
    setMaxSize('XL');
    setColors([
      {
        id: 'c-1',
        colorName: '',
        colorHex: '#ffffff',
        imageUrl: '',
        deliveryStocks: { S: 10, M: 10, L: 10, XL: 10 },
        storeStocks: { S: 0, M: 0, L: 0, XL: 0 },
        wholesaleStocks: { S: 0, M: 0, L: 0, XL: 0 },
        serieComposition: { S: 2, M: 2, L: 2, XL: 2 },
        activeSizes: ['S', 'M', 'L', 'XL'],
      },
    ]);
    setDescription('');
  };

  // Fetch Categories & Registered Suppliers from Supabase DB
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setIsLoadingCategories(true);
      setIsLoadingLoadingSuppliers(true);

      try {
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
        }

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

  // Pre-fill Edit Mode Data with Unified bulk_price Hydration
  useEffect(() => {
    if (!isOpen) return;

    if (productToEdit) {
      setNameAr(productToEdit.nameAr || '');
      setCategoryId(productToEdit.categoryId || '');
      setSupplierName(productToEdit.supplierName || '');
      setSupplierPhone(productToEdit.supplierPhone || '');
      setSku(productToEdit.sku || '');
      setCostPrice(productToEdit.costPrice ?? '');
      setSellingPrice(productToEdit.sellingPrice ?? '');
      setOldPrice(productToEdit.oldPrice ?? '');

      // Unified bulk_price hydration from all potential DB aliases
      const bulkPriceVal =
        (productToEdit as any).bulk_price ??
        (productToEdit as any).bulkPrice ??
        productToEdit.bulkDiscountPrice5 ??
        (productToEdit as any).bulk_discount_price_5 ??
        '';
      setBulkDiscountPrice5(bulkPriceVal);

      setWholesalePrice(productToEdit.wholesalePrice ?? '');
      setSuperGrosPrice(productToEdit.superGrosPrice ?? '');
      setMinWholesaleSeries(productToEdit.minWholesaleSeries ?? 1);
      setSuperGrosThreshold(productToEdit.superGrosThreshold ?? 10);
      setDescription(productToEdit.description || '');

      // Infer or load size category accurately from product data
      let detectedCat: SizeCategoryKey =
        (productToEdit as any).sizeCategory || (productToEdit as any).size_category || 'CLOTHING';

      if (productToEdit.variants && productToEdit.variants.length > 0) {
        const firstSize = productToEdit.variants[0].size;
        if (SIZE_CATEGORIES.SHOES.sizes.includes(firstSize)) {
          detectedCat = 'SHOES';
        } else if (SIZE_CATEGORIES.LINGERIE.sizes.includes(firstSize)) {
          detectedCat = 'LINGERIE';
        } else if (SIZE_CATEGORIES.CLOTHING.sizes.includes(firstSize)) {
          detectedCat = 'CLOTHING';
        }
      }
      setSizeCategory(detectedCat);

      const allSizesInProduct = Array.from(
        new Set(productToEdit.variants?.map((v) => v.size) || [])
      );
      if (allSizesInProduct.length > 0) {
        const catSizes = SIZE_CATEGORIES[detectedCat].sizes;
        const validIndices = allSizesInProduct
          .map((s) => catSizes.indexOf(s))
          .filter((i) => i !== -1)
          .sort((a, b) => a - b);

        if (validIndices.length > 0) {
          setMinSize(catSizes[validIndices[0]]);
          setMaxSize(catSizes[validIndices[validIndices.length - 1]]);
        }
      }

      if (productToEdit.colors && productToEdit.colors.length > 0) {
        const colorItems: ColorInputItem[] = productToEdit.colors.map((c, idx) => {
          const colorName = c.colorName;
          const colorVariants = productToEdit.variants?.filter((v) => v.color === colorName) || [];
          const activeSizes = colorVariants.map((v) => v.size);
          const delStocks: Record<string, number> = {};
          const storeStocks: Record<string, number> = {};
          const wsStocks: Record<string, number> = {};
          const serieComp: Record<string, number> = {};

          colorVariants.forEach((v) => {
            delStocks[v.size] = v.deliveryStock;
            storeStocks[v.size] = v.storeStock;
            wsStocks[v.size] = v.wholesaleStock;
            if (v.serieComposition && typeof v.serieComposition === 'object') {
              Object.assign(serieComp, v.serieComposition);
            } else {
              serieComp[v.size] = 2;
            }
          });

          return {
            id: `c-edit-${idx}-${Date.now()}`,
            colorName: colorName,
            colorHex: '#ffffff',
            imageUrl: c.imageUrl || productToEdit.imageUrl || '',
            deliveryStocks: delStocks,
            storeStocks: storeStocks,
            wholesaleStocks: wsStocks,
            serieComposition: Object.keys(serieComp).length > 0 ? serieComp : { S: 2, M: 2, L: 2, XL: 2 },
            activeSizes: activeSizes.length > 0 ? activeSizes : ['S', 'M', 'L', 'XL'],
          };
        });
        setColors(colorItems);
      } else if (productToEdit.variants && productToEdit.variants.length > 0) {
        const colorGroups: Record<string, ProductVariant[]> = {};
        productToEdit.variants.forEach((v) => {
          const col = v.color || 'اللون الأساسي';
          if (!colorGroups[col]) colorGroups[col] = [];
          colorGroups[col].push(v);
        });

        const colorItems: ColorInputItem[] = Object.entries(colorGroups).map(([colName, vars], idx) => {
          const delStocks: Record<string, number> = {};
          const storeStocks: Record<string, number> = {};
          const wsStocks: Record<string, number> = {};
          const serieComp: Record<string, number> = {};
          const activeSizes: string[] = [];

          vars.forEach((v) => {
            activeSizes.push(v.size);
            delStocks[v.size] = v.deliveryStock;
            storeStocks[v.size] = v.storeStock;
            wsStocks[v.size] = v.wholesaleStock;
            if (v.serieComposition && typeof v.serieComposition === 'object') {
              Object.assign(serieComp, v.serieComposition);
            } else {
              serieComp[v.size] = 2;
            }
          });

          return {
            id: `c-edit-v-${idx}-${Date.now()}`,
            colorName: colName,
            colorHex: '#ffffff',
            imageUrl: productToEdit.imageUrl || '',
            deliveryStocks: delStocks,
            storeStocks: storeStocks,
            wholesaleStocks: wsStocks,
            serieComposition: Object.keys(serieComp).length > 0 ? serieComp : { S: 2, M: 2, L: 2, XL: 2 },
            activeSizes,
          };
        });
        setColors(colorItems);
      }
    } else {
      resetForm();
    }
  }, [isOpen, productToEdit]);

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

  // Helper to generate unique SKU
  const handleAutoGenerateSku = () => {
    const timestampSuffix = Date.now().toString().slice(-4);
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku(`PYJ-${timestampSuffix}${randomNum}`);
  };

  // Size Category Change with Strict Filtering & Defaults per Category
  const handleSizeCategoryChange = (catKey: SizeCategoryKey) => {
    setSizeCategory(catKey);
    setIsStandardSize(false);
    const availableSizes = SIZE_CATEGORIES[catKey].sizes;

    let newMin = availableSizes[0];
    let newMax = availableSizes[Math.min(3, availableSizes.length - 1)];

    if (catKey === 'SHOES') {
      newMin = '36';
      newMax = '42';
    } else if (catKey === 'LINGERIE') {
      newMin = '75B';
      newMax = '95B';
    } else if (catKey === 'CLOTHING') {
      newMin = 'S';
      newMax = 'XL';
    }

    setMinSize(newMin);
    setMaxSize(newMax);

    const minIdx = availableSizes.indexOf(newMin);
    const maxIdx = availableSizes.indexOf(newMax);
    const defaultSizes = minIdx !== -1 && maxIdx !== -1 && minIdx <= maxIdx
      ? availableSizes.slice(minIdx, maxIdx + 1)
      : availableSizes.slice(0, 4);

    setColors((prev) =>
      prev.map((c) => {
        const nextActive = c.activeSizes.filter((s) => availableSizes.includes(s));
        return {
          ...c,
          activeSizes: nextActive.length > 0 ? nextActive : [...defaultSizes],
        };
      })
    );
  };

  // Helper to calculate sizes array bound strictly to active category
  const getGeneratedSizes = (): string[] => {
    if (isStandardSize) {
      return ['Standard / Free Size'];
    }

    const currentSizes = SIZE_CATEGORIES[sizeCategory].sizes;
    const minIndex = currentSizes.indexOf(minSize);
    const maxIndex = currentSizes.indexOf(maxSize);

    if (minIndex === -1 || maxIndex === -1 || minIndex > maxIndex) {
      return [currentSizes[0] || 'S'];
    }
    return currentSizes.slice(minIndex, maxIndex + 1);
  };

  const generatedSizesList = getGeneratedSizes();

  // Toggle Standard Size
  const handleToggleStandardSize = () => {
    setIsStandardSize((prev) => !prev);
  };

  // Color Handlers - Default new color to neutral/blank
  const handleAddColor = () => {
    const initDel: Record<string, number> = {};
    const initStore: Record<string, number> = {};
    const initWs: Record<string, number> = {};
    const initSerieComp: Record<string, number> = {};

    generatedSizesList.forEach((s) => {
      initDel[s] = activeWarehouse === 'DELIVERY' ? 10 : 0;
      initStore[s] = activeWarehouse === 'STORE' ? 5 : 0;
      initWs[s] = 0;
      initSerieComp[s] = 2;
    });

    setColors((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        colorName: '',
        colorHex: '#ffffff',
        imageUrl: '',
        deliveryStocks: initDel,
        storeStocks: initStore,
        wholesaleStocks: initWs,
        serieComposition: initSerieComp,
        activeSizes: [...generatedSizesList],
      },
    ]);
  };

  const handleUpdateColor = (id: string, field: keyof ColorInputItem, value: any) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleRemoveColor = (id: string) => {
    if (colors.length <= 1) return;
    setColors((prev) => prev.filter((c) => c.id !== id));
  };

  // Optimized Eyedropper API execution (Eliminates click delay & unnecessary re-renders)
  const handlePickColor = async (colorId: string) => {
    if (!('EyeDropper' in window)) {
      alert('ميزة قطارة الألوان غير مدعومة في متصفحك');
      return;
    }
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        handleUpdateColor(colorId, 'colorHex', result.sRGBHex);
      }
    } catch (e) {
      // User canceled eyedropper selection
    }
  };

  // Direct Image File Upload Handler
  const handleImageFileChange = async (colorId: string, file: File) => {
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    handleUpdateColor(colorId, 'imageUrl', localUrl);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `color-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          handleUpdateColor(colorId, 'imageUrl', publicData.publicUrl);
        }
      }
    } catch (err) {
      console.warn('Storage upload notice (retaining local preview URL):', err);
    }
  };

  // Size Chip Toggles for specific color
  const handleToggleColorSize = (colorId: string, size: string) => {
    setColors((prev) =>
      prev.map((c) => {
        if (c.id !== colorId) return c;
        const exists = c.activeSizes.includes(size);
        const nextActive = exists
          ? c.activeSizes.filter((s) => s !== size)
          : [...c.activeSizes, size];
        return { ...c, activeSizes: nextActive };
      })
    );
  };

  const handleSelectAllSizesForColor = (colorId: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === colorId ? { ...c, activeSizes: [...generatedSizesList] } : c))
    );
  };

  const handleDeselectAllSizesForColor = (colorId: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === colorId ? { ...c, activeSizes: [] } : c))
    );
  };

  // Update Stock Quantities for Retail (Delivery/Store)
  const handleUpdateStockQuantity = (colorId: string, size: string, qty: number) => {
    setColors((prev) =>
      prev.map((c) => {
        if (c.id !== colorId) return c;
        const targetMapKey = activeWarehouse === 'DELIVERY' ? 'deliveryStocks' : 'storeStocks';

        return {
          ...c,
          [targetMapKey]: {
            ...c[targetMapKey],
            [size]: Math.max(0, qty),
          },
        };
      })
    );
  };

  // Update Serie Composition per size for ONE single Serie
  const handleUpdateSerieSizeComposition = (colorId: string, size: string, count: number) => {
    setColors((prev) =>
      prev.map((c) => {
        if (c.id !== colorId) return c;
        return {
          ...c,
          serieComposition: {
            ...c.serieComposition,
            [size]: Math.max(0, count),
          },
        };
      })
    );
  };

  // STRICT FORMULA: Total Pieces Per Série = sum(selected_sizes.map(size => size.qty_per_serie))
  const getSerieTotalItems = (colorItem: ColorInputItem): number => {
    return colorItem.activeSizes.reduce((sum, size) => {
      const count = colorItem.serieComposition[size] !== undefined ? Number(colorItem.serieComposition[size]) : 2;
      return sum + (isNaN(count) ? 0 : count);
    }, 0);
  };

  const calculateDiscountPercentage = (): number | null => {
    if (oldPrice && sellingPrice && Number(oldPrice) > Number(sellingPrice)) {
      const discount = ((Number(oldPrice) - Number(sellingPrice)) / Number(oldPrice)) * 100;
      return Math.round(discount);
    }
    return null;
  };

  // Ultra-resilient variant upsert helper with fallback strategies for size / size_name schema cache differences
  const insertVariantsWithResilience = async (rows: any[]): Promise<boolean> => {
    if (rows.length === 0) return true;

    // Strategy 1: Upsert with size_name ONLY (matches original Supabase setup)
    const rowsWithSizeNameOnly = rows.map((r) => ({
      ...(r.id ? { id: r.id } : {}),
      product_id: r.product_id,
      color_name: r.color_name,
      color_image_url: r.color_image_url,
      size_name: r.size_name || r.size,
      delivery_stock: r.delivery_stock,
      store_stock: r.store_stock,
      wholesale_stock: r.wholesale_stock,
      serie_composition: r.serie_composition,
    }));

    let { error: err1 } = await supabase.from('product_variants').upsert(rowsWithSizeNameOnly);
    if (!err1) return true;

    // Strategy 2: Upsert with BOTH size AND size_name
    const rowsWithBoth = rows.map((r) => ({
      ...(r.id ? { id: r.id } : {}),
      product_id: r.product_id,
      color_name: r.color_name,
      color_image_url: r.color_image_url,
      size: r.size || r.size_name,
      size_name: r.size_name || r.size,
      delivery_stock: r.delivery_stock,
      store_stock: r.store_stock,
      wholesale_stock: r.wholesale_stock,
      serie_composition: r.serie_composition,
    }));

    let { error: err2 } = await supabase.from('product_variants').upsert(rowsWithBoth);
    if (!err2) return true;

    // Strategy 3: Basic columns with size_name
    const rowsBasic = rows.map((r) => ({
      ...(r.id ? { id: r.id } : {}),
      product_id: r.product_id,
      color_name: r.color_name,
      size_name: r.size_name || r.size,
      delivery_stock: r.delivery_stock,
      store_stock: r.store_stock,
      wholesale_stock: r.wholesale_stock,
    }));

    let { error: err3 } = await supabase.from('product_variants').upsert(rowsBasic);
    if (!err3) return true;

    console.error('All variant upsert attempts failed:', err3);
    alert('خطأ في حفظ متغيرات المنتج: ' + (err3.message || JSON.stringify(err3)));
    return false;
  };

  // Ultra-Resilient Product Insert/Update Helper with Multi-Stage Fallbacks for Column Differences
  const insertOrUpdateProductWithResilience = async (
    payload: Record<string, any>,
    targetProductId?: string
  ): Promise<{ data: any; error: any }> => {
    // Attempt 1: Full payload with select
    let result: { data: any; error: any } = targetProductId
      ? await supabase.from('products').update(payload).eq('id', targetProductId).select().single()
      : await supabase.from('products').insert([payload]).select().single();

    if (!result.error && result.data) return result;

    // Attempt 1b: Full payload without .single() if select single fails
    if (result.error) {
      let retryNoSingle = targetProductId
        ? await supabase.from('products').update(payload).eq('id', targetProductId).select()
        : await supabase.from('products').insert([payload]).select();

      if (!retryNoSingle.error && retryNoSingle.data && retryNoSingle.data.length > 0) {
        return { data: retryNoSingle.data[0], error: null };
      }
    }

    // Fallback 1: Duplicate SKU Key Constraint Violation
    const errMsg = result.error?.message || result.error?.details || JSON.stringify(result.error || {});
    if (errMsg.includes('products_sku_key') || errMsg.includes('duplicate key value')) {
      console.warn('Duplicate SKU detected. Generating unique SKU suffix and retrying...');
      const payloadNewSku = {
        ...payload,
        sku: `${payload.sku || 'PYJ'}-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`,
      };

      result = targetProductId
        ? await supabase.from('products').update(payloadNewSku).eq('id', targetProductId).select().single()
        : await supabase.from('products').insert([payloadNewSku]).select().single();

      if (!result.error && result.data) return result;
    }

    // Fallback 2: Remove size_category if column doesn't exist in DB schema
    if (result.error && 'size_category' in payload) {
      console.warn('Retrying insert/update without size_category column...');
      const payloadNoSizeCat = { ...payload };
      delete payloadNoSizeCat.size_category;

      result = targetProductId
        ? await supabase.from('products').update(payloadNoSizeCat).eq('id', targetProductId).select().single()
        : await supabase.from('products').insert([payloadNoSizeCat]).select().single();

      if (!result.error && result.data) return result;
    }

    // Fallback 3: Try bulk_price only vs bulk_discount_price_5 only
    if (result.error && ('bulk_price' in payload || 'bulk_discount_price_5' in payload)) {
      console.warn('Retrying insert/update with bulk_price only...');
      const payloadBulkPriceOnly = { ...payload };
      delete payloadBulkPriceOnly.bulk_discount_price_5;

      result = targetProductId
        ? await supabase.from('products').update(payloadBulkPriceOnly).eq('id', targetProductId).select().single()
        : await supabase.from('products').insert([payloadBulkPriceOnly]).select().single();

      if (!result.error && result.data) return result;

      console.warn('Retrying insert/update with bulk_discount_price_5 only...');
      const payloadBulkDiscountOnly = { ...payload };
      delete payloadBulkDiscountOnly.bulk_price;

      result = targetProductId
        ? await supabase.from('products').update(payloadBulkDiscountOnly).eq('id', targetProductId).select().single()
        : await supabase.from('products').insert([payloadBulkDiscountOnly]).select().single();

      if (!result.error && result.data) return result;
    }

    // Fallback 4: Remove optional schema columns
    if (result.error) {
      console.warn('Retrying insert/update without optional schema columns...');
      const payloadNoOptional = { ...payload };
      delete payloadNoOptional.bulk_price;
      delete payloadNoOptional.bulk_discount_price_5;
      delete payloadNoOptional.size_category;

      result = targetProductId
        ? await supabase.from('products').update(payloadNoOptional).eq('id', targetProductId).select().single()
        : await supabase.from('products').insert([payloadNoOptional]).select().single();

      if (!result.error && result.data) return result;
    }

    // Fallback 5: Essential core fields ONLY
    if (result.error) {
      console.warn('Retrying with standard core fields...');
      const corePayload: Record<string, any> = {
        name: payload.name,
        sku: payload.sku,
        category_id: payload.category_id || null,
        cost_price: payload.cost_price || 0,
        selling_price: payload.selling_price || 0,
        description: payload.description || null,
        image_url: payload.image_url || null,
      };

      result = targetProductId
        ? await supabase.from('products').update(corePayload).eq('id', targetProductId).select().single()
        : await supabase.from('products').insert([corePayload]).select().single();
    }

    return result;
  };

  // Context-Isolated Supabase Submit Handler with Zero-Stock Defaults for Inactive Warehouses
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameAr.trim()) {
      alert('الرجاء إدخال اسم المنتج');
      return;
    }

    if (activeWarehouse !== 'WHOLESALE' && (!sellingPrice || Number(sellingPrice) <= 0)) {
      alert('الرجاء إدخال سعر البيع الحالي بشكل صحيح');
      return;
    }

    if (activeWarehouse === 'WHOLESALE' && (!wholesalePrice || Number(wholesalePrice) <= 0)) {
      alert('الرجاء إدخال سعر البيع بالجملة بشكل صحيح');
      return;
    }

    const finalSku =
      sku.trim() || `PYJ-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
    const activeColors = colors.filter((c) => c.colorName.trim() !== '');

    if (activeColors.length === 0) {
      alert('الرجاء إدخال اسم لون واحد على الأقل للمنتج');
      return;
    }

    setIsSubmitting(true);

    try {
      let existingDbVariants: any[] = [];
      if (isEditMode && productToEdit) {
        const { data: dbVars } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productToEdit.id);

        if (dbVars) existingDbVariants = dbVars;
      }

      const firstColorTotalItemsInSerie = activeColors[0] ? getSerieTotalItems(activeColors[0]) : 4;

      const productPayload: Record<string, any> = {
        name: nameAr.trim(),
        sku: finalSku,
        category_id: categoryId || null,
        cost_price: Number(costPrice) || 0,
        description: description.trim() || null,
        image_url: activeColors[0]?.imageUrl || null,
        size_category: sizeCategory,
      };

      if (activeWarehouse === 'DELIVERY' || activeWarehouse === 'STORE') {
        productPayload.supplier_name = supplierName.trim() || null;
        productPayload.supplier_phone = supplierPhone.trim() || null;
        productPayload.selling_price = Number(sellingPrice) || 0;
        productPayload.old_price = oldPrice !== '' ? Number(oldPrice) : null;
        const bVal = bulkDiscountPrice5 !== '' ? Number(bulkDiscountPrice5) : null;
        productPayload.bulk_price = bVal;
        productPayload.bulk_discount_price_5 = bVal;
      }

      if (activeWarehouse === 'WHOLESALE') {
        productPayload.wholesale_price = wholesalePrice !== '' ? Number(wholesalePrice) : null;
        productPayload.super_gros_price = superGrosPrice !== '' ? Number(superGrosPrice) : null;
        productPayload.units_per_serie = firstColorTotalItemsInSerie;
        productPayload.min_wholesale_series = Number(minWholesaleSeries) || 1;
        productPayload.super_gros_threshold = Number(superGrosThreshold) || 10;
      }

      const selectedCat = categories.find((cat) => cat.id === categoryId);
      const generatedVariants: ProductVariant[] = [];

      activeColors.forEach((c) => {
        c.activeSizes.forEach((s) => {
          const existingV = existingDbVariants.find(
            (ev) =>
              (ev.color_name === c.colorName.trim() || ev.color === c.colorName.trim()) &&
              (ev.size === s || ev.size_name === s)
          );

          // Default Zero-Stock values for new products across all 3 warehouses
          let finalDel = 0;
          let finalStore = 0;
          let finalWs = 0;

          if (isEditMode && existingV) {
            finalDel = Number(existingV.delivery_stock) || 0;
            finalStore = Number(existingV.store_stock) || 0;
            finalWs = Number(existingV.wholesale_stock) || 0;
          }

          // Active Warehouse input assignment
          if (activeWarehouse === 'DELIVERY') {
            finalDel = c.deliveryStocks[s] !== undefined ? c.deliveryStocks[s] : 10;
          } else if (activeWarehouse === 'STORE') {
            finalStore = c.storeStocks[s] !== undefined ? c.storeStocks[s] : 5;
          } else if (activeWarehouse === 'WHOLESALE') {
            finalWs = 0;
          }

          generatedVariants.push({
            id: existingV ? String(existingV.id) : `v-${Date.now()}-${c.colorName}-${s}`,
            productId: isEditMode && productToEdit ? productToEdit.id : '',
            size: s,
            color: c.colorName.trim(),
            deliveryStock: finalDel,
            storeStock: finalStore,
            wholesaleStock: finalWs,
            serieComposition: c.serieComposition,
          });
        });
      });

      const bVal = bulkDiscountPrice5 !== '' ? Number(bulkDiscountPrice5) : null;

      if (isEditMode && productToEdit) {
        // UPDATE existing product with resilience
        const { error: productError } = await insertOrUpdateProductWithResilience(
          productPayload,
          productToEdit.id
        );

        if (productError) {
          const errDetail = productError.message || productError.details || productError.hint || JSON.stringify(productError);
          console.error('Products Update Error:', productError);
          alert('خطأ في حفظ وتعديل المنتج في قاعدة البيانات: ' + (errDetail !== '{}' ? errDetail : 'تأكد من الاتصال بالشبكة'));
          setIsSubmitting(false);
          return;
        }

        // Clean & Re-insert variants with merged stocks
        await supabase.from('product_variants').delete().eq('product_id', productToEdit.id);

        const variantRows = generatedVariants.map((v) => ({
          product_id: productToEdit.id,
          color_name: v.color,
          color_image_url: activeColors.find((c) => c.colorName.trim() === v.color)?.imageUrl || null,
          size: v.size,
          size_name: v.size,
          delivery_stock: v.deliveryStock,
          store_stock: v.storeStock,
          wholesale_stock: v.wholesaleStock,
          serie_composition: v.serieComposition,
        }));

        const success = await insertVariantsWithResilience(variantRows);
        if (!success) {
          setIsSubmitting(false);
          return;
        }

        const updatedProdObj: Product = {
          ...productToEdit,
          sku: finalSku,
          nameAr: nameAr.trim(),
          categoryId: categoryId || undefined,
          categoryNameAr: selectedCat?.name || undefined,
          costPrice: Number(costPrice) || 0,
          description: description.trim() || undefined,
          imageUrl: activeColors[0]?.imageUrl || undefined,
          colors: activeColors.map((c) => ({ colorName: c.colorName, imageUrl: c.imageUrl })),
          sizes: generatedSizesList,
          variants: generatedVariants,
        };

        if (activeWarehouse === 'DELIVERY' || activeWarehouse === 'STORE') {
          updatedProdObj.supplierName = supplierName.trim() || undefined;
          updatedProdObj.supplierPhone = supplierPhone.trim() || undefined;
          updatedProdObj.sellingPrice = Number(sellingPrice) || 0;
          updatedProdObj.oldPrice = oldPrice !== '' ? Number(oldPrice) : null;
          updatedProdObj.bulkPrice = bVal;
          updatedProdObj.bulk_price = bVal;
          updatedProdObj.bulkDiscountPrice5 = bVal;
        }

        if (activeWarehouse === 'WHOLESALE') {
          updatedProdObj.wholesalePrice = wholesalePrice !== '' ? Number(wholesalePrice) : null;
          updatedProdObj.superGrosPrice = superGrosPrice !== '' ? Number(superGrosPrice) : null;
          updatedProdObj.unitsPerSerie = firstColorTotalItemsInSerie;
          updatedProdObj.minWholesaleSeries = Number(minWholesaleSeries) || 1;
          updatedProdObj.superGrosThreshold = Number(superGrosThreshold) || 10;
        }

        if (onProductUpdated) {
          onProductUpdated(updatedProdObj);
        } else {
          onProductAdded(updatedProdObj);
        }

        if (reFetchProducts) {
          await reFetchProducts();
        }

        alert('تم تعديل وحفظ بيانات المنتج بنجاح! ✅');
      } else {
        // INSERT new product globally with resilience
        let insertedProductId = `prod-${Date.now()}`;
        const { data: prodData, error: productError } = await insertOrUpdateProductWithResilience(
          productPayload
        );

        if (productError) {
          const errDetail = productError.message || productError.details || productError.hint || JSON.stringify(productError);
          console.error('Products Insert Error:', productError);
          alert('خطأ في حفظ المنتج في قاعدة البيانات: ' + (errDetail !== '{}' ? errDetail : 'تأكد من الاتصال بالشبكة'));
          setIsSubmitting(false);
          return;
        }

        if (prodData) {
          insertedProductId = String(prodData.id);

          const variantRows = generatedVariants.map((v) => ({
            product_id: insertedProductId,
            color_name: v.color,
            color_image_url: activeColors.find((c) => c.colorName.trim() === v.color)?.imageUrl || null,
            size: v.size,
            size_name: v.size,
            delivery_stock: v.deliveryStock,
            store_stock: v.storeStock,
            wholesale_stock: v.wholesaleStock,
            serie_composition: v.serieComposition,
          }));

          const success = await insertVariantsWithResilience(variantRows);
          if (!success) {
            setIsSubmitting(false);
            return;
          }
        }

        const newProduct: Product = {
          id: insertedProductId,
          sku: finalSku,
          nameAr: nameAr.trim(),
          categoryId: categoryId || undefined,
          categoryNameAr: selectedCat?.name || undefined,
          costPrice: Number(costPrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          oldPrice: oldPrice !== '' ? Number(oldPrice) : null,
          bulkPrice: bVal,
          bulk_price: bVal,
          bulkDiscountPrice5: bVal,
          wholesalePrice: wholesalePrice !== '' ? Number(wholesalePrice) : null,
          superGrosPrice: superGrosPrice !== '' ? Number(superGrosPrice) : null,
          unitsPerSerie: firstColorTotalItemsInSerie,
          minWholesaleSeries: Number(minWholesaleSeries) || 1,
          superGrosThreshold: Number(superGrosThreshold) || 10,
          description: description.trim() || undefined,
          imageUrl: activeColors[0]?.imageUrl || undefined,
          colors: activeColors.map((c) => ({ colorName: c.colorName, imageUrl: c.imageUrl })),
          sizes: generatedSizesList,
          variants: generatedVariants,
        };

        if (activeWarehouse !== 'WHOLESALE') {
          newProduct.supplierName = supplierName.trim() || undefined;
          newProduct.supplierPhone = supplierPhone.trim() || undefined;
        }

        onProductAdded(newProduct);

        if (reFetchProducts) {
          await reFetchProducts();
        }

        alert('تم إضافة المنتج بنجاح وتسجيله في جميع المستودعات! ✅');
      }

      onClose();
    } catch (err: any) {
      console.error('General Product Save Error:', err);
      alert('خطأ عام أثناء حفظ المنتج: ' + (err?.message || String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const discountPercent = calculateDiscountPercentage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm dir-rtl" dir="rtl">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Clean Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#8A2B43] to-[#7A1C32] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Package className="w-5 h-5 text-pyjama-pink" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {isEditMode ? 'تعديل بيانات المنتج (Edit Product)' : 'إضافة منتج جديد (Add New Product)'}
              </h2>
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
          {/* SECTION A: Basic Info & Context-Aware Supplier Integration */}
          <div className="space-y-4 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2 border-b border-gray-200/80 pb-3">
              <Grid className="w-4 h-4 text-[#8A2B43]" />
              <span>أولاً: البيانات الأساسية {activeWarehouse !== 'WHOLESALE' && 'والمورّد'}</span>
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
                  placeholder=""
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                  required
                />
              </div>

              {/* Category Dropdown - Strictly Unselected Placeholder by Default */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  القسم (Category)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                >
                  <option value="" disabled>-- اختر القسم --</option>
                  {isLoadingCategories ? (
                    <option value="" disabled>جاري تحميل الأقسام...</option>
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
                    placeholder=""
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

              {/* HIDE SUPPLIER DETAILS COMPLETELY IN WHOLESALE WAREHOUSE CONTEXT */}
              {activeWarehouse !== 'WHOLESALE' && (
                <>
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
                        placeholder=""
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
                        placeholder=""
                        className="w-full pr-10 pl-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SECTION B: Context-Aware Pricing Section */}
          <div className="space-y-4 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
              <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#8A2B43]" />
                <span>ثانياً: الأسعار (Pricing DZD)</span>
              </h3>

              {discountPercent !== null && activeWarehouse !== 'WHOLESALE' && (
                <span className="px-3 py-1 bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>خصم {discountPercent}% 🔥</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Cost Price */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  سعر الشراء / التكلفة (Achat DZD)
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder=""
                  className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
                />
              </div>

              {/* RETAIL / STORE PRICES SHOWN ONLY IN DELIVERY & STORE CONTEXTS */}
              {activeWarehouse !== 'WHOLESALE' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {activeWarehouse === 'DELIVERY' ? 'سعر البيع بالتجزئة (Vente DZD)' : 'سعر البيع بمحل الشلف (Vente DZD)'} <span className="text-rose-500">*</span>
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

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      السعر القديم قبل الخصم (Old Price DZD)
                    </label>
                    <input
                      type="number"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder=""
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-400 focus:outline-none focus:border-[#8A2B43] shadow-sm"
                    />
                  </div>

                  {/* Strictly Mapped to bulk_price */}
                  <div>
                    <label className="block text-xs font-bold text-[#8A2B43] mb-1">
                      سعر 5 حبات فما فوق
                    </label>
                    <input
                      type="number"
                      value={bulkDiscountPrice5}
                      onChange={(e) => setBulkDiscountPrice5(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder=""
                      className="w-full px-4 py-3 bg-white rounded-xl border border-pyjama-pink text-xs font-mono font-bold text-[#8A2B43] focus:outline-none focus:border-[#8A2B43] shadow-sm"
                    />
                  </div>
                </>
              )}

              {/* WHOLESALE & SUPER GROS PRICES SHOWN ONLY IN WHOLESALE WAREHOUSE CONTEXT */}
              {activeWarehouse === 'WHOLESALE' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">
                      سعر البيع بالجملة العادي (Prix Gros DZD) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder=""
                      className="w-full px-4 py-3 bg-white rounded-xl border border-purple-200 text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-800 shadow-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">
                      سعر البيع بالجملة الكبيرة (Prix Super Gros DZD)
                    </label>
                    <input
                      type="number"
                      value={superGrosPrice}
                      onChange={(e) => setSuperGrosPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder=""
                      className="w-full px-4 py-3 bg-white rounded-xl border border-purple-200 text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-800 shadow-sm"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SECTION C: WHOLESALE THRESHOLDS SECTION (WHOLESALE CONTEXT ONLY) */}
          {activeWarehouse === 'WHOLESALE' && (
            <div className="space-y-5 bg-purple-50/60 p-5 rounded-3xl border border-purple-100">
              <h3 className="text-sm font-bold text-purple-900 flex items-center gap-2 border-b border-purple-200/80 pb-3">
                <Boxes className="w-5 h-5 text-purple-700" />
                <span>ثالثاً: عتبات طلبيات الجملة والسوبر قرو (Wholesale Thresholds)</span>
              </h3>

              {/* Wholesale Series Threshold Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    أقل عدد سريات بالجملة (Min Séries)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minWholesaleSeries}
                    onChange={(e) => setMinWholesaleSeries(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-purple-200 text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-800 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 mb-1">
                    عتبة السوبر قرو (Super Gros Threshold)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={superGrosThreshold}
                    onChange={(e) => setSuperGrosThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-purple-200 text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-800 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION D: Strict Size Category Selection System */}
          <div className="space-y-5 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-3">
              <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#8A2B43]" />
                <span>{activeWarehouse === 'WHOLESALE' ? 'رابعاً' : 'ثالثاً'}: نظام المقاسات المتاحة (Flexible Size System)</span>
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
                      {SIZE_CATEGORIES[sizeCategory].sizes.map((s) => (
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
                      {SIZE_CATEGORIES[sizeCategory].sizes.map((s) => (
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
              <span className="text-xs font-bold text-gray-600 ml-2">المقاسات المحدّدة:</span>
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

          {/* SECTION E: Dynamic Color Variants & Interactive [+] / [-] Stock Quantity Controls */}
          <div className="space-y-6 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-3">
              <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#8A2B43]" />
                <span>{activeWarehouse === 'WHOLESALE' ? 'خامساً' : 'رابعاً'}: ألوان المنتج والمخزون</span>
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

            {/* List of Colors */}
            <div className="space-y-6">
              {colors.map((colorItem, index) => {
                const totalSerieItems = getSerieTotalItems(colorItem);
                const isCustomColorHex = colorItem.colorHex && colorItem.colorHex !== '#ffffff';

                return (
                  <div
                    key={colorItem.id}
                    className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4"
                  >
                    {/* Top Bar for Color Item */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="w-7 h-7 rounded-full bg-pyjama-cream text-[#8A2B43] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>

                        {/* Dynamic Color Circle Badge Preview */}
                        <div
                          className="w-8 h-8 rounded-full border-2 shadow-sm shrink-0 transition-transform hover:scale-110 flex items-center justify-center"
                          style={{
                            backgroundColor: isCustomColorHex ? colorItem.colorHex : 'transparent',
                            borderColor: isCustomColorHex ? '#ffffff' : '#d1d5db',
                          }}
                          title={isCustomColorHex ? `الدرجة المحددة: ${colorItem.colorHex}` : 'لم يتم تحديد درجة اللون بعد'}
                        >
                          {!isCustomColorHex && <Palette className="w-4 h-4 text-gray-400" />}
                        </div>

                        {/* Color Name Input */}
                        <input
                          type="text"
                          value={colorItem.colorName}
                          onChange={(e) => handleUpdateColor(colorItem.id, 'colorName', e.target.value)}
                          placeholder="اسم اللون"
                          className="flex-1 px-4 py-2.5 bg-pyjama-cream/30 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43]"
                          required
                        />

                        {/* Eyedropper & Color Picker */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="color"
                            value={colorItem.colorHex || '#ffffff'}
                            onChange={(e) => handleUpdateColor(colorItem.id, 'colorHex', e.target.value)}
                            className="w-9 h-9 p-0.5 rounded-xl border border-gray-200 cursor-pointer bg-white"
                            title="عجلة الألوان"
                          />

                          <button
                            type="button"
                            onClick={() => handlePickColor(colorItem.id)}
                            className="p-2.5 rounded-xl bg-pyjama-pink-soft text-[#8A2B43] hover:bg-[#8A2B43] hover:text-white transition-all shadow-sm"
                            title="التقاط درجة اللون مباشرة من الصورة (EyeDropper)"
                          >
                            <Pipette className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Color Button */}
                      {colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(colorItem.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0 self-end sm:self-center"
                          title="حذف هذا اللون"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Middle: Direct Image File Upload Dropzone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        صورة هذا اللون (Direct Image Upload)
                      </label>

                      {colorItem.imageUrl ? (
                        <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50 flex items-center justify-center">
                          <img
                            src={colorItem.imageUrl}
                            alt={colorItem.colorName || 'صورة اللون'}
                            className="max-h-full max-w-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <label className="px-4 py-2 bg-white/90 text-gray-800 rounded-xl text-xs font-bold cursor-pointer hover:bg-white transition-all">
                              تغيير الصورة
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageFileChange(colorItem.id, file);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleUpdateColor(colorItem.id, 'imageUrl', '')}
                              className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all"
                              title="حذف الصورة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-gray-200 hover:border-[#8A2B43] bg-pyjama-cream/20 hover:bg-pyjama-cream/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                          <UploadCloud className="w-8 h-8 text-[#8A2B43] mb-2" />
                          <span className="text-xs font-bold text-gray-700">انقر هنا أو اسحب الصورة لرفع صورة هذا اللون مباشرة</span>
                          <span className="text-[10px] text-gray-400 mt-1">يدعم JPG, PNG, WEBP</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageFileChange(colorItem.id, file);
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {/* Bottom: RETAIL vs DYNAMIC WHOLESALE SÉRIÉ COMPOSITION */}
                    {activeWarehouse === 'WHOLESALE' ? (
                      /* DYNAMIC WHOLESALE SÉRIÉ COMPOSITION PER COLOR (EXACT FORMULA: SUM OF ACTIVE SIZE UNITS) */
                      <div className="space-y-4 pt-3 border-t border-purple-100 bg-purple-50/40 p-4 rounded-2xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-purple-700" />
                            <span>تركيبة السلسلة الواحدة (Série Composition) للون ({colorItem.colorName || `لون ${index + 1}`}):</span>
                          </span>

                          {/* EXACT AUTO-CALCULATED TOTAL SÉRIÉ PIECES BADGE */}
                          <span className="px-3.5 py-1.5 bg-purple-900 text-white rounded-xl text-xs font-mono font-bold shadow-xs flex items-center gap-1">
                            <span>إجمالي قطع السلسلة =</span>
                            <span className="text-amber-300 font-black text-sm">{totalSerieItems}</span>
                            <span>قطع</span>
                          </span>
                        </div>

                        {/* Breakdown per size inside 1 Série with [+] / [-] buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                          {generatedSizesList.map((size) => {
                            const isActive = colorItem.activeSizes.includes(size);
                            const currentSizeCountInSerie =
                              colorItem.serieComposition[size] !== undefined
                                ? colorItem.serieComposition[size]
                                : 2;

                            return (
                              <div
                                key={`serie-comp-${colorItem.id}-${size}`}
                                className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${
                                  isActive
                                    ? 'bg-white border-purple-300 shadow-xs'
                                    : 'bg-gray-50 border-gray-200 opacity-50'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleColorSize(colorItem.id, size)}
                                  className={`w-full py-1 rounded-xl text-xs font-mono font-black flex items-center justify-center gap-1 transition-all ${
                                    isActive
                                      ? 'bg-purple-900 text-white'
                                      : 'bg-white text-gray-700 border border-gray-200'
                                  }`}
                                >
                                  <span>{size}</span>
                                  {isActive && <Check className="w-3 h-3" />}
                                </button>

                                {isActive && (
                                  <div className="w-full flex flex-col items-center gap-1 mt-0.5">
                                    <span className="text-[10px] font-bold text-purple-900">قطع/سلسلة:</span>
                                    <div className="w-full flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateSerieSizeComposition(
                                            colorItem.id,
                                            size,
                                            Math.max(0, currentSizeCountInSerie - 1)
                                          )
                                        }
                                        className="w-5 h-5 rounded-md bg-purple-100 hover:bg-purple-800 hover:text-white text-purple-900 font-bold flex items-center justify-center text-xs transition-colors shrink-0"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        value={currentSizeCountInSerie}
                                        onChange={(e) =>
                                          handleUpdateSerieSizeComposition(
                                            colorItem.id,
                                            size,
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        className="w-10 text-center py-0.5 bg-white rounded-md border border-purple-200 text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-800"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateSerieSizeComposition(
                                            colorItem.id,
                                            size,
                                            currentSizeCountInSerie + 1
                                          )
                                        }
                                        className="w-5 h-5 rounded-md bg-purple-100 hover:bg-purple-800 hover:text-white text-purple-900 font-bold flex items-center justify-center text-xs transition-colors shrink-0"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* RETAIL (DELIVERY / STORE) STOCK QUANTITIES PER SIZE WITH INLINE [+] / [-] CONTROLS */
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">
                            كميات المخزون للون ({colorItem.colorName || `لون ${index + 1}`}):
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectAllSizesForColor(colorItem.id)}
                              className="text-[11px] font-bold text-[#8A2B43] hover:underline"
                            >
                              تحديد الكل
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleDeselectAllSizesForColor(colorItem.id)}
                              className="text-[11px] font-bold text-gray-500 hover:underline"
                            >
                              إلغاء الكل
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                          {generatedSizesList.map((size) => {
                            const isActive = colorItem.activeSizes.includes(size);
                            const targetMap =
                              activeWarehouse === 'DELIVERY'
                                ? colorItem.deliveryStocks
                                : colorItem.storeStocks;

                            const qtyVal = targetMap[size] ?? (activeWarehouse === 'DELIVERY' ? 10 : 5);

                            return (
                              <div
                                key={`${colorItem.id}-${size}`}
                                className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${
                                  isActive
                                    ? 'bg-pyjama-cream/80 border-[#8A2B43] shadow-sm'
                                    : 'bg-gray-50 border-gray-200 opacity-60'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleColorSize(colorItem.id, size)}
                                  className={`w-full py-1 rounded-xl text-xs font-mono font-black flex items-center justify-center gap-1 transition-all ${
                                    isActive
                                      ? 'bg-[#8A2B43] text-white shadow-xs'
                                      : 'bg-white text-[#7A1C32] border border-gray-200'
                                  }`}
                                >
                                  <span>{size}</span>
                                  {isActive && <Check className="w-3 h-3" />}
                                </button>

                                {isActive && (
                                  <div className="w-full flex flex-col items-center gap-1 mt-0.5">
                                    <span className="text-[10px] font-bold text-gray-500">الكمية:</span>
                                    <div className="w-full flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateStockQuantity(colorItem.id, size, Math.max(0, qtyVal - 1))}
                                        className="w-5 h-5 rounded-md bg-gray-100 hover:bg-[#8A2B43] hover:text-white text-gray-700 font-bold flex items-center justify-center text-xs transition-colors shrink-0"
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        value={qtyVal}
                                        onChange={(e) =>
                                          handleUpdateStockQuantity(
                                            colorItem.id,
                                            size,
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        className="w-10 text-center py-0.5 bg-white rounded-md border border-gray-300 text-xs font-mono font-bold focus:outline-none focus:border-[#8A2B43]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateStockQuantity(colorItem.id, size, qtyVal + 1)}
                                        className="w-5 h-5 rounded-md bg-gray-100 hover:bg-[#8A2B43] hover:text-white text-gray-700 font-bold flex items-center justify-center text-xs transition-colors shrink-0"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION F: Description & Fabric Specs */}
          <div className="space-y-3 bg-pyjama-cream/40 p-5 rounded-3xl border border-gray-100">
            <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2 border-b border-gray-200/80 pb-3">
              <FileText className="w-4 h-4 text-[#8A2B43]" />
              <span>{activeWarehouse === 'WHOLESALE' ? 'سادساً' : 'خامساً'}: الوصف وتفاصيل القماش (Description)</span>
            </h3>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder=""
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
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {isEditMode ? 'تحديث وتعديل المنتج (Update Product)' : 'حفظ المنتج في قاعدة البيانات (Save Product)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
