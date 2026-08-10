'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Menu } from 'lucide-react';
import PinLockScreen from '@/components/admin/PinLockScreen';
import PinChangeModal from '@/components/admin/PinChangeModal';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { ToastNotificationContainer } from '@/components/admin/NotificationBanner';
import { supabase } from '@/lib/supabaseClient';

// Custom Hooks
import { useOrderNotification } from '@/hooks/useOrderNotification';

// Sections
import NewOrdersTicker from '@/components/admin/sections/NewOrdersTicker';
import InventoryManager from '@/components/admin/sections/InventoryManager';
import CategoriesManager from '@/components/admin/sections/CategoriesManager';
import SuppliersManager from '@/components/admin/sections/SuppliersManager';
import CustomerScoringManager from '@/components/admin/sections/CustomerScoringManager';
import ComplaintsManager from '@/components/admin/sections/ComplaintsManager';
import AnalyticsFinancials from '@/components/admin/sections/AnalyticsFinancials';
import OrderHistoryArchive from '@/components/admin/sections/OrderHistoryArchive';
import SettingsHub from '@/components/admin/sections/SettingsHub';

// Types
import {
  AdminSettings,
  Category,
  Supplier,
  Customer,
  Product,
  Order,
  Expense,
  Complaint,
  DashboardSection,
  StockType,
  OrderStatus,
  ComplaintStatus,
} from '@/types/admin';
import { DetailedOrder } from '@/types/orders';

// Initial Mock Seed Data
const initialSettings: AdminSettings = {
  id: 1,
  adminPinHash: '765483', // Default PIN: 765483
  cashierPin: '123456',
  packagingPin: '654321',
  instagramUrl: 'https://www.instagram.com/pyjama_dz',
  tiktokUrl: 'https://www.tiktok.com/@pyjama_dz',
  facebookUrl: 'https://www.facebook.com/pyjamadz',
  mapsUrl: 'https://maps.google.com/?q=Chlef,Algeria',
  whatsappNumber: '+213555000000',
  callPhoneNumbers: ['+213 555 11 22 33', '+213 666 44 55 66'],
  storeManagerPhone: '+213 555 11 22 33',
  deliveryManagerPhone: '+213 555 22 33 44',
  packagingStaffPhone: '+213 555 33 44 55',
  addressWilaya: 'الشلف',
  addressCommune: 'الشلف',
};

// Clean Categories array ready for live Supabase synchronization
const initialCategories: Category[] = [];
const initialSuppliers: Supplier[] = [];

const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    fullName: 'أمينا بن علي',
    phone: '+213 551 23 45 67',
    wilaya: 'الشلف',
    commune: 'الشلف',
    confirmedOrders: 7,
    cancelledOrders: 1,
    totalSpent: 38500,
    tag: 'BON_CLIENT',
  },
  {
    id: 'cust-2',
    fullName: 'سارة بودواو',
    phone: '+213 662 34 56 78',
    wilaya: 'الجزائر',
    commune: 'باب الزوار',
    confirmedOrders: 1,
    cancelledOrders: 4,
    totalSpent: 4500,
    tag: 'MAUVAIS_CLIENT',
  },
  {
    id: 'cust-3',
    fullName: 'محل ياسمين للأناقة (جملة)',
    phone: '+213 773 45 67 89',
    wilaya: 'وهران',
    commune: 'السانية',
    confirmedOrders: 12,
    cancelledOrders: 0,
    totalSpent: 320000,
    tag: 'BON_CLIENT',
  },
];

const initialProducts: Product[] = [];

// Detailed Seed Orders for Retail & Wholesale
const initialDetailedOrders: DetailedOrder[] = [
  {
    id: 'ord-1',
    sequentialId: 1,
    formattedId: '01',
    orderType: 'RETAIL',
    customerName: 'أمينا بن علي',
    customerPhone: '+213 551 23 45 67',
    wilaya: 'الشلف',
    commune: 'الشلف',
    deliveryType: 'HOME',
    carrier: 'YALIDINE',
    shippingFee: 600,
    items: [
      { id: 'i1', productName: 'بيجاما حرير صيفي راقية', sku: 'PYJ-SILK-01', size: 'M', color: 'Burgundy', quantity: 1, unitPrice: 5500 },
    ],
    totalQuantity: 1,
    totalAmountDzd: 6100,
    status: 'UNCONFIRMED',
    createdAt: '2026-08-10 10:15',
  },
  {
    id: 'ord-2',
    sequentialId: 2,
    formattedId: '02',
    orderType: 'WHOLESALE',
    customerName: 'ياسين بومدين',
    customerPhone: '+213 661 88 99 00',
    traderBusinessName: 'محل ياسمين للأناقة (وهران)',
    wilaya: 'وهران',
    commune: 'وهران المدينة',
    deliveryType: 'STOP_DESK',
    paymentStatus: 'DEPOSIT',
    depositAmount: 50000,
    wholesaleDiscount: 15000,
    items: [
      { id: 'i2', productName: 'بيجاما حرير صيفي (سلسلة دوزينة)', sku: 'PYJ-SILK-01', size: 'M/L/XL', color: 'مشكّل', quantity: 24, unitPrice: 3800 },
      { id: 'i3', productName: 'روب مخملي شتوي (دوزينة)', sku: 'ROB-VELVET-02', size: 'L/XL', color: 'Burgundy', quantity: 12, unitPrice: 6500 },
    ],
    totalQuantity: 36,
    totalAmountDzd: 154200,
    status: 'UNCONFIRMED',
    createdAt: '2026-08-10 09:45',
  },
  {
    id: 'ord-3',
    sequentialId: 3,
    formattedId: '03',
    orderType: 'RETAIL',
    customerName: 'سارة بودواو',
    customerPhone: '+213 662 34 56 78',
    wilaya: 'الجزائر',
    commune: 'باب الزوار',
    deliveryType: 'STOP_DESK',
    carrier: 'ZR_EXPRESS',
    shippingFee: 400,
    items: [
      { id: 'i4', productName: 'روب مخملي شتوي مطرّز', sku: 'ROB-VELVET-02', size: 'XL', color: 'Dusty Pink', quantity: 1, unitPrice: 8900 },
    ],
    totalQuantity: 1,
    totalAmountDzd: 9300,
    status: 'CONFIRMED',
    createdAt: '2026-08-09 16:30',
  },
];

const initialExpenses: Expense[] = [
  { id: 'exp-1', title: 'شراء قماش حرير شتاء', amountDzd: 150000, category: 'COGS', expenseDate: '2026-08-01' },
  { id: 'exp-2', title: 'مصاريف الشحن والمرتجعات', amountDzd: 12500, category: 'SHIPPING_RETURN', expenseDate: '2026-08-05' },
  { id: 'exp-3', title: 'كهرباء وتدفئة المحل', amountDzd: 8500, category: 'OPERATING', expenseDate: '2026-08-07' },
];

const initialComplaints: Complaint[] = [
  {
    id: 'c1',
    customerName: 'سارة بودواو',
    customerPhone: '+213 662 34 56 78',
    subject: 'تأخر التوصيل',
    message: 'الطلب تأخر يومين عن الموعد المحدد في محطة Stop Desk',
    status: 'PENDING',
    createdAt: '2026-08-10 09:20',
  },
];

export default function MasterAdminPage() {
  // State
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>('NEW_ORDERS');
  const [activeStockTab, setActiveStockTab] = useState<StockType>('DELIVERY');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Entities State
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<DetailedOrder[]>(initialDetailedOrders);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);

  // Fetch Live Categories from Supabase
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (error) {
        console.warn('Supabase categories select notice:', error.message || error.code || error);
        return;
      }

      if (data) {
        const mapped: Category[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name || item.name_ar || item.name_fr || '',
          slug: item.slug || (item.name || '').toLowerCase().trim().replace(/\s+/g, '-'),
          imageUrl: item.image_url || item.cover_image_url || null,
          coverImageUrl: item.image_url || item.cover_image_url || null,
          isActive: item.is_active ?? true,
          createdAt: item.created_at,
        }));
        setCategories(mapped);
      }
    } catch (err: any) {
      console.warn('Failed to fetch categories from Supabase:', err?.message || err);
    }
  }, []);

  // Fetch Live Suppliers from Supabase
  const fetchSuppliers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase suppliers select notice:', error.message || error);
        return;
      }

      if (data) {
        const mapped: Supplier[] = data.map((item: any) => ({
          id: String(item.id),
          name: item.name || item.supplier_name || '',
          phone: item.phone || item.supplier_phone || '',
          totalOrders: 0,
          outstandingBalance: 0,
          createdAt: item.created_at,
        }));
        setSuppliers(mapped);
      }
    } catch (err: any) {
      console.warn('Failed to fetch suppliers from Supabase:', err?.message || err);
    }
  }, []);

  // Fetch Live Products from Supabase
  const fetchProducts = useCallback(async () => {
    try {
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (prodError) {
        console.warn('Supabase products select notice:', prodError.message || prodError);
        return;
      }

      if (!prodData || prodData.length === 0) {
        return;
      }

      const prodIds = prodData.map((p: any) => p.id);
      const { data: varData } = await supabase
        .from('product_variants')
        .select('*')
        .in('product_id', prodIds);

      const mappedProducts: Product[] = prodData.map((p: any) => {
        const pVariants = varData
          ? varData
              .filter((v: any) => String(v.product_id) === String(p.id))
              .map((v: any) => ({
                id: String(v.id),
                productId: String(v.product_id),
                size: v.size || v.size_name || 'Standard',
                color: v.color_name || v.color || 'أساسي',
                deliveryStock: Number(v.delivery_stock) || 0,
                storeStock: Number(v.store_stock) || 0,
                wholesaleStock: Number(v.wholesale_stock) || 0,
                serieComposition: v.serie_composition || undefined,
                wholesaleSeriesQty: v.wholesale_series_qty !== undefined ? Number(v.wholesale_series_qty) : undefined,
              }))
          : [];

        const colorsSet = new Set<string>();
        pVariants.forEach((v) => colorsSet.add(v.color));
        const colors = Array.from(colorsSet).map((cName) => ({
          colorName: cName,
          imageUrl: p.image_url || undefined,
        }));

        const sizesSet = new Set<string>();
        pVariants.forEach((v) => sizesSet.add(v.size));
        const sizes = Array.from(sizesSet);

        return {
          id: String(p.id),
          sku: p.sku || `PYJ-${String(p.id).substring(0, 6)}`,
          nameAr: p.name || p.title || p.name_ar || 'منتج جديد',
          categoryId: p.category_id ? String(p.category_id) : undefined,
          supplierName: p.supplier_name || undefined,
          supplierPhone: p.supplier_phone || undefined,
          costPrice: Number(p.cost_price) || 0,
          sellingPrice: Number(p.selling_price) || 0,
          oldPrice: p.old_price ? Number(p.old_price) : undefined,
          bulkPrice: p.bulk_price !== null && p.bulk_price !== undefined ? Number(p.bulk_price) : (p.bulk_discount_price_5 !== null && p.bulk_discount_price_5 !== undefined ? Number(p.bulk_discount_price_5) : undefined),
          bulk_price: p.bulk_price !== null && p.bulk_price !== undefined ? Number(p.bulk_price) : (p.bulk_discount_price_5 !== null && p.bulk_discount_price_5 !== undefined ? Number(p.bulk_discount_price_5) : undefined),
          bulkDiscountPrice5: p.bulk_price !== null && p.bulk_price !== undefined ? Number(p.bulk_price) : (p.bulk_discount_price_5 !== null && p.bulk_discount_price_5 !== undefined ? Number(p.bulk_discount_price_5) : undefined),
          wholesalePrice: p.wholesale_price ? Number(p.wholesale_price) : undefined,
          superGrosPrice: p.super_gros_price ? Number(p.super_gros_price) : undefined,
          unitsPerSerie: p.units_per_serie ? Number(p.units_per_serie) : 4,
          minWholesaleSeries: p.min_wholesale_series ? Number(p.min_wholesale_series) : 1,
          superGrosThreshold: p.super_gros_threshold ? Number(p.super_gros_threshold) : 10,
          description: p.description || undefined,
          imageUrl: p.image_url || undefined,
          colors: colors,
          sizes: sizes,
          variants: pVariants,
        };
      });

      setProducts(mappedProducts);
    } catch (err: any) {
      console.warn('Failed to fetch products from Supabase:', err?.message || err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSuppliers();
    fetchProducts();
  }, [fetchCategories, fetchSuppliers, fetchProducts]);

  // Real-time Order Notification Callback
  const handleRealtimeNewOrder = useCallback((rawOrder: any) => {
    if (!rawOrder) return;
    const uniqueId = rawOrder.id || `ord-rt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newOrder: DetailedOrder = {
      id: uniqueId,
      sequentialId: rawOrder.sequential_id || orders.length + 1,
      formattedId: rawOrder.formatted_id || String(orders.length + 1).padStart(2, '0'),
      orderType: rawOrder.order_type || 'RETAIL',
      customerName: rawOrder.customer_name || 'زبون جديد',
      customerPhone: rawOrder.customer_phone || '+213 550 00 00 00',
      wilaya: rawOrder.wilaya || 'الشلف',
      commune: rawOrder.commune || 'الشلف',
      deliveryType: rawOrder.delivery_type || 'HOME',
      totalAmountDzd: rawOrder.total_amount_dzd || 6500,
      items: rawOrder.items || [
        { id: `i-${Date.now()}`, productName: 'بيجاما صيفية جديدة', sku: 'PYJ-NEW', size: 'L', color: 'Burgundy', quantity: 1, unitPrice: 6500 },
      ],
      totalQuantity: rawOrder.total_quantity || 1,
      status: 'UNCONFIRMED',
      createdAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders((prev) => [newOrder, ...prev]);
  }, [orders.length]);

  const {
    toastAlerts,
    dismissToast,
  } = useOrderNotification(handleRealtimeNewOrder);

  const unconfirmedOrders = orders.filter((o) => o.status === 'UNCONFIRMED');

  const handleConfirmOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'CONFIRMED' as OrderStatus } : o))
    );
  };

  const handleCancelOrder = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'CANCELLED' as OrderStatus } : o))
    );
  };

  const handleUpdateStock = async (variantId: string, stockType: StockType, newQuantity: number) => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        variants: p.variants.map((v) => {
          if (v.id === variantId) {
            if (stockType === 'DELIVERY') return { ...v, deliveryStock: newQuantity };
            if (stockType === 'STORE') return { ...v, storeStock: newQuantity };
            if (stockType === 'WHOLESALE') return { ...v, wholesaleStock: newQuantity };
          }
          return v;
        }),
      }))
    );

    try {
      const column = stockType === 'DELIVERY' ? 'delivery_stock' : stockType === 'STORE' ? 'store_stock' : 'wholesale_stock';
      await supabase.from('product_variants').update({ [column]: newQuantity }).eq('id', variantId);
    } catch (err) {
      console.warn('Notice updating product variant stock in DB:', err);
    }
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = async (productId: string, stockType?: StockType) => {
    try {
      const warehouse = stockType || activeStockTab || 'DELIVERY';
      const stockColumn =
        warehouse === 'DELIVERY'
          ? 'delivery_stock'
          : warehouse === 'STORE'
          ? 'store_stock'
          : 'wholesale_stock';

      // 1. Scoped Warehouse Removal: Zero out stock column for this warehouse across all variants
      await supabase
        .from('product_variants')
        .update({ [stockColumn]: 0 })
        .eq('product_id', productId);

      // 2. Check if product has 0 stock across ALL 3 warehouses
      const { data: remainingVars } = await supabase
        .from('product_variants')
        .select('delivery_stock, store_stock, wholesale_stock')
        .eq('product_id', productId);

      const hasRemainingStock = remainingVars?.some(
        (v) => (v.delivery_stock || 0) > 0 || (v.store_stock || 0) > 0 || (v.wholesale_stock || 0) > 0
      );

      if (remainingVars && remainingVars.length > 0 && !hasRemainingStock) {
        // Permanent Hard Delete from products table if 0 stock across all 3 warehouses
        await supabase.from('products').delete().eq('id', productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        // Scoped local update: zero out stock for active warehouse
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id !== productId) return p;
            return {
              ...p,
              variants: p.variants.map((v) => ({
                ...v,
                deliveryStock: warehouse === 'DELIVERY' ? 0 : v.deliveryStock,
                storeStock: warehouse === 'STORE' ? 0 : v.storeStock,
                wholesaleStock: warehouse === 'WHOLESALE' ? 0 : v.wholesaleStock,
              })),
            };
          })
        );
      }
    } catch (err) {
      console.error('Error in scoped product deletion:', err);
    }
  };

  const handleAddCategory = async (name: string): Promise<boolean> => {
    if (!name.trim()) return false;

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim() }])
        .select();

      if (error) {
        console.error('Supabase Category Insert Error:', error);
        alert('خطأ في الحفظ في قاعدة البيانات: ' + (error.message || JSON.stringify(error)));
        return false;
      }

      await fetchCategories();
      return true;
    } catch (err: any) {
      console.error('Failed to insert category into Supabase:', err);
      alert('خطأ في الحفظ في قاعدة البيانات: ' + (err?.message || String(err)));
      return false;
    }
  };

  const handleDeleteCategory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.error('Supabase Category Delete Error:', error);
        alert('خطأ في الحذف من قاعدة البيانات: ' + (error.message || JSON.stringify(error)));
        return false;
      }
      await fetchCategories();
      return true;
    } catch (err: any) {
      console.error('Failed to delete category from Supabase:', err);
      alert('خطأ في الحذف من قاعدة البيانات: ' + (err?.message || String(err)));
      return false;
    }
  };

  const handleAddSupplier = async (supplier: { name: string; phone: string }): Promise<boolean> => {
    if (!supplier.name.trim() || !supplier.phone.trim()) return false;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{ name: supplier.name.trim(), phone: supplier.phone.trim() }])
        .select();

      if (error) {
        console.error('Supabase Supplier Insert Error:', error);
        alert('خطأ في حفظ المورد في قاعدة البيانات: ' + (error.message || JSON.stringify(error)));
        return false;
      }

      await fetchSuppliers();
      return true;
    } catch (err: any) {
      console.error('Failed to insert supplier into Supabase:', err);
      alert('خطأ في حفظ المورد: ' + (err?.message || String(err)));
      return false;
    }
  };

  const handleDeleteSupplier = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) {
        console.error('Supabase Supplier Delete Error:', error);
        alert('خطأ في حذف المورد من قاعدة البيانات: ' + (error.message || JSON.stringify(error)));
        return false;
      }
      await fetchSuppliers();
      return true;
    } catch (err: any) {
      console.error('Failed to delete supplier from Supabase:', err);
      alert('خطأ في حذف المورد: ' + (err?.message || String(err)));
      return false;
    }
  };

  const handleUpdateComplaintStatus = (id: string, newStatus: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const handleUpdateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const handleUpdatePin = (newPin: string) => {
    setSettings((prev) => ({ ...prev, adminPinHash: newPin }));
  };

  const handleSaveSettings = (updated: AdminSettings) => {
    setSettings(updated);
  };

  if (isLocked) {
    return (
      <PinLockScreen
        storedPin={settings.adminPinHash}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  const baseOrders: Order[] = orders.map((o) => ({
    id: o.id,
    sequentialId: o.sequentialId,
    formattedId: o.formattedId,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    wilaya: o.wilaya,
    commune: o.commune,
    deliveryType: o.deliveryType,
    totalAmountDzd: o.totalAmountDzd,
    status: o.status,
    createdAt: o.createdAt,
  }));

  return (
    <div className="min-h-screen bg-pyjama-cream flex flex-col lg:flex-row text-pyjama-charcoal font-sans dir-rtl" dir="rtl">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        activeStockTab={activeStockTab}
        onSelectStockTab={setActiveStockTab}
        unconfirmedCount={unconfirmedOrders.length}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:mr-72 p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-pyjama-cream text-[#8A2B43] hover:bg-[#8A2B43] hover:text-white transition-all flex items-center gap-2 text-xs font-bold"
          >
            <Menu className="w-5 h-5" />
            <span>القائمة الرئيسية</span>
          </button>
          <span className="text-xs font-bold text-[#8A2B43] font-mono">Pyjama DZ</span>
        </div>

        {activeSection === 'NEW_ORDERS' && (
          <NewOrdersTicker
            orders={orders}
            onConfirmOrder={handleConfirmOrder}
            onCancelOrder={handleCancelOrder}
          />
        )}

        {activeSection === 'INVENTORY' && (
          <InventoryManager
            products={products}
            categories={categories}
            activeStockTab={activeStockTab}
            onUpdateStock={handleUpdateStock}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            reFetchProducts={fetchProducts}
          />
        )}

        {activeSection === 'CATEGORIES' && (
          <CategoriesManager
            categories={categories}
            products={products}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeSection === 'SUPPLIERS' && (
          <SuppliersManager
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        )}

        {activeSection === 'CUSTOMERS' && (
          <CustomerScoringManager customers={customers} />
        )}

        {activeSection === 'COMPLAINTS' && (
          <ComplaintsManager
            complaints={complaints}
            onUpdateStatus={handleUpdateComplaintStatus}
          />
        )}

        {activeSection === 'ANALYTICS' && (
          <AnalyticsFinancials
            orders={baseOrders}
            products={products}
            expenses={expenses}
          />
        )}

        {activeSection === 'ORDER_HISTORY' && (
          <OrderHistoryArchive
            orders={baseOrders}
            complaints={complaints}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeSection === 'SETTINGS' && (
          <SettingsHub
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onOpenPinChangeModal={() => setIsPinModalOpen(true)}
          />
        )}
      </main>

      <ToastNotificationContainer
        toastAlerts={toastAlerts}
        onDismissToast={dismissToast}
      />

      <PinChangeModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentPin={settings.adminPinHash}
        onUpdatePin={handleUpdatePin}
      />
    </div>
  );
}
