'use client';

import React, { useState } from 'react';
import {
  BellRing,
  Truck,
  Building2,
  Phone,
  MapPin,
  PackageCheck,
  Eye,
  Check,
  X,
  CreditCard,
} from 'lucide-react';
import { DetailedOrder, OrderType } from '@/types/orders';
import OrderDetailsModal from '../OrderDetailsModal';

interface NewOrdersTickerProps {
  orders: DetailedOrder[];
  onConfirmOrder: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export default function NewOrdersTicker({
  orders,
  onConfirmOrder,
  onCancelOrder,
}: NewOrdersTickerProps) {
  const [activeTab, setActiveTab] = useState<OrderType>('RETAIL');
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);

  // Filter pending orders by type
  const pendingOrders = orders.filter((o) => o.status === 'UNCONFIRMED');

  const retailOrders = pendingOrders.filter((o) => o.orderType === 'RETAIL');
  const wholesaleOrders = pendingOrders.filter((o) => o.orderType === 'WHOLESALE');

  const currentTabOrders = activeTab === 'RETAIL' ? retailOrders : wholesaleOrders;

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'CASH':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'DEPOSIT':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CREDIT':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentStatusLabel = (status?: string) => {
    switch (status) {
      case 'CASH':
        return 'كاش بالكامل';
      case 'DEPOSIT':
        return 'دفعة مقدمة';
      case 'CREDIT':
        return 'دفع آجل / دين';
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Top Banner & Segmented Dual-Tab Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pyjama-pink-soft text-[#8A2B43] flex items-center justify-center font-bold shadow-md">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-pyjama-charcoal">الطلبيات الجديدة الواردة (New Orders)</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                فصل طلبيات التوصيل الفردية للمستهلك عن طلبيات الجملة للتجار
              </p>
            </div>
          </div>
        </div>

        {/* Dual-Tab Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-pyjama-cream rounded-2xl border border-gray-200">
          <button
            onClick={() => setActiveTab('RETAIL')}
            className={`flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'RETAIL'
                ? 'bg-[#8A2B43] text-white shadow-lg scale-[1.01]'
                : 'text-gray-600 hover:text-pyjama-charcoal hover:bg-white/50'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>طلبيات التوصيل (Retail / Delivery)</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === 'RETAIL'
                  ? 'bg-[#E8A5B8] text-[#7A1C32]'
                  : 'bg-pyjama-pink-soft text-[#8A2B43]'
              }`}
            >
              {retailOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('WHOLESALE')}
            className={`flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-bold text-xs transition-all ${
              activeTab === 'WHOLESALE'
                ? 'bg-[#8A2B43] text-white shadow-lg scale-[1.01]'
                : 'text-gray-600 hover:text-pyjama-charcoal hover:bg-white/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>طلبيات الجملة (Wholesale / Bulk)</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === 'WHOLESALE'
                  ? 'bg-[#E8A5B8] text-[#7A1C32]'
                  : 'bg-purple-100 text-purple-900'
              }`}
            >
              {wholesaleOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content Tables */}
      {currentTabOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-card space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-pyjama-charcoal">
            لا توجد طلبيات معلقة في قسم {activeTab === 'RETAIL' ? 'التوصيل' : 'الجملة'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            جميع الطلبيات الواردة تم تأكيدها ومعالجتها بنجاح.
          </p>
        </div>
      ) : activeTab === 'RETAIL' ? (
        /* Retail / Delivery Orders Table */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-pyjama-cream/80 text-pyjama-charcoal font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-5">رقم الطلب والتاريخ</th>
                  <th className="py-4 px-5">اسم الزبون والهاتف</th>
                  <th className="py-4 px-5">الولاية والبلدية</th>
                  <th className="py-4 px-5">نوع الاستلام والشاحن</th>
                  <th className="py-4 px-5">ملخص القطع (Items)</th>
                  <th className="py-4 px-5">المبلغ الإجمالي (DZD)</th>
                  <th className="py-4 px-5 text-center">العمليات السريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {retailOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-pyjama-cream/30 transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(o)}
                  >
                    <td className="py-4 px-5 font-bold">
                      <span className="font-mono text-[#8A2B43] text-sm">#{o.formattedId}</span>
                      <span className="block text-[11px] text-gray-400 font-mono mt-0.5">
                        {o.createdAt}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-bold text-pyjama-charcoal">
                      <div>{o.customerName}</div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 font-mono mt-0.5">
                        <Phone className="w-3 h-3 text-[#8A2B43]" />
                        <span>{o.customerPhone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1 text-gray-700 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-[#8A2B43]" />
                        <span>{o.wilaya} • {o.commune}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <span className="inline-block px-2.5 py-0.5 bg-pyjama-pink-soft text-[#8A2B43] rounded-md text-[11px] font-bold">
                          {o.deliveryType === 'HOME' ? 'توصيل للمنزل' : 'Stop Desk'}
                        </span>
                        {o.carrier && (
                          <span className="block text-[10px] text-gray-500 font-mono">
                            الناقل: {o.carrier}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5 text-gray-600">
                      <div className="font-bold text-pyjama-charcoal">
                        {o.items.length > 0 ? o.items[0].productName : 'منتج بيجاما'}
                      </div>
                      <div className="text-[11px] text-[#8A2B43] font-mono font-bold mt-0.5">
                        إجمالي {o.totalQuantity} قطعة
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono font-black text-[#7A1C32] text-sm">
                      {o.totalAmountDzd.toLocaleString()} DZD
                    </td>

                    <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 rounded-xl bg-pyjama-cream text-[#8A2B43] hover:bg-[#8A2B43] hover:text-white transition-all"
                          title="عرض التفاصيل الكاملة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onConfirmOrder(o.id)}
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                          title="تأكيد الطلب"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onCancelOrder(o.id)}
                          className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 transition-all"
                          title="إلغاء الطلب"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Wholesale / Gros Orders Table */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-50 text-purple-950 font-bold border-b border-purple-200">
                <tr>
                  <th className="py-4 px-5">رقم الطلب والتاريخ</th>
                  <th className="py-4 px-5">اسم التاجر / المحل</th>
                  <th className="py-4 px-5">الهاتف والولاية</th>
                  <th className="py-4 px-5">إجمالي عدد القطع / السلاسل</th>
                  <th className="py-4 px-5">حالة الدفع (Payment Status)</th>
                  <th className="py-4 px-5">المبلغ الإجمالي للجملة (DZD)</th>
                  <th className="py-4 px-5 text-center">العمليات السريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {wholesaleOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-purple-50/40 transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(o)}
                  >
                    <td className="py-4 px-5 font-bold">
                      <span className="font-mono text-purple-900 text-sm">#{o.formattedId}</span>
                      <span className="block text-[11px] text-gray-400 font-mono mt-0.5">
                        {o.createdAt}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-bold text-pyjama-charcoal">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-800" />
                        <div>
                          <div>{o.traderBusinessName || o.customerName}</div>
                          <div className="text-[11px] text-gray-500 font-normal">
                            المسؤول: {o.customerName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 font-mono text-gray-700">
                          <Phone className="w-3 h-3 text-purple-800" />
                          <span>{o.customerPhone}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-bold">
                          {o.wilaya}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono font-bold text-purple-900 text-sm">
                      {o.totalQuantity} قطعة بالجملة
                    </td>

                    <td className="py-4 px-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getPaymentStatusBadge(
                          o.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusLabel(o.paymentStatus)}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-mono font-black text-purple-950 text-sm">
                      {o.totalAmountDzd.toLocaleString()} DZD
                    </td>

                    <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-2 rounded-xl bg-purple-100 text-purple-900 hover:bg-purple-200 transition-all"
                          title="عرض التفاصيل الكاملة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onConfirmOrder(o.id)}
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                          title="تأكيد الطلب"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onCancelOrder(o.id)}
                          className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 transition-all"
                          title="إلغاء الطلب"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onConfirmOrder={onConfirmOrder}
        onCancelOrder={onCancelOrder}
      />
    </div>
  );
}
