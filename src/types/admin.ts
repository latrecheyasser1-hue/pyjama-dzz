// Master Admin ERP Types for Pyjama Design (بيجاما ديزاين)

export type CustomerScoreTag = 'BON_CLIENT' | 'MAUVAIS_CLIENT' | 'NORMAL';

export type StockType = 'DELIVERY' | 'STORE' | 'WHOLESALE';

export type OrderStatus = 
  | 'UNCONFIRMED' 
  | 'CONFIRMED' 
  | 'PACKAGING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'RETURNED';

export type DeliveryType = 'HOME' | 'STOP_DESK';

export type ExpenseCategory = 'COGS' | 'OPERATING' | 'SHIPPING_RETURN' | 'OTHER';

export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export interface AdminSettings {
  id: number;
  adminPinHash: string; // Default: '765483'
  cashierPin: string;
  packagingPin: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  mapsUrl: string;
  whatsappNumber: string;
  callPhoneNumbers: string[];
  storeManagerPhone: string;
  deliveryManagerPhone: string;
  packagingStaffPhone: string;
  addressWilaya: string;
  addressCommune: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  nameFr?: string;
  slug: string;
  coverImageUrl?: string;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  outstandingBalance: number;
  notes?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  wilaya: string;
  commune: string;
  confirmedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  tag: CustomerScoreTag;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  deliveryStock: number;  // مخزون التوصيل
  storeStock: number;     // مخزون المحل
  wholesaleStock: number; // مخزون الجملة
}

export interface Product {
  id: string;
  sku: string;
  nameAr: string;
  categoryId?: string;
  categoryNameAr?: string;
  costPrice: number;
  sellingPrice: number;
  imageUrl?: string;
  variants: ProductVariant[];
  createdAt?: string;
}

export interface Order {
  id: string;
  sequentialId: number;
  formattedId: string; // e.g. "01", "02", "03"
  customerId?: string;
  customerName: string;
  customerPhone: string;
  wilaya: string;
  commune: string;
  deliveryType: DeliveryType;
  totalAmountDzd: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amountDzd: number;
  category: ExpenseCategory;
  expenseDate: string;
}

export interface Complaint {
  id: string;
  orderId?: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  message: string;
  status: ComplaintStatus;
  createdAt: string;
}

export type DashboardSection = 
  | 'NEW_ORDERS'
  | 'INVENTORY'
  | 'CATEGORIES'
  | 'SUPPLIERS'
  | 'CUSTOMERS'
  | 'COMPLAINTS'
  | 'ANALYTICS'
  | 'ORDER_HISTORY'
  | 'SETTINGS';
