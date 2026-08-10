'use client';

import React from 'react';
import { BellRing, Check, X, Phone, MapPin, PackageCheck, AlertCircle } from 'lucide-react';
import { Order } from '@/types/admin';

interface NewOrdersTickerProps {
  unconfirmedOrders: Order[];
  onConfirmOrder: (id: string) => void;
  onCancelOrder: (id: string) => void;
}

export default function NewOrdersTicker({
  unconfirmedOrders,
  onConfirmOrder,
  onCancelOrder,
}: NewOrdersTickerProps) {
  if (unconfirmedOrders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-card space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <PackageCheck className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-pyjama-charcoal">لا توجد طلبيات معلقة حالياً</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          جميع الطلبيات الواردة تم تأكيدها ومعالجتها. سيظهر أي طلب جديد هنا فور وصوله مباشرة.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-[#8A2B43] to-[#7A1C32] text-white rounded-3xl p-6 shadow-card flex items-center justify-between border border-[#E8A5B8]/30">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-[#E8A5B8] text-[#7A1C32] flex items-center justify-center font-bold shadow-md">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-ping" />
          </div>
          <div>
            <h2 className="text-xl font-bold">تنبيـه الطلبيات الجديدة الواردة</h2>
            <p className="text-xs text-[#E8A5B8] mt-0.5">
              يوجد <span className="font-bold underline text-white">{unconfirmedOrders.length}</span> طلبية في انتظار التأكيد
            </p>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unconfirmedOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl p-5 border border-pyjama-pink/30 shadow-card hover:border-[#8A2B43] transition-all space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-pyjama-pink-soft text-[#8A2B43] font-mono text-xs font-bold border border-pyjama-pink/40">
                  #{order.formattedId}
                </span>
                <span className="text-xs text-gray-400 font-mono">{order.createdAt}</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                قيد الانتظار
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-pyjama-charcoal">{order.customerName}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone className="w-3.5 h-3.5 text-[#8A2B43]" />
                <span className="font-mono">{order.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-[#8A2B43]" />
                <span>{order.wilaya} • {order.commune}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 block">نوع التوصيل</span>
                <span className="text-xs font-bold text-[#8A2B43]">
                  {order.deliveryType === 'HOME' ? 'توصيل للمنزل (Home)' : 'استلام من المكتب (Stop Desk)'}
                </span>
              </div>
              <div className="text-left dir-ltr">
                <span className="text-[10px] text-gray-400 block">المبلغ الإجمالي</span>
                <span className="text-base font-black text-pyjama-charcoal font-mono">
                  {order.totalAmountDzd.toLocaleString()} DZD
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => onConfirmOrder(order.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
              >
                <Check className="w-4 h-4" />
                <span>تأكيد الطلبية (Confirm)</span>
              </button>

              <button
                onClick={() => onCancelOrder(order.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold border border-rose-300 transition-all"
              >
                <X className="w-4 h-4" />
                <span>إلغاء الطلب (Cancel)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
