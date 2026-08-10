'use client';

import React, { useState } from 'react';
import { Grid, Plus, Trash2, Edit2, Check, ExternalLink } from 'lucide-react';
import { Category } from '@/types/admin';

interface CategoriesManagerProps {
  categories: Category[];
  onAddCategory: (nameAr: string, nameFr: string) => void;
  onDeleteCategory: (id: string) => void;
}

export default function CategoriesManager({
  categories,
  onAddCategory,
  onDeleteCategory,
}: CategoriesManagerProps) {
  const [nameAr, setNameAr] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !nameFr) return;
    onAddCategory(nameAr, nameFr);
    setNameAr('');
    setNameFr('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-pyjama-charcoal">إدارة الأقسام والتصنيفات</h2>
          <p className="text-xs text-gray-500 mt-1">
            إضافة وتعديل أقسام المتجر (تنعكس فورياً ومباشرة على المتجر الرئيسي)
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-xs font-bold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد (New Category)</span>
        </button>
      </div>

      {/* Add Category Form Modal/Card */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-pyjama-pink/40 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2">
            <Grid className="w-4 h-4" />
            <span>بيانات التصنيف الجديد</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                اسم القسم باللغة العربية (Arabic Name)
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: بيجامات حريرية"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                اسم القسم باللغة الفرنسية (French Name)
              </label>
              <input
                type="text"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                placeholder="Ex: Pyjamas Hiver"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43] dir-ltr text-left"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8A2B43] text-white text-xs font-bold shadow-md hover:bg-[#7A1C32]"
            >
              حفظ القسم في قاعدة البيانات
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:border-pyjama-pink transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pyjama-pink-soft text-[#8A2B43] rounded-xl font-bold">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-pyjama-charcoal">{cat.nameAr}</h4>
                <p className="text-xs text-gray-500 font-mono dir-ltr text-right">{cat.nameFr}</p>
                <span className="inline-block mt-1 text-[10px] text-gray-400 font-mono">
                  Slug: {cat.slug}
                </span>
              </div>
            </div>

            <button
              onClick={() => onDeleteCategory(cat.id)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="حذف التصنيف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
