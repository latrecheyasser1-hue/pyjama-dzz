'use client';

import React, { useState } from 'react';
import { Users, Phone, DollarSign, Plus, Building, FileText } from 'lucide-react';
import { Supplier } from '@/types/admin';

interface SuppliersManagerProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
}

export default function SuppliersManager({
  suppliers,
  onAddSupplier,
}: SuppliersManagerProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [balance, setBalance] = useState('0');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onAddSupplier({
      name,
      phone,
      totalOrders: 0,
      outstandingBalance: parseFloat(balance) || 0,
    });
    setName('');
    setPhone('');
    setBalance('0');
    setIsOpen(false);
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-pyjama-charcoal">إدارة الموردين والورشات</h2>
          <p className="text-xs text-gray-500 mt-1">
            سجل الموردين، المستحقات المالية الباقية، والطلبات الإجمالية
          </p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مورد جديد (New Supplier)</span>
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-pyjama-pink/40 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#7A1C32]">إضافة مورد جديد إلى القائمة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">اسم المورد / الورشة</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: ورشة البهجة"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 550 00 00 00"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">المستحقات الباقية (DZD)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A2B43] text-white text-xs font-bold shadow-md hover:bg-[#7A1C32]"
            >
              حفظ المورد
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-pyjama-cream/80 text-pyjama-charcoal font-bold border-b border-gray-200">
              <tr>
                <th className="py-4 px-5">اسم المورد</th>
                <th className="py-4 px-5">رقم الهاتف</th>
                <th className="py-4 px-5">إجمالي الطلبيات</th>
                <th className="py-4 px-5">المستحقات الباقية (Outstanding)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-pyjama-cream/30 transition-all">
                  <td className="py-4 px-5 font-bold text-pyjama-charcoal">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-pyjama-pink-soft text-[#8A2B43] rounded-lg">
                        <Building className="w-4 h-4" />
                      </div>
                      <span>{sup.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#8A2B43]" />
                      <span>{sup.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono font-bold text-gray-700">
                    {sup.totalOrders} طلبيات
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                        sup.outstandingBalance > 0
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {sup.outstandingBalance.toLocaleString()} DZD
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
