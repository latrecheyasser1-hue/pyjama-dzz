'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldAlert, CheckCircle, Search, Phone, MapPin, Award, History } from 'lucide-react';
import { Customer } from '@/types/admin';
import { calculateCustomerScore, getCustomerTagInfo } from '@/utils/customerScoring';

interface CustomerScoringManagerProps {
  customers: Customer[];
}

export default function CustomerScoringManager({ customers }: CustomerScoringManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.wilaya.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Top Banner & Explanation */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-pyjama-charcoal">خوارزمية تصنيف الزبائن الجزائريين</h2>
            <p className="text-xs text-gray-500 mt-1">
              تصنيف تلقائي استناداً إلى نسبة الطلبيات المؤكدة مقابل الطلبيات الملغاة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Bon Client (+5 مؤكدة)
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              Mauvais Client (ملغاة ≥ مؤكدة)
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الزبون، رقم الهاتف، أو الولاية..."
            className="w-full pr-11 pl-4 py-2.5 bg-pyjama-cream/40 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43]"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-pyjama-cream/80 text-pyjama-charcoal font-bold border-b border-gray-200">
              <tr>
                <th className="py-4 px-5">اسم الزبون</th>
                <th className="py-4 px-5">الهاتف والولاية</th>
                <th className="py-4 px-5">الطلبيات المؤكدة</th>
                <th className="py-4 px-5">الطلبيات الملغاة</th>
                <th className="py-4 px-5">إجمالي المشتريات (DZD)</th>
                <th className="py-4 px-5">التصنيف التلقائي (Algorithmic Tag)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {filteredCustomers.map((c) => {
                const computedTag = calculateCustomerScore(c.confirmedOrders, c.cancelledOrders);
                const tagInfo = getCustomerTagInfo(computedTag);

                return (
                  <tr key={c.id} className="hover:bg-pyjama-cream/30 transition-all">
                    <td className="py-4 px-5 font-bold text-pyjama-charcoal">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-pyjama-pink-soft text-[#8A2B43] rounded-xl font-bold">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <span>{c.fullName}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-gray-700 font-mono">
                          <Phone className="w-3 h-3 text-[#8A2B43]" />
                          <span>{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{c.wilaya} • {c.commune}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-mono text-emerald-700 font-bold">
                      {c.confirmedOrders} مؤكدة
                    </td>

                    <td className="py-4 px-5 font-mono text-rose-600 font-bold">
                      {c.cancelledOrders} ملغاة
                    </td>

                    <td className="py-4 px-5 font-mono font-bold text-pyjama-charcoal">
                      {c.totalSpent.toLocaleString()} DZD
                    </td>

                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-sm ${tagInfo.badgeClass}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${tagInfo.dotClass}`} />
                        <span>{tagInfo.labelAr}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
