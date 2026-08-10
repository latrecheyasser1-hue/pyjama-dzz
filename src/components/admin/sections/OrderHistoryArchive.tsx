'use client';

import React, { useState } from 'react';
import { History, MessageSquareWarning, Search, Filter, Phone, MapPin, CheckCircle, Clock, XCircle, Truck } from 'lucide-react';
import { Order, OrderStatus, Complaint } from '@/types/admin';

interface OrderHistoryArchiveProps {
  orders: Order[];
  complaints: Complaint[];
  onUpdateOrderStatus: (id: string, newStatus: OrderStatus) => void;
}

export default function OrderHistoryArchive({
  orders,
  complaints,
  onUpdateOrderStatus,
}: OrderHistoryArchiveProps) {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'COMPLAINTS'>('ORDERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.formattedId.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PACKAGING':
        return 'bg-[#E8A5B8] text-[#7A1C32] border-pyjama-pink';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CANCELLED':
      case 'RETURNED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'UNCONFIRMED':
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  const getStatusLabelAr = (status: OrderStatus) => {
    switch (status) {
      case 'UNCONFIRMED': return 'غير مؤكدة';
      case 'CONFIRMED': return 'تم التأكيد';
      case 'PACKAGING': return 'قيد التجهيز';
      case 'SHIPPED': return 'تم الشحن';
      case 'DELIVERED': return 'تم التوصيل';
      case 'CANCELLED': return 'ملغاة';
      case 'RETURNED': return 'مرتجعة';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Header & Embedded Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-pyjama-charcoal">الأرشيف والسجل العام للطلبيات</h2>
            <p className="text-xs text-gray-500 mt-1">
              تتبع السجل التسلسلي لجميع الطلبيات والملاحظات المرتبطة بها
            </p>
          </div>

          {/* Embedded Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-pyjama-cream rounded-2xl border border-gray-200">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ORDERS'
                  ? 'bg-[#8A2B43] text-white shadow-md'
                  : 'text-gray-600 hover:text-pyjama-charcoal'
              }`}
            >
              <History className="w-4 h-4" />
              <span>سجل الطلبيات ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('COMPLAINTS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'COMPLAINTS'
                  ? 'bg-[#8A2B43] text-white shadow-md'
                  : 'text-gray-600 hover:text-pyjama-charcoal'
              }`}
            >
              <MessageSquareWarning className="w-4 h-4" />
              <span>سجل الشكاوى والحلول ({complaints.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls for Orders */}
        {activeTab === 'ORDERS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالتسلسل (#01)، اسم الزبون، رقم الهاتف، أو الولاية..."
                className="w-full pr-11 pl-4 py-2.5 bg-pyjama-cream/40 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43]"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-pyjama-cream/40 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43]"
              >
                <option value="ALL">جميع الحالات (All Statuses)</option>
                <option value="UNCONFIRMED">غير مؤكدة</option>
                <option value="CONFIRMED">مؤكدة</option>
                <option value="PACKAGING">قيد التوضيب والتعليب</option>
                <option value="SHIPPED">تم الشحن</option>
                <option value="DELIVERED">تم التسليم</option>
                <option value="CANCELLED">ملغاة</option>
                <option value="RETURNED">مرتجعة</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tab 1: Orders History Table */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-pyjama-cream/80 text-pyjama-charcoal font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-5">الرقم التسلسلي</th>
                  <th className="py-4 px-5">التاريخ</th>
                  <th className="py-4 px-5">اسم الزبون</th>
                  <th className="py-4 px-5">الهاتف</th>
                  <th className="py-4 px-5">الولاية والبلدية</th>
                  <th className="py-4 px-5">المبلغ الإجمالي (DZD)</th>
                  <th className="py-4 px-5">نوع التوصيل</th>
                  <th className="py-4 px-5 text-center">حالة الطلبية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-pyjama-cream/30 transition-all">
                    <td className="py-4 px-5 font-mono font-bold text-[#8A2B43]">
                      #{o.formattedId}
                    </td>

                    <td className="py-4 px-5 text-gray-500 font-mono text-[11px]">
                      {o.createdAt}
                    </td>

                    <td className="py-4 px-5 font-bold text-pyjama-charcoal">
                      {o.customerName}
                    </td>

                    <td className="py-4 px-5 font-mono text-gray-600">
                      {o.customerPhone}
                    </td>

                    <td className="py-4 px-5 text-gray-700">
                      {o.wilaya} • {o.commune}
                    </td>

                    <td className="py-4 px-5 font-mono font-bold text-pyjama-charcoal">
                      {o.totalAmountDzd.toLocaleString()} DZD
                    </td>

                    <td className="py-4 px-5">
                      <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                        {o.deliveryType === 'HOME' ? 'توصيل للمنزل' : 'Stop Desk'}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border focus:outline-none ${getStatusBadge(o.status)}`}
                      >
                        <option value="UNCONFIRMED">غير مؤكدة</option>
                        <option value="CONFIRMED">تم التأكيد</option>
                        <option value="PACKAGING">قيد التغليف والتعليب</option>
                        <option value="SHIPPED">تم الشحن</option>
                        <option value="DELIVERED">تم التسليم</option>
                        <option value="CANCELLED">ملغاة</option>
                        <option value="RETURNED">مرتجعة</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Embedded Complaints Resolution Log */}
      {activeTab === 'COMPLAINTS' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <h3 className="text-base font-bold text-[#7A1C32]">سجل الشكاوى والحلول المسجلة</h3>
          <div className="space-y-3">
            {complaints.map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-2xl bg-pyjama-cream/40 border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pyjama-charcoal text-sm">{comp.customerName}</span>
                    <span className="text-xs text-gray-500 font-mono">({comp.customerPhone})</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#8A2B43]">{comp.subject}</h4>
                  <p className="text-xs text-gray-600">{comp.message}</p>
                </div>

                <div className="shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      comp.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {comp.status === 'RESOLVED' ? 'تم الحل بنجاح' : 'قيد المتابعة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
