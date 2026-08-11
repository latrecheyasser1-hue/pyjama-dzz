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

// Helper to convert File to Base64 data string as an absolute fallback
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const COLOR_NAME_TO_HEX_MAP: Record<string, string> = {
  'بيج': '#E5D3B3',
  'beige': '#E5D3B3',
  'أسود': '#000000',
  'noire': '#000000',
  'noir': '#000000',
  'black': '#000000',
  'أبيض': '#FFFFFF',
  'blanc': '#FFFFFF',
  'white': '#FFFFFF',
  'أحمر': '#DC2626',
  'rouge': '#DC2626',
  'red': '#DC2626',
  'وردي': '#F472B6',
  'rose': '#F472B6',
  'pink': '#F472B6',
  'أزرق': '#2563EB',
  'bleu': '#2563EB',
  'blue': '#2563EB',
  'كحلي': '#1E3A8A',
  'marine': '#1E3A8A',
  'اخضر': '#16A34A',
  'أخضر': '#16A34A',
  'vert': '#16A34A',
  'green': '#16A34A',
  'زيتي': '#4D7C0F',
  'khaki': '#4D7C0F',
  'رمادي': '#6B7280',
  'gris': '#6B7280',
  'grey': '#6B7280',
  'gray': '#6B7280',
  'بني': '#78350F',
  'marron': '#78350F',
  'brown': '#78350F',
  'بنفسجي': '#7C3AED',
  'violet': '#7C3AED',
  'purple': '#7C3AED',
  'أصفر': '#EAB308',
  'jaune': '#EAB308',
  'yellow': '#EAB308',
  'برتقالي': '#F97316',
  'orange': '#F97316',
  'عنابي': '#800020',
  'bordeaux': '#800020',
  'burgundy': '#800020',
  'ذهبي': '#D4AF37',
  'gold': '#D4AF37',
  'فضي': '#C0C0C0',
  'argent': '#C0C0C0',
  'silver': '#C0C0C0',
};

export function getEffectiveColorHex(colorName?: string, hexValue?: string): string {
  if (hexValue && hexValue.trim() !== '' && hexValue.toLowerCase() !== '#ffffff') {
    return hexValue.trim();
  }
  if (colorName && colorName.trim() !== '') {
    const cleanName = colorName.trim().toLowerCase();
    if (COLOR_NAME_TO_HEX_MAP[cleanName]) {
      return COLOR_NAME_TO_HEX_MAP[cleanName];
    }
  }
  return hexValue && hexValue.trim() !== '' ? hexValue.trim() : '#ffffff';
}

// Supabase Storage Image Binary Upload Handler with Base64 Fallback
export async function uploadImageToSupabase(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // 1. Try uploading to 'product-images' bucket first, fallback to 'products'
    let { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    let bucketName = 'product-images';

    if (uploadError) {
      console.warn('Fallback: Uploading to products bucket...');
      const retry = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!retry.error) {
        bucketName = 'products';
        uploadError = null;
      }
    }

    if (!uploadError) {
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Storage upload notice (falling back to Base64 data string):', err);
  }

  // Absolute fallback: Convert file to Base64 data string so the link NEVER breaks!
  return await fileToBase64(file);
}

interface ColorInputItem {
  id: string;
  colorName: string;
  colorHex: string;
  imageUrl: string;
  imageFile?: File; // Preserves raw binary File object for pre-submit upload safety
  // Warehouse Stock Quantity Maps
  deliveryStocks: Record<string, number>;
  storeStocks: Record<string, number>;
  wholesaleStocks: Record<string, number>;
  // Wholesale Serie Composition per Color
  serieComposition: Record<string, number>;
  activeSizes: string[];
  deliveryActiveSizes: string[];
  storeActiveSizes: string[];
  wholesaleActiveSizes: string[];
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

  // Pricing State (DZD) - String/Number flexible state to prevent typing resets
  const [costPrice, setCostPrice] = useState<number | string>('');
  const [sellingPrice, setSellingPrice] = useState<number | string>('');
  const [oldPrice, setOldPrice] = useState<number | string>('');
  const [bulkDiscountPrice5, setBulkDiscountPrice5] = useState<number | string>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | string>('');
  const [superGrosPrice, setSuperGrosPrice] = useState<number | string>('');

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
      deliveryActiveSizes: ['S', 'M', 'L', 'XL'],
      storeActiveSizes: ['S', 'M', 'L', 'XL'],
      wholesaleActiveSizes: ['S', 'M', 'L', 'XL'],
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
  const productToEditId = productToEdit?.id;

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
        deliveryActiveSizes: ['S', 'M', 'L', 'XL'],
        storeActiveSizes: ['S', 'M', 'L', 'XL'],
        wholesaleActiveSizes: ['S', 'M', 'L', 'XL'],
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

  // Pre-fill Edit Mode Data ONLY ONCE when modal opens or productToEditId changes
  useEffect(() => {
    if (!isOpen) return;

    if (productToEdit) {
      let descColorMap: Record<string, string> = {};
      let descHexMap: Record<string, string> = {};
      let descMeta: any = {};

      const rawDesc = productToEdit.description || '';
      if (rawDesc) {
        const metaMatch = rawDesc.match(/<!--COLOR_METADATA:([\s\S]*?)-->/);
        if (metaMatch && metaMatch[1]) {
          try {
            const parsed = JSON.parse(metaMatch[1]);
            descMeta = parsed || {};
            if (parsed.images) descColorMap = parsed.images;
            if (parsed.hexes) descHexMap = parsed.hexes;
          } catch (e) {
            console.warn('Notice parsing descMetadata:', e);
          }
        } else {
          const match = rawDesc.match(/<!--COLOR_IMAGES:[\s\S]*?-->/);
          if (match && match[1]) {
            try {
              descColorMap = JSON.parse(match[1]);
            } catch (e) {
              console.warn('Notice parsing descColorMap:', e);
            }
          }
        }
      }

      const cleanDisplayDesc = rawDesc
        .replace(/<!--COLOR_IMAGES:[\s\S]*?-->/g, '')
        .replace(/<!--COLOR_METADATA:[\s\S]*?-->/g, '')
        .trim();
      setDescription(cleanDisplayDesc);

      setNameAr(productToEdit.nameAr || (productToEdit as any).name || '');
      setCategoryId(productToEdit.categoryId || (productToEdit as any).category_id || '');
      setSupplierName(productToEdit.supplierName || (productToEdit as any).supplier_name || '');
      setSupplierPhone(productToEdit.supplierPhone || (productToEdit as any).supplier_phone || '');
      const delMeta = descMeta.warehouses?.DELIVERY || {};
      const storeMeta = descMeta.warehouses?.STORE || {};
      const wsMeta = descMeta.warehouses?.WHOLESALE || {};

      if (activeWarehouse === 'DELIVERY') {
        const pVal = delMeta.sellingPrice ?? productToEdit.sellingPrice ?? (productToEdit as any).selling_price ?? '';
        setSellingPrice(pVal !== null && pVal !== undefined && pVal !== '' ? String(pVal) : '');
        const oVal = delMeta.oldPrice ?? productToEdit.oldPrice ?? (productToEdit as any).old_price ?? '';
        setOldPrice(oVal !== null && oVal !== undefined && oVal !== '' ? String(oVal) : '');
        const bVal = delMeta.bulkPrice ?? productToEdit.bulkPrice ?? productToEdit.bulkDiscountPrice5 ?? (productToEdit as any).bulk_price ?? descMeta.bulkPrice ?? '';
        setBulkDiscountPrice5(bVal !== null && bVal !== undefined && bVal !== '' ? String(bVal) : '');
      } else if (activeWarehouse === 'STORE') {
        const pVal = storeMeta.storePrice ?? storeMeta.sellingPrice ?? productToEdit.storePrice ?? descMeta.storePrice ?? productToEdit.sellingPrice ?? '';
        setSellingPrice(pVal !== null && pVal !== undefined && pVal !== '' ? String(pVal) : '');
        const oVal = storeMeta.storeOldPrice ?? storeMeta.oldPrice ?? productToEdit.storeOldPrice ?? '';
        setOldPrice(oVal !== null && oVal !== undefined && oVal !== '' ? String(oVal) : '');
        const bVal = storeMeta.storeBulkPrice ?? storeMeta.bulkPrice ?? productToEdit.storeBulkPrice ?? '';
        setBulkDiscountPrice5(bVal !== null && bVal !== undefined && bVal !== '' ? String(bVal) : '');
      } else if (activeWarehouse === 'WHOLESALE') {
        const wsPriceVal = wsMeta.wholesalePrice ?? (productToEdit as any).wholesale_price ?? productToEdit.wholesalePrice ?? descMeta.wholesalePrice ?? '';
        setWholesalePrice(wsPriceVal !== null && wsPriceVal !== undefined && wsPriceVal !== '' ? String(wsPriceVal) : '');
        const superGrosVal = wsMeta.superGrosPrice ?? (productToEdit as any).super_gros_price ?? productToEdit.superGrosPrice ?? descMeta.superGrosPrice ?? '';
        setSuperGrosPrice(superGrosVal !== null && superGrosVal !== undefined && superGrosVal !== '' ? String(superGrosVal) : '');
        const minSeriesVal = wsMeta.minWholesaleSeries ?? (productToEdit as any).min_wholesale_series ?? productToEdit.minWholesaleSeries ?? descMeta.minWholesaleSeries ?? 1;
        setMinWholesaleSeries(minSeriesVal);
        const superGrosThreshVal = wsMeta.superGrosThreshold ?? (productToEdit as any).super_gros_threshold ?? productToEdit.superGrosThreshold ?? descMeta.superGrosThreshold ?? 10;
        setSuperGrosThreshold(superGrosThreshVal);
      }

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

      // Query product_variants directly from DB on edit to guarantee color_image_url and color_hex hydration
      const hydrateColorVariantsFromDb = async () => {
        const { data: dbVars } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productToEdit.id);

        const variantsToMap = (dbVars && dbVars.length > 0)
          ? dbVars.map((v: any) => ({
              size: v.size || v.size_name || 'Standard',
              color: v.color_name || v.color || 'أساسي',
              color_hex: v.color_hex || v.colorHex || undefined,
              color_image_url: v.color_image_url || v.colorImageUrl || undefined,
              deliveryStock: Number(v.delivery_stock) || 0,
              storeStock: Number(v.store_stock) || 0,
              wholesaleStock: Number(v.wholesale_stock) || 0,
              serieComposition: v.serie_composition || undefined,
            }))
          : (productToEdit.variants || []);

        const colorGroups: Record<string, any[]> = {};
        variantsToMap.forEach((v: any) => {
          const colName = v.color || 'اللون الأساسي';
          if (!colorGroups[colName]) colorGroups[colName] = [];
          colorGroups[colName].push(v);
        });

        // Check productToEdit.colors for any additional color items
        if (productToEdit.colors) {
          productToEdit.colors.forEach((c) => {
            if (!colorGroups[c.colorName]) {
              colorGroups[c.colorName] = [];
            }
          });
        }

        const colorItems: ColorInputItem[] = Object.entries(colorGroups).map(([colName, vars], idx) => {
          const activeSizes: string[] = [];
          const delActiveSizes: string[] = [];
          const storeActiveSizes: string[] = [];
          const wsActiveSizes: string[] = [];
          const delStocks: Record<string, number> = {};
          const storeStocks: Record<string, number> = {};
          const wsStocks: Record<string, number> = {};
          const serieComp: Record<string, number> = {};

          const metaDelObj = descMeta.warehouses?.DELIVERY?.activeSizes?.find((x: any) => x.color === colName);
          const metaStoreObj = descMeta.warehouses?.STORE?.activeSizes?.find((x: any) => x.color === colName);
          const metaWsObj = descMeta.warehouses?.WHOLESALE?.activeSizes?.find((x: any) => x.color === colName);

          const savedDelSizes: string[] | undefined = metaDelObj?.sizes;
          const savedStoreSizes: string[] | undefined = metaStoreObj?.sizes;
          const savedWsSizes: string[] | undefined = metaWsObj?.sizes;

          const derivedUnitsPerSize =
            productToEdit.unitsPerSerie && vars.length > 0
              ? Math.round(productToEdit.unitsPerSerie / vars.length)
              : (productToEdit as any)?.units_per_serie && vars.length > 0
              ? Math.round((productToEdit as any).units_per_serie / vars.length)
              : descMeta.unitsPerSerie && vars.length > 0
              ? Math.round(descMeta.unitsPerSerie / vars.length)
              : undefined;

          vars.forEach((v) => {
            if (v.size) {
              if (!activeSizes.includes(v.size)) activeSizes.push(v.size);
              delStocks[v.size] = v.deliveryStock;
              storeStocks[v.size] = v.storeStock;
              wsStocks[v.size] = v.wholesaleStock;

              if (savedDelSizes ? savedDelSizes.includes(v.size) : v.deliveryStock > 0) {
                if (!delActiveSizes.includes(v.size)) delActiveSizes.push(v.size);
              }
              if (savedStoreSizes ? savedStoreSizes.includes(v.size) : v.storeStock > 0) {
                if (!storeActiveSizes.includes(v.size)) storeActiveSizes.push(v.size);
              }
              if (savedWsSizes ? savedWsSizes.includes(v.size) : (v.serieComposition?.[v.size] ?? v.wholesaleStock) > 0) {
                if (!wsActiveSizes.includes(v.size)) wsActiveSizes.push(v.size);
              }
            }

            let sizePieceCount: number | undefined;
            if (v.serieComposition && typeof v.serieComposition === 'object' && v.serieComposition[v.size] !== undefined) {
              sizePieceCount = Number(v.serieComposition[v.size]);
            } else if ((v as any).serie_composition && typeof (v as any).serie_composition === 'object' && (v as any).serie_composition[v.size] !== undefined) {
              sizePieceCount = Number((v as any).serie_composition[v.size]);
            } else if (descMeta.serieCompositions?.[colName]?.[v.size] !== undefined) {
              sizePieceCount = Number(descMeta.serieCompositions[colName][v.size]);
            } else if (descMeta.serieComposition?.[v.size] !== undefined) {
              sizePieceCount = Number(descMeta.serieComposition[v.size]);
            } else if (derivedUnitsPerSize && derivedUnitsPerSize > 0) {
              sizePieceCount = derivedUnitsPerSize;
            }

            if (sizePieceCount !== undefined && !isNaN(sizePieceCount)) {
              serieComp[v.size] = sizePieceCount;
            }
          });

          if (delActiveSizes.length === 0) delActiveSizes.push(...activeSizes);
          if (storeActiveSizes.length === 0) storeActiveSizes.push(...activeSizes);
          if (wsActiveSizes.length === 0) wsActiveSizes.push(...activeSizes);

          // Ensure active sizes have an assigned serie piece count without forcing hardcoded default override
          activeSizes.forEach((s) => {
            if (serieComp[s] === undefined) {
              serieComp[s] = derivedUnitsPerSize && derivedUnitsPerSize > 0 ? derivedUnitsPerSize : 2;
            }
          });

          // Extract color_image_url and color_hex from variant rows, metadata map, or color object in prop
          const varWithImg = vars.find((v) => v.color_image_url || v.colorImageUrl);
          const varWithHex = vars.find((v) => v.color_hex || v.colorHex);
          const colorPropObj = productToEdit.colors?.find((c) => c.colorName === colName);

          const savedImage =
            varWithImg?.color_image_url ||
            varWithImg?.colorImageUrl ||
            descColorMap[colName] ||
            colorPropObj?.imageUrl ||
            '';

          const savedHex =
            varWithHex?.color_hex ||
            varWithHex?.colorHex ||
            descHexMap[colName] ||
            colorPropObj?.colorHex ||
            '#ffffff';

          const activeSizesForCurrentTab =
            activeWarehouse === 'DELIVERY'
              ? delActiveSizes
              : activeWarehouse === 'STORE'
              ? storeActiveSizes
              : wsActiveSizes;

          return {
            id: `c-edit-${idx}-${Date.now()}`,
            colorName: colName,
            colorHex: savedHex, // 100% PERSISTENT SAVED COLOR HEX FROM DB AND METADATA!
            imageUrl: savedImage, // 100% PERSISTENT SAVED IMAGE FROM DB AND METADATA!
            deliveryStocks: delStocks,
            storeStocks: storeStocks,
            wholesaleStocks: wsStocks,
            serieComposition: Object.keys(serieComp).length > 0 ? serieComp : (descMeta.serieComposition || { S: 2, M: 2, L: 2, XL: 2 }),
            activeSizes: activeSizesForCurrentTab.length > 0 ? activeSizesForCurrentTab : ['S', 'M', 'L', 'XL'],
            deliveryActiveSizes: delActiveSizes.length > 0 ? delActiveSizes : activeSizes,
            storeActiveSizes: storeActiveSizes.length > 0 ? storeActiveSizes : activeSizes,
            wholesaleActiveSizes: wsActiveSizes.length > 0 ? wsActiveSizes : activeSizes,
          };
        });

        if (colorItems.length > 0) {
          setColors(colorItems);
        }
      };

      hydrateColorVariantsFromDb();
    } else {
      resetForm();
    }
  }, [isOpen, productToEditId, activeWarehouse || 'DELIVERY']);

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
        imageFile: undefined,
        deliveryStocks: initDel,
        storeStocks: initStore,
        wholesaleStocks: initWs,
        serieComposition: initSerieComp,
        activeSizes: [...generatedSizesList],
        deliveryActiveSizes: [...generatedSizesList],
        storeActiveSizes: [...generatedSizesList],
        wholesaleActiveSizes: [...generatedSizesList],
      },
    ]);
  };

  const handleUpdateColor = (id: string, field: keyof ColorInputItem, value: any) => {
    setColors((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        if (field === 'colorName' && (c.colorHex === '#ffffff' || !c.colorHex)) {
          const inferred = getEffectiveColorHex(value, c.colorHex);
          if (inferred !== '#ffffff') {
            updated.colorHex = inferred;
          }
        }
        return updated;
      })
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

  // INDEPENDENT UPLOAD HANDLER PER COLOR INDEX (Strictly modifies ONLY target colorIndex)
  const handleColorImageChange = async (colorIndex: number, file: File) => {
    if (!file) return;

    // 1. Set instant local preview strictly on target color index
    const localUrl = URL.createObjectURL(file);
    setColors((prev) =>
      prev.map((c, idx) => (idx === colorIndex ? { ...c, imageUrl: localUrl, imageFile: file } : c))
    );

    // 2. Upload binary to Supabase Storage and set publicUrl strictly on target color index
    try {
      const publicUrl = await uploadImageToSupabase(file);
      setColors((prev) =>
        prev.map((c, idx) => (idx === colorIndex ? { ...c, imageUrl: publicUrl } : c))
      );
    } catch (err) {
      console.warn('Storage upload error on color index', colorIndex, err);
    }
  };

  // Size Chip Toggles for specific color isolated strictly by activeWarehouse context
  const handleToggleColorSize = (colorId: string, size: string) => {
    setColors((prev) =>
      prev.map((c) => {
        if (c.id !== colorId) return c;
        const key =
          activeWarehouse === 'DELIVERY'
            ? 'deliveryActiveSizes'
            : activeWarehouse === 'STORE'
            ? 'storeActiveSizes'
            : 'wholesaleActiveSizes';
        const currentList = c[key] || c.activeSizes || [];
        const exists = currentList.includes(size);
        const nextActive = exists
          ? currentList.filter((s) => s !== size)
          : [...currentList, size];
        return {
          ...c,
          [key]: nextActive,
          activeSizes: nextActive,
        };
      })
    );
  };

  const handleSelectAllSizesForColor = (colorId: string) => {
    setColors((prev) =>
      prev.map((c) => {
        if (c.id !== colorId) return c;
        const key =
          activeWarehouse === 'DELIVERY'
            ? 'deliveryActiveSizes'
            : activeWarehouse === 'STORE'
            ? 'storeActiveSizes'
            : 'wholesaleActiveSizes';
        return {
          ...c,
          [key]: [...generatedSizesList],
          activeSizes: [...generatedSizesList],
        };
      })
    );
  };

  const handleDeselectAllSizesForColor = (colorId: string) => {
    setColors((prev) =>
      prev.map((c) => {
        if (c.id !== colorId) return c;
        const key =
          activeWarehouse === 'DELIVERY'
            ? 'deliveryActiveSizes'
            : activeWarehouse === 'STORE'
            ? 'storeActiveSizes'
            : 'wholesaleActiveSizes';
        return {
          ...c,
          [key]: [],
          activeSizes: [],
        };
      })
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

  // Helper to ensure all image URLs are public Supabase URLs and not local blob: URLs
  const ensurePublicImageUrls = async (colorItems: ColorInputItem[]): Promise<ColorInputItem[]> => {
    const updated = await Promise.all(
      colorItems.map(async (c) => {
        // 1. If raw binary File object exists in state, upload to Supabase storage
        if (c.imageFile && (c.imageUrl.startsWith('blob:') || c.imageUrl.startsWith('data:'))) {
          try {
            const publicUrl = await uploadImageToSupabase(c.imageFile);
            return { ...c, imageUrl: publicUrl };
          } catch (e) {
            console.warn('Error uploading c.imageFile on submit:', e);
          }
        }

        // 2. Fallback: Convert blob URL to File and upload to Supabase storage
        if (c.imageUrl && (c.imageUrl.startsWith('blob:') || c.imageUrl.startsWith('data:'))) {
          try {
            const response = await fetch(c.imageUrl);
            const blob = await response.blob();
            const fileExt = blob.type.split('/')[1] || 'jpg';
            const file = new File([blob], `product_${Date.now()}.${fileExt}`, { type: blob.type || 'image/jpeg' });
            const publicUrl = await uploadImageToSupabase(file);
            return { ...c, imageUrl: publicUrl };
          } catch (e) {
            console.warn('Error converting blob URL to public storage URL:', e);
          }
        }
        return c;
      })
    );
    return updated;
  };

  // Resilient variant upsert helper (Sanitizes IDs and fallbacks across schema variations)
  const insertVariantsWithResilience = async (rows: any[]): Promise<boolean> => {
    if (rows.length === 0) return true;

    // Helper to sanitize row objects (strip string IDs like 'v-...' and preserve color_hex and color_image_url)
    const sanitizeRow = (r: any) => {
      const cleanRow: Record<string, any> = {
        product_id: r.product_id,
        color_name: r.color_name,
        color_hex: r.color_hex || r.colorHex || null,
        color_image_url: r.color_image_url || null,
        size: r.size || r.size_name,
        size_name: r.size_name || r.size,
        delivery_stock: Number(r.delivery_stock) || 0,
        store_stock: Number(r.store_stock) || 0,
        wholesale_stock: Number(r.wholesale_stock) || 0,
        serie_composition: r.serie_composition || null,
      };

      // Only include integer IDs if valid numeric ID exists
      if (r.id && !isNaN(Number(r.id)) && Number(r.id) > 0) {
        cleanRow.id = Number(r.id);
      }

      return cleanRow;
    };

    const sanitizedRows = rows.map(sanitizeRow);

    // Strategy 1: Upsert with sanitized integer IDs or auto-generated IDs (includes color_image_url)
    let { error: err1 } = await supabase.from('product_variants').upsert(sanitizedRows);
    if (!err1) return true;

    console.warn('Upsert strategy 1 notice, trying clean insert without id column:', err1?.message || err1);

    // Strategy 2: Remove ID column completely for clean insert (always succeeds after delete)
    const rowsNoId = sanitizedRows.map((r) => {
      const { id, ...rest } = r;
      return rest;
    });

    let { error: err2 } = await supabase.from('product_variants').insert(rowsNoId);
    if (!err2) return true;

    console.warn('Strategy 2 notice, trying fallback without color_image_url column:', err2?.message || err2);

    // Strategy 3: Try without color_image_url in case DB schema lacks color_image_url column
    const rowsNoColorImg = rowsNoId.map((r) => {
      const { color_image_url, ...rest } = r;
      return rest;
    });

    let { error: err3 } = await supabase.from('product_variants').insert(rowsNoColorImg);
    if (!err3) return true;

    console.warn('Strategy 3 notice, trying fallback without serie_composition:', err3?.message || err3);

    // Strategy 4: Standard core fields ONLY (product_id, color_name, size_name, stocks)
    const rowsBasic = rowsNoId.map((r) => ({
      product_id: r.product_id,
      color_name: r.color_name || r.color,
      size_name: r.size_name || r.size,
      delivery_stock: Number(r.delivery_stock) || 0,
      store_stock: Number(r.store_stock) || 0,
      wholesale_stock: Number(r.wholesale_stock) || 0,
    }));

    let { error: err4 } = await supabase.from('product_variants').insert(rowsBasic);
    if (!err4) return true;

    console.error('All variant insert attempts failed:', err4);
    alert('خطأ في حفظ متغيرات المنتج: ' + (err4.message || JSON.stringify(err4)));
    return false;
  };

  // Ultra-Resilient Product Insert/Update Helper preserving 100% of price fields
  const insertOrUpdateProductWithResilience = async (
    payload: Record<string, any>,
    targetProductId?: string
  ): Promise<{ data: any; error: any }> => {
    // Sanitize category_id to ensure it is a valid UUID string or null
    const isValidUuid = (id: any) =>
      typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const cleanPayload: Record<string, any> = { ...payload };
    delete cleanPayload.size_category; // size_category is stored in description metadata

    if (cleanPayload.category_id && !isValidUuid(cleanPayload.category_id)) {
      cleanPayload.category_id = null;
    }

    const tryUpdate = async (p: Record<string, any>) => {
      let { data, error } = await supabase.from('products').update(p).eq('id', targetProductId).select();
      if (!error && data && data.length > 0) return { data: data[0], error: null };

      let { error: directErr } = await supabase.from('products').update(p).eq('id', targetProductId);
      if (!directErr) return { data: { id: targetProductId, ...p }, error: null };

      return { data: null, error: directErr || error };
    };

    const tryInsert = async (p: Record<string, any>) => {
      let { data, error } = await supabase.from('products').insert([p]).select();
      if (!error && data && data.length > 0) return { data: data[0], error: null };

      let { error: directErr } = await supabase.from('products').insert([p]);
      if (!directErr) return { data: p, error: null };

      return { data: null, error: directErr || error };
    };

    if (targetProductId) {
      let updateRes = await tryUpdate(cleanPayload);
      if (!updateRes.error) return updateRes;

      // Iterative schema cache fallback: strip un-migrated schema columns if error indicates missing column
      const optionalCols = ['min_wholesale_series', 'super_gros_threshold', 'super_gros_price', 'wholesale_price', 'units_per_serie', 'bulk_price', 'bulk_discount_price_5'];
      const fallbackPayload = { ...cleanPayload };
      for (const col of optionalCols) {
        const errString = JSON.stringify(updateRes.error || {});
        if (errString.includes(col) || errString.includes('schema cache') || errString.includes('Could not find')) {
          delete fallbackPayload[col];
          updateRes = await tryUpdate(fallbackPayload);
          if (!updateRes.error) return updateRes;
        }
      }

      console.error('Update Error Detail:', updateRes.error);
      return updateRes;
    }

    let insertRes = await tryInsert(cleanPayload);
    if (!insertRes.error) return insertRes;

    const optionalCols = ['min_wholesale_series', 'super_gros_threshold', 'super_gros_price', 'wholesale_price', 'units_per_serie', 'bulk_price', 'bulk_discount_price_5'];
    const fallbackInsertPayload = { ...cleanPayload };
    for (const col of optionalCols) {
      const errString = JSON.stringify(insertRes.error || {});
      if (errString.includes(col) || errString.includes('schema cache') || errString.includes('Could not find')) {
        delete fallbackInsertPayload[col];
        insertRes = await tryInsert(fallbackInsertPayload);
        if (!insertRes.error) return insertRes;
      }
    }

    console.error('Insert Error Detail:', insertRes.error);
    return insertRes;
  };

  // Context-Isolated Supabase Submit Handler with Zero-Stock Defaults for Inactive Warehouses
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameAr.trim()) {
      alert('الرجاء إدخال اسم المنتج');
      return;
    }

    if (!isEditMode && activeWarehouse !== 'WHOLESALE' && (!sellingPrice || Number(sellingPrice) <= 0)) {
      alert('الرجاء إدخال سعر البيع الحالي بشكل صحيح');
      return;
    }

    if (!isEditMode && activeWarehouse === 'WHOLESALE' && (!wholesalePrice || Number(wholesalePrice) <= 0)) {
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
      // Ensure all uploaded image files are converted from blob: URLs to public Supabase Storage URLs
      const sanitizedColors = await ensurePublicImageUrls(activeColors);

      let existingDbVariants: any[] = [];
      if (isEditMode && productToEdit) {
        const { data: dbVars } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productToEdit.id);

        if (dbVars) existingDbVariants = dbVars;
      }

      const firstColorTotalItemsInSerie = sanitizedColors[0] ? getSerieTotalItems(sanitizedColors[0]) : 4;

      // Primary product image: first non-empty color image or null
      const primaryProductImg = sanitizedColors.find((c) => c.imageUrl && c.imageUrl.trim() !== '')?.imageUrl || null;

      // Encode per-color images and hexes into description metadata tag as an unbeatable fallback store
      const colorImageMap: Record<string, string> = {};
      const colorHexMap: Record<string, string> = {};
      sanitizedColors.forEach((c) => {
        const cName = c.colorName.trim();
        if (cName) {
          if (c.imageUrl && c.imageUrl.trim() !== '') {
            colorImageMap[cName] = c.imageUrl.trim();
          }
          if (c.colorHex && c.colorHex.trim() !== '') {
            colorHexMap[cName] = c.colorHex.trim();
          }
        }
      });

      let finalDesc = description
        .replace(/<!--COLOR_IMAGES:[\s\S]*?-->/g, '')
        .replace(/<!--COLOR_METADATA:[\s\S]*?-->/g, '')
        .trim();

      const serieCompositionsMap: Record<string, Record<string, number>> = {};
      sanitizedColors.forEach((c) => {
        if (c.colorName.trim() && c.serieComposition) {
          serieCompositionsMap[c.colorName.trim()] = c.serieComposition;
        }
      });

      let existingDescMeta: any = {};
      if (productToEdit?.description) {
        const match = productToEdit.description.match(/<!--COLOR_METADATA:([\s\S]*?)-->/);
        if (match && match[1]) {
          try { existingDescMeta = JSON.parse(match[1]) || {}; } catch (e) {}
        }
      }
      const existingWarehousesMeta = existingDescMeta.warehouses || {};

      const currentWarehouseData: Record<string, any> = {};
      if (activeWarehouse === 'WHOLESALE') {
        currentWarehouseData.wholesalePrice = wholesalePrice !== '' ? Number(wholesalePrice) : null;
        currentWarehouseData.superGrosPrice = superGrosPrice !== '' ? Number(superGrosPrice) : null;
        currentWarehouseData.unitsPerSerie = firstColorTotalItemsInSerie;
        currentWarehouseData.minWholesaleSeries = Number(minWholesaleSeries) || 1;
        currentWarehouseData.superGrosThreshold = Number(superGrosThreshold) || 10;
        currentWarehouseData.serieComposition = sanitizedColors[0]?.serieComposition || null;
        currentWarehouseData.serieCompositions = serieCompositionsMap;
        currentWarehouseData.activeSizes = sanitizedColors.map((c) => ({ color: c.colorName.trim(), sizes: c.wholesaleActiveSizes || c.activeSizes }));
      } else if (activeWarehouse === 'DELIVERY') {
        currentWarehouseData.sellingPrice = sellingPrice !== '' ? Number(sellingPrice) : null;
        currentWarehouseData.oldPrice = oldPrice !== '' ? Number(oldPrice) : null;
        currentWarehouseData.bulkPrice = bulkDiscountPrice5 !== '' ? Number(bulkDiscountPrice5) : null;
        currentWarehouseData.activeSizes = sanitizedColors.map((c) => ({ color: c.colorName.trim(), sizes: c.deliveryActiveSizes || c.activeSizes }));
      } else if (activeWarehouse === 'STORE') {
        currentWarehouseData.storePrice = sellingPrice !== '' ? Number(sellingPrice) : null;
        currentWarehouseData.storeOldPrice = oldPrice !== '' ? Number(oldPrice) : null;
        currentWarehouseData.storeBulkPrice = bulkDiscountPrice5 !== '' ? Number(bulkDiscountPrice5) : null;
        currentWarehouseData.activeSizes = sanitizedColors.map((c) => ({ color: c.colorName.trim(), sizes: c.storeActiveSizes || c.activeSizes }));
      }

      const metaPayload = {
        images: colorImageMap,
        hexes: colorHexMap,
        sizeCategory: sizeCategory,
        wholesalePrice: wholesalePrice !== '' ? Number(wholesalePrice) : null,
        superGrosPrice: superGrosPrice !== '' ? Number(superGrosPrice) : null,
        unitsPerSerie: firstColorTotalItemsInSerie,
        minWholesaleSeries: Number(minWholesaleSeries) || 1,
        superGrosThreshold: Number(superGrosThreshold) || 10,
        serieComposition: sanitizedColors[0]?.serieComposition || null,
        serieCompositions: serieCompositionsMap,
        warehouses: {
          ...existingWarehousesMeta,
          [activeWarehouse]: currentWarehouseData,
        },
      };
      if (Object.keys(colorImageMap).length > 0 || Object.keys(colorHexMap).length > 0 || sizeCategory || wholesalePrice !== '') {
        finalDesc = `${finalDesc}\n<!--COLOR_METADATA:${JSON.stringify(metaPayload)}-->`.trim();
      }

      const productPayload: Record<string, any> = {
        name: nameAr.trim(),
        sku: finalSku,
        category_id: categoryId || null,
        cost_price: Number(costPrice) || 0,
        description: finalDesc || null,
        image_url: primaryProductImg,
      };

      const bVal = bulkDiscountPrice5 !== '' && !isNaN(Number(bulkDiscountPrice5)) ? Number(bulkDiscountPrice5) : null;

      productPayload.supplier_name = supplierName.trim() || (isEditMode ? ((productToEdit as any)?.supplier_name ?? productToEdit?.supplierName ?? null) : null);
      productPayload.supplier_phone = supplierPhone.trim() || (isEditMode ? ((productToEdit as any)?.supplier_phone ?? productToEdit?.supplierPhone ?? null) : null);
      productPayload.old_price = oldPrice !== '' ? Number(oldPrice) : (isEditMode ? ((productToEdit as any)?.old_price ?? productToEdit?.oldPrice ?? null) : null);
      productPayload.bulk_price = bVal ?? (isEditMode ? ((productToEdit as any)?.bulk_price ?? productToEdit?.bulkPrice ?? null) : null);
      productPayload.bulk_discount_price_5 = bVal ?? (isEditMode ? ((productToEdit as any)?.bulk_discount_price_5 ?? productToEdit?.bulkDiscountPrice5 ?? null) : null);

      if (activeWarehouse === 'DELIVERY') {
        productPayload.selling_price = sellingPrice !== '' ? Number(sellingPrice) : (isEditMode ? ((productToEdit as any)?.selling_price ?? productToEdit?.sellingPrice ?? 0) : 0);
      } else {
        productPayload.selling_price = isEditMode ? ((productToEdit as any)?.selling_price ?? productToEdit?.sellingPrice ?? 0) : (sellingPrice !== '' ? Number(sellingPrice) : 0);
      }

      productPayload.wholesale_price = String(wholesalePrice) !== '' && wholesalePrice !== undefined && wholesalePrice !== null ? Number(wholesalePrice) : (isEditMode ? ((productToEdit as any)?.wholesale_price ?? productToEdit?.wholesalePrice ?? null) : null);
      productPayload.super_gros_price = String(superGrosPrice) !== '' && superGrosPrice !== undefined && superGrosPrice !== null ? Number(superGrosPrice) : (isEditMode ? ((productToEdit as any)?.super_gros_price ?? productToEdit?.superGrosPrice ?? null) : null);
      productPayload.units_per_serie = firstColorTotalItemsInSerie || (isEditMode ? ((productToEdit as any)?.units_per_serie ?? productToEdit?.unitsPerSerie ?? 4) : 4);
      productPayload.min_wholesale_series = String(minWholesaleSeries) !== '' && minWholesaleSeries !== undefined && minWholesaleSeries !== null ? Number(minWholesaleSeries) : (isEditMode ? ((productToEdit as any)?.min_wholesale_series ?? productToEdit?.minWholesaleSeries ?? 1) : 1);
      productPayload.super_gros_threshold = String(superGrosThreshold) !== '' && superGrosThreshold !== undefined && superGrosThreshold !== null ? Number(superGrosThreshold) : (isEditMode ? ((productToEdit as any)?.super_gros_threshold ?? productToEdit?.superGrosThreshold ?? 10) : 10);

      const selectedCat = categories.find((cat) => cat.id === categoryId);
      const generatedVariants: ProductVariant[] = [];

      sanitizedColors.forEach((c) => {
        const colNameTrim = c.colorName.trim();
        const existingSizesForColor = isEditMode
          ? existingDbVariants
              .filter((ev) => (ev.color_name || ev.color) === colNameTrim)
              .map((ev) => ev.size || ev.size_name)
              .filter(Boolean)
          : [];

        const delActiveList = c.deliveryActiveSizes || c.activeSizes;
        const storeActiveList = c.storeActiveSizes || c.activeSizes;
        const wsActiveList = c.wholesaleActiveSizes || c.activeSizes;

        const allSizesForColor = Array.from(new Set([
          ...delActiveList,
          ...storeActiveList,
          ...wsActiveList,
          ...existingSizesForColor,
        ]));

        allSizesForColor.forEach((s) => {
          const existingV = existingDbVariants.find(
            (ev) =>
              ((ev.color_name || ev.color) === colNameTrim) &&
              ((ev.size || ev.size_name) === s)
          );

          let finalDel = existingV ? Number(existingV.delivery_stock) || 0 : 0;
          let finalStore = existingV ? Number(existingV.store_stock) || 0 : 0;
          let finalWs = existingV ? Number(existingV.wholesale_stock) || 0 : 0;
          let finalSerieComp = existingV ? (existingV.serie_composition || (existingV as any).serieComposition) : undefined;

          if (delActiveList.includes(s)) {
            if (activeWarehouse === 'DELIVERY') {
              finalDel = c.deliveryStocks[s] !== undefined ? c.deliveryStocks[s] : (isEditMode && existingV ? finalDel : 10);
            }
          } else {
            finalDel = 0;
          }

          if (storeActiveList.includes(s)) {
            if (activeWarehouse === 'STORE') {
              finalStore = c.storeStocks[s] !== undefined ? c.storeStocks[s] : (isEditMode && existingV ? finalStore : 5);
            }
          } else {
            finalStore = 0;
          }

          if (wsActiveList.includes(s)) {
            if (activeWarehouse === 'WHOLESALE') {
              finalWs = c.wholesaleStocks[s] !== undefined ? c.wholesaleStocks[s] : (isEditMode && existingV ? finalWs : 0);
              finalSerieComp = c.serieComposition;
            }
          } else {
            finalWs = 0;
          }

          const colImg = c.imageUrl || undefined;
          const colHex = c.colorHex || '#ffffff';
          generatedVariants.push({
            id: existingV ? String(existingV.id) : `v-${Date.now()}-${colNameTrim}-${s}`,
            productId: isEditMode && productToEdit ? productToEdit.id : '',
            size: s,
            color: colNameTrim,
            color_hex: colHex,
            colorHex: colHex,
            color_image_url: colImg,
            colorImageUrl: colImg,
            deliveryStock: finalDel,
            storeStock: finalStore,
            wholesaleStock: finalWs,
            serieComposition: finalSerieComp || c.serieComposition,
          });
        });
      });

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
          color_hex: sanitizedColors.find((c) => c.colorName.trim() === v.color)?.colorHex || v.color_hex || '#ffffff',
          color_image_url: sanitizedColors.find((c) => c.colorName.trim() === v.color)?.imageUrl || null,
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
          imageUrl: primaryProductImg || undefined,
          colors: sanitizedColors.map((c) => ({ colorName: c.colorName, colorHex: c.colorHex || '#ffffff', imageUrl: c.imageUrl || undefined })),
          sizes: generatedSizesList,
          variants: generatedVariants,
        };

        updatedProdObj.supplierName = supplierName.trim() || (productToEdit as any)?.supplier_name || productToEdit?.supplierName || undefined;
        updatedProdObj.supplierPhone = supplierPhone.trim() || (productToEdit as any)?.supplier_phone || productToEdit?.supplierPhone || undefined;
        
        if (activeWarehouse === 'STORE') {
          updatedProdObj.storePrice = sellingPrice !== '' ? Number(sellingPrice) : productToEdit.storePrice ?? null;
          updatedProdObj.storeOldPrice = oldPrice !== '' ? Number(oldPrice) : productToEdit.storeOldPrice ?? null;
          updatedProdObj.storeBulkPrice = bVal ?? productToEdit.storeBulkPrice ?? null;
          updatedProdObj.sellingPrice = productToEdit.sellingPrice ?? 0;
          updatedProdObj.oldPrice = productToEdit.oldPrice ?? null;
          updatedProdObj.bulkPrice = productToEdit.bulkPrice ?? null;
        } else if (activeWarehouse === 'DELIVERY') {
          updatedProdObj.sellingPrice = sellingPrice !== '' ? Number(sellingPrice) : productToEdit.sellingPrice ?? 0;
          updatedProdObj.oldPrice = oldPrice !== '' ? Number(oldPrice) : productToEdit.oldPrice ?? null;
          updatedProdObj.bulkPrice = bVal ?? productToEdit.bulkPrice ?? null;
          updatedProdObj.bulk_price = bVal ?? productToEdit.bulkPrice ?? null;
          updatedProdObj.bulkDiscountPrice5 = bVal ?? productToEdit.bulkDiscountPrice5 ?? null;
          updatedProdObj.storePrice = productToEdit.storePrice ?? null;
          updatedProdObj.storeOldPrice = productToEdit.storeOldPrice ?? null;
          updatedProdObj.storeBulkPrice = productToEdit.storeBulkPrice ?? null;
        }

        updatedProdObj.wholesalePrice = wholesalePrice !== '' ? Number(wholesalePrice) : ((productToEdit as any)?.wholesale_price ?? productToEdit?.wholesalePrice ?? null);
        updatedProdObj.superGrosPrice = superGrosPrice !== '' ? Number(superGrosPrice) : ((productToEdit as any)?.super_gros_price ?? productToEdit?.superGrosPrice ?? null);
        updatedProdObj.unitsPerSerie = firstColorTotalItemsInSerie || (productToEdit as any)?.units_per_serie || productToEdit?.unitsPerSerie || 4;
        updatedProdObj.minWholesaleSeries = String(minWholesaleSeries) !== '' ? Number(minWholesaleSeries) : ((productToEdit as any)?.min_wholesale_series ?? productToEdit?.minWholesaleSeries ?? 1);
        updatedProdObj.superGrosThreshold = String(superGrosThreshold) !== '' ? Number(superGrosThreshold) : ((productToEdit as any)?.super_gros_threshold ?? productToEdit?.superGrosThreshold ?? 10);

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
            color_hex: sanitizedColors.find((c) => c.colorName.trim() === v.color)?.colorHex || v.color_hex || '#ffffff',
            color_image_url: sanitizedColors.find((c) => c.colorName.trim() === v.color)?.imageUrl || null,
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
          imageUrl: primaryProductImg || undefined,
          colors: sanitizedColors.map((c) => ({ colorName: c.colorName, imageUrl: c.imageUrl || undefined })),
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
                  onChange={(e) => setCostPrice(e.target.value)}
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
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold text-[#8A2B43] focus:outline-none focus:border-[#8A2B43] shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      السعر القديم قبل الخصم (Old Price DZD)
                    </label>
                    <input
                      type="number"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-xs font-mono font-bold text-gray-400 focus:outline-none focus:border-[#8A2B43] shadow-sm"
                    />
                  </div>

                  {/* Strictly Controlled bulk_price Input */}
                  <div>
                    <label className="block text-xs font-bold text-[#8A2B43] mb-1">
                      سعر 5 حبات فما فوق
                    </label>
                    <input
                      type="number"
                      name="bulk_price"
                      value={bulkDiscountPrice5 ?? ''}
                      onChange={(e) => setBulkDiscountPrice5(e.target.value)}
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
                      onChange={(e) => setWholesalePrice(e.target.value)}
                      placeholder=""
                      className="w-full px-4 py-3 bg-white rounded-xl border border-purple-200 text-xs font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-800 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">
                      سعر البيع بالجملة الكبيرة (Prix Super Gros DZD)
                    </label>
                    <input
                      type="number"
                      value={superGrosPrice}
                      onChange={(e) => setSuperGrosPrice(e.target.value)}
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
                const effectiveHex = getEffectiveColorHex(colorItem.colorName, colorItem.colorHex);
                const isCustomColorHex = effectiveHex !== '#ffffff';

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
                          className="w-8 h-8 rounded-full border border-gray-300 shadow-sm shrink-0 transition-transform hover:scale-110 flex items-center justify-center overflow-hidden"
                          style={{
                            backgroundColor: effectiveHex,
                          }}
                          title={`الدرجة المحددة: ${effectiveHex}`}
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
                            value={effectiveHex}
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

                    {/* Middle: Direct Image File Upload Dropzone (Targeted strictly by color Index) */}
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
                                  if (file) handleColorImageChange(index, file);
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
                              if (file) handleColorImageChange(index, file);
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
