'use client';

import React, { useState, useCallback } from 'react';
import { Menu, Lock } from 'lucide-react';
import PinLockScreen from '@/components/admin/PinLockScreen';
import PinChangeModal from '@/components/admin/PinChangeModal';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  NotificationControls,
  ToastNotificationContainer,
} from '@/components/admin/NotificationBanner';

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

const initialCategories: Category[] = [
  { id: 'cat-1', nameAr: 'بيجامات حريرية', nameFr: 'Pyjamas Hiver', slug: 'pyjamas-hiver' },
  { id: 'cat-2', nameAr: 'ملابس النوم', nameFr: 'Nuisettes & Lingerie', slug: 'nuisettes-lingerie' },
  { id: 'cat-3', nameAr: 'أحذية داخلية', nameFr: 'Chaussons & Pantoufles', slug: 'chaussons' },
  { id: 'cat-4', nameAr: 'روب دو شامبر', nameFr: 'Peignoirs & Robes', slug: 'peignoirs' },
];

const initialSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'مؤسسة الأناقة للمنسوجات', phone: '+213 550 12 34 56', totalOrders: 15, outstandingBalance: 120000 },
  { id: 'sup-2', name: 'ورشة البهجة للبيجاما', phone: '+213 661 98 76 54', totalOrders: 8, outstandingBalance: 45000 },
];

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

const initialProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'PYJ-SILK-01',
    nameAr: 'بيجاما حرير صيفي راقية',
    categoryId: 'cat-1',
    categoryNameAr: 'بيجامات حريرية',
    costPrice: 2800,
    sellingPrice: 5500,
    variants: [
      { id: 'v1', productId: 'prod-1', size: 'M', color: 'زهري (Burgundy)', deliveryStock: 12, storeStock: 8, wholesaleStock: 25 },
      { id: 'v2', productId: 'prod-1', size: 'L', color: 'زهري (Burgundy)', deliveryStock: 2, storeStock: 5, wholesaleStock: 10 },
    ],
  },
  {
    id: 'prod-2',
    sku: 'ROB-VELVET-02',
    nameAr: 'روب مخملي شتوي مطرّز',
    categoryId: 'cat-4',
    categoryNameAr: 'روب دو شامبر',
    costPrice: 4200,
    sellingPrice: 8900,
    variants: [
      { id: 'v3', productId: 'prod-2', size: 'XL', color: 'وردي ناعم (Dusty Pink)', deliveryStock: 15, storeStock: 10, wholesaleStock: 30 },
    ],
  },
];

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

  // Real-time Order Notification Callback (strictly triggered ONLY by genuine Supabase DB inserts)
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

  // Hook Initialization
  const {
    isMuted,
    toggleSound,
    playTestSound,
    toastAlerts,
    dismissToast,
  } = useOrderNotification(handleRealtimeNewOrder);

  // Pure Test Audio Notification Trigger (Strictly plays sound only - NO state mutations or mock orders)
  const handleTestSoundAlert = () => {
    playTestSound();
  };

  // Unconfirmed Orders Count
  const unconfirmedOrders = orders.filter((o) => o.status === 'UNCONFIRMED');

  // Action Handlers
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

  const handleUpdateStock = (variantId: string, stockType: StockType, newQuantity: number) => {
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
  };

  const handleAddCategory = (nameAr: string, nameFr: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nameAr,
      nameFr,
      slug: nameFr.toLowerCase().replace(/\s+/g, '-'),
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setSuppliers((prev) => [...prev, newSup]);
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

  // Convert DetailedOrder to base Order type for OrderHistoryArchive & Analytics
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
        unconfirmedCount={unconfirmedOrders.length}
        onOpenPinChangeModal={() => setIsPinModalOpen(true)}
        onLock={() => setIsLocked(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:mr-72 p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header Bar */}
        <header className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-pyjama-cream text-[#8A2B43] hover:bg-[#8A2B43] hover:text-white transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-black text-pyjama-charcoal">
                {activeSection === 'NEW_ORDERS' && 'الطلبيات الجديدة الواردة (Retail & Wholesale)'}
                {activeSection === 'INVENTORY' && 'المخزون والمستودعات الثلاثة (Inventory)'}
                {activeSection === 'CATEGORIES' && 'الأقسام والتصنيفات (Categories)'}
                {activeSection === 'SUPPLIERS' && 'إدارة الموردين والورشات (Suppliers)'}
                {activeSection === 'CUSTOMERS' && 'تصنيف الزبائن الجزائريين (Customer Scoring)'}
                {activeSection === 'COMPLAINTS' && 'الشكاوى والاقتراحات (Complaints)'}
                {activeSection === 'ANALYTICS' && 'التحليلات المالية والربح (Analytics)'}
                {activeSection === 'ORDER_HISTORY' && 'الأرشيف والسجل العام (Order History)'}
                {activeSection === 'SETTINGS' && 'الإعدادات الشاملة للمتجر (Settings)'}
              </h1>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">
                لوحة التحكم الإدارية ERP • بيجاما ديزاين الشلف ({settings.addressWilaya})
              </p>
            </div>
          </div>

          {/* Right Header Action Controls: Sound Toggle & Lock */}
          <div className="flex items-center gap-3">
            <NotificationControls
              isMuted={isMuted}
              onToggleSound={toggleSound}
              toastAlerts={toastAlerts}
              onDismissToast={dismissToast}
              onTestSound={handleTestSoundAlert}
            />

            <button
              onClick={() => setIsLocked(true)}
              className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all text-xs font-bold flex items-center gap-1.5"
              title="قفل الشاشة"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">قفل</span>
            </button>
          </div>
        </header>

        {/* Section View Router */}
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
            onUpdateStock={handleUpdateStock}
            onAddProduct={() => setActiveSection('SETTINGS')}
          />
        )}

        {activeSection === 'CATEGORIES' && (
          <CategoriesManager
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeSection === 'SUPPLIERS' && (
          <SuppliersManager
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
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

      {/* Visual Toast Notification Overlay */}
      <ToastNotificationContainer
        toastAlerts={toastAlerts}
        onDismissToast={dismissToast}
      />

      {/* PIN Password Change Modal */}
      <PinChangeModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        currentPin={settings.adminPinHash}
        onUpdatePin={handleUpdatePin}
      />
    </div>
  );
}
