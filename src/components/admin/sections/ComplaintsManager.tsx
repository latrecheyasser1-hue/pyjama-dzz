'use client';

import React from 'react';
import { MessageSquareWarning, Phone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Complaint, ComplaintStatus } from '@/types/admin';

interface ComplaintsManagerProps {
  complaints: Complaint[];
  onUpdateStatus: (id: string, newStatus: ComplaintStatus) => void;
}

export default function ComplaintsManager({
  complaints,
  onUpdateStatus,
}: ComplaintsManagerProps) {
  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-pyjama-charcoal">إدارة الشكاوى والاقتراحات</h2>
          <p className="text-xs text-gray-500 mt-1">
            متابعة الملاحظات والشكاوى المرسلة من الزبائن عبر المتجر وتتبع حالة المعالجة
          </p>
        </div>

        <span className="px-3 py-1 bg-pyjama-pink-soft text-[#8A2B43] rounded-xl text-xs font-bold font-mono">
          إجمالي الملاحظات: {complaints.length}
        </span>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-pyjama-cream/80 text-pyjama-charcoal font-bold border-b border-gray-200">
              <tr>
                <th className="py-4 px-5">اسم الزبون والهاتف</th>
                <th className="py-4 px-5">موضوع الشكوى</th>
                <th className="py-4 px-5">تفاصيل الرسالة</th>
                <th className="py-4 px-5">التاريخ</th>
                <th className="py-4 px-5">الحالة الحالية</th>
                <th className="py-4 px-5 text-center">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-pyjama-cream/30 transition-all">
                  <td className="py-4 px-5 font-bold text-pyjama-charcoal">
                    <div>{c.customerName}</div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 font-mono mt-0.5">
                      <Phone className="w-3 h-3 text-[#8A2B43]" />
                      <span>{c.customerPhone}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5 font-bold text-[#8A2B43]">{c.subject}</td>

                  <td className="py-4 px-5 text-gray-600 max-w-xs">{c.message}</td>

                  <td className="py-4 px-5 text-gray-400 font-mono text-[11px]">
                    {c.createdAt}
                  </td>

                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                        c.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : c.status === 'IN_PROGRESS'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {c.status === 'RESOLVED' ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> تم الحل
                        </>
                      ) : c.status === 'IN_PROGRESS' ? (
                        <>
                          <Clock className="w-3 h-3" /> قيد المعالجة
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" /> جديد / معلق
                        </>
                      )}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-center">
                    <select
                      value={c.status}
                      onChange={(e) => onUpdateStatus(c.id, e.target.value as ComplaintStatus)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-pyjama-cream/40 text-xs font-bold focus:outline-none focus:border-[#8A2B43]"
                    >
                      <option value="PENDING">جديد (Pending)</option>
                      <option value="IN_PROGRESS">قيد المعالجة (In Progress)</option>
                      <option value="RESOLVED">تم المعالجة والحل (Resolved)</option>
                    </select>
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
