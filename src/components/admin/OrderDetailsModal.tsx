'use client';

import React from 'react';
import {
  X,
  Truck,
  Building2,
  User,
  Phone,
  MapPin,
  Package,
  Check,
  XCircle,
} from 'lucide-react';
import { DetailedOrder } from '@/types/orders';

interface OrderDetailsModalProps {
  order: DetailedOrder | null;
  onClose: () => void;
  onConfirmOrder: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onConfirmOrder,
  onCancelOrder,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const isWholesale = order.orderType === 'WHOLESALE';

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
        return 'كاش بالكامل (Paid Cash)';
      case 'DEPOSIT':
        return 'دفعة مقدمة (Deposit Paid)';
      case 'CREDIT':
        return 'دفع آجل / دين (Credit / Debt)';
      default:
        return 'غير محدد';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 dir-rtl" dir="rtl">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-pyjama-pink/30">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div
            className={`p-3 rounded-2xl ${
              isWholesale
                ? 'bg-purple-100 text-purple-900'
                : 'bg-pyjama-pink-soft text-[#8A2B43]'
            }`}
          >
            {isWholesale ? (
              <Building2 className="w-6 h-6" />
            ) : (
              <Truck className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-pyjama-charcoal">
                تفاصيل الطلبية #{order.formattedId}
              </h2>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                  isWholesale
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : 'bg-pyjama-pink-soft text-[#8A2B43] border border-pyjama-pink'
                }`}
              >
                {isWholesale ? 'طلب جملة (Wholesale)' : 'طلب توصيل تجزئة (Retail)'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{order.createdAt}</p>
          </div>
        </div>

        {/* Customer / Trader Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-pyjama-cream/60 p-4 rounded-2xl border border-gray-200">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-400 block">
              {isWholesale ? 'بيانات التاجر / المحل' : 'بيانات الزبون'}
            </span>
            <div className="flex items-center gap-2 font-bold text-sm text-pyjama-charcoal">
              <User className="w-4 h-4 text-[#8A2B43]" />
              <span>{order.customerName}</span>
            </div>
            {isWholesale && order.traderBusinessName && (
              <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>المحل: {order.traderBusinessName}</span>
              </div>
            )}
            
            {/* Click-to-Call Phone Number */}
            <div className="pt-1">
              <a
                href={`tel:${order.customerPhone}`}
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#8A2B43] hover:text-[#7A1C32] hover:underline bg-pyjama-pink-soft/80 px-3 py-1.5 rounded-xl border border-pyjama-pink/40 shadow-sm transition-all"
                title="إجراء اتصال مباشر (Click to Call)"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{order.customerPhone}</span>
              </a>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 block">
              {isWholesale ? 'عنوان التاجر والولاية' : 'عنوان التوصيل وشركة الشحن'}
            </span>
            <div className="flex items-center gap-2 text-xs font-bold text-pyjama-charcoal">
              <MapPin className="w-4 h-4 text-[#8A2B43]" />
              <span>{order.wilaya} • {order.commune}</span>
            </div>
            {!isWholesale && (
              <>
                <div className="text-xs text-gray-600 font-bold">
                  نوع الاستلام: {order.deliveryType === 'HOME' ? 'توصيل للمنزل (Home)' : 'Stop Desk'}
                </div>
                {order.carrier && (
                  <div className="text-xs font-mono text-[#8A2B43] font-bold">
                    شركة الشحن: {order.carrier}
                  </div>
                )}
              </>
            )}
            {isWholesale && order.paymentStatus && (
              <div className="pt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getPaymentStatusBadge(
                    order.paymentStatus
                  )}`}
                >
                  حالة الدفع: {getPaymentStatusLabel(order.paymentStatus)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#8A2B43]" />
            <span>قائمة المنتجات والقطع ({order.totalQuantity} قطعة إجمالياً)</span>
          </h3>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-pyjama-cream text-pyjama-charcoal font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">اسم المنتج</th>
                  <th className="py-3 px-4">المقاس / اللون</th>
                  <th className="py-3 px-4">الكمية</th>
                  <th className="py-3 px-4">سعر الوحدة</th>
                  <th className="py-3 px-4">المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-pyjama-cream/30">
                    <td className="py-3 px-4 font-bold text-pyjama-charcoal">
                      {item.productName}
                      <span className="block text-[10px] text-gray-400 font-mono">{item.sku}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.size} • {item.color}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#8A2B43]">
                      {item.quantity} قطعة
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">
                      {item.unitPrice.toLocaleString()} DZD
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-pyjama-charcoal">
                      {(item.quantity * item.unitPrice).toLocaleString()} DZD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-4 rounded-2xl bg-pyjama-cream border border-gray-200 space-y-2">
          {order.shippingFee !== undefined && order.shippingFee > 0 && (
            <div className="flex justify-between text-xs text-gray-600 font-medium">
              <span>مصاريف الشحن والتوصيل</span>
              <span className="font-mono">{order.shippingFee.toLocaleString()} DZD</span>
            </div>
          )}
          {order.wholesaleDiscount !== undefined && order.wholesaleDiscount > 0 && (
            <div className="flex justify-between text-xs text-emerald-700 font-bold">
              <span>خصم الكميات والتخفيض للجملة</span>
              <span className="font-mono">-{order.wholesaleDiscount.toLocaleString()} DZD</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-[#7A1C32] border-t border-gray-300 pt-2">
            <span>المبلغ الإجمالي المالي النهائي</span>
            <span className="font-mono">{order.totalAmountDzd.toLocaleString()} DZD</span>
          </div>
        </div>

        {/* Action Bar (Confirm & Cancel Buttons) */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              onConfirmOrder(order.id);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all transform hover:scale-[1.01]"
          >
            <Check className="w-4 h-4" />
            <span>تأكيد الطلبية (Confirm Order)</span>
          </button>

          <button
            onClick={() => {
              onCancelOrder(order.id);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold border border-rose-300 transition-all"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>إلغاء الطلبية (Cancel Order)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
