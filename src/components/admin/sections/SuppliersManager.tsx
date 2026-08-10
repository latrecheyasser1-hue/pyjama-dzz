'use client';

import React, { useState } from 'react';
import { Phone, Plus, Building, Trash2, X, CheckCircle, Users } from 'lucide-react';
import { Supplier } from '@/types/admin';

interface SuppliersManagerProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: { name: string; phone: string }) => Promise<boolean> | void;
  onDeleteSupplier: (id: string) => Promise<boolean> | void;
}

export default function SuppliersManager({
  suppliers = [],
  onAddSupplier,
  onDeleteSupplier,
}: SuppliersManagerProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert('الرجاء إدخال اسم المورد ورقم الهاتف بوضوح');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onAddSupplier({
        name: name.trim(),
        phone: phone.trim(),
      });

      if (res !== false) {
        setName('');
        setPhone('');
        setIsModalOpen(false);
      }
    } catch (err: any) {
      console.error('Error adding supplier:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, supplierName: string) => {
    if (!confirm(`هل أنت تأكد من حذف المورد "${supplierName}" نهائياً من قاعدة البيانات؟`)) {
      return;
    }

    setDeletingId(id);
    try {
      await onDeleteSupplier(id);
    } catch (err) {
      console.error('Error deleting supplier:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-pyjama-charcoal">سجل الموردين والورشات (Suppliers)</h2>
          <p className="text-xs text-gray-500 mt-1">
            إدارة وتتبع قائمة الورشات والموردين المسجلين في النظام
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة مورد جديد (New Supplier)</span>
        </button>
      </div>

      {/* Streamlined Add Supplier Modal (ONLY 2 Fields) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 p-6 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 text-[#7A1C32]">
                <Building className="w-5 h-5 text-[#8A2B43]" />
                <h3 className="text-base font-bold">إضافة مورد جديد (Add Supplier)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Supplier Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  اسم المورد / الورشة (Supplier Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: ورشة البهجة للمنسوجات"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43] bg-pyjama-cream/30"
                  required
                />
              </div>

              {/* Field 2: Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  رقم الهاتف (Phone Number) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: +213 550 12 34 56"
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#8A2B43] bg-pyjama-cream/30"
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
                  disabled={isSubmitting}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ المورد'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table OR Empty State */}
      {suppliers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-card space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-pyjama-cream border border-pyjama-pink/40 text-[#8A2B43] flex items-center justify-center mx-auto shadow-sm">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-pyjama-charcoal">لا يوجد موردين مسجلين حالياً</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              قائمة الموردين والورشات فارغة. اضغط على زر "إضافة مورد جديد" للبدء في التسجيل.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مورد جديد (New Supplier)</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-pyjama-cream/80 text-pyjama-charcoal font-bold border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6">اسم المورد / الورشة</th>
                  <th className="py-4 px-6">رقم الهاتف</th>
                  <th className="py-4 px-6 text-center">التحكم والإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-pyjama-cream/30 transition-all">
                    {/* Supplier Name */}
                    <td className="py-4 px-6 font-bold text-pyjama-charcoal">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-pyjama-pink-soft text-[#8A2B43] rounded-xl">
                          <Building className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{sup.name}</span>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="py-4 px-6 font-mono font-bold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#8A2B43]" />
                        <span>{sup.phone}</span>
                      </div>
                    </td>

                    {/* Action Column (Delete Button) */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDelete(sup.id, sup.name)}
                        disabled={deletingId === sup.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold border border-rose-200 shadow-sm disabled:opacity-50"
                        title="حذف هذا المورد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === sup.id ? 'جاري الحذف...' : 'حذف'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
