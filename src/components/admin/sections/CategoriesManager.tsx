'use client';

import React, { useState } from 'react';
import { Grid, Plus, Trash2, Folder, Image as ImageIcon } from 'lucide-react';
import { Category, Product } from '@/types/admin';

interface CategoriesManagerProps {
  categories: Category[];
  products?: Product[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export default function CategoriesManager({
  categories,
  products = [],
  onAddCategory,
  onDeleteCategory,
}: CategoriesManagerProps) {
  const [name, setName] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddCategory(name.trim());
    setName('');
    setIsFormOpen(false);
  };

  // Helper to find automatic cover image from first product in category
  const getCategoryCover = (cat: Category) => {
    if (cat.coverImageUrl) return cat.coverImageUrl;
    const categoryProduct = products.find(
      (p) => p.categoryId === cat.id && p.imageUrl
    );
    return categoryProduct?.imageUrl || null;
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-pyjama-charcoal">إدارة الأقسام والتصنيفات (Categories)</h2>
          <p className="text-xs text-gray-500 mt-1">
            غلاف القسم يتحدّث تلقائياً بناءً على صورة أوّل منتج مضاف إلى هذا القسم
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

      {/* Simplified Add Category Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-pyjama-pink/40 shadow-card space-y-4 animate-slide-down">
          <h3 className="text-sm font-bold text-[#7A1C32] flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#8A2B43]" />
            <span>بيانات التصنيف الجديد</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              اسم القسم (Category Name)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: بيجامات حريرية / Pyjamas Hiver / ملابس نوم"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#8A2B43] shadow-sm"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">
              يمكنك كتابة الاسم بالعربية أو الفرنسية أو بشكل مختلط بحرية كاملة.
            </p>
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

      {/* Categories Grid with Auto-First Product Cover Image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const coverUrl = getCategoryCover(cat);
          const categoryName = cat.name || cat.nameAr || cat.nameFr || 'قسم جديد';

          return (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-card hover:border-[#E8A5B8] transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Automatic Cover Image Thumbnail or Theme Placeholder Badge */}
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={categoryName}
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-pyjama-cream border border-pyjama-pink/40 text-[#8A2B43] flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <Folder className="w-6 h-6 text-[#8A2B43]" />
                  </div>
                )}

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-pyjama-charcoal truncate">
                    {categoryName}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
                    Slug: {cat.slug}
                  </p>
                  <span className="inline-block mt-1 text-[10px] text-[#8A2B43] font-bold bg-pyjama-pink-soft px-2 py-0.5 rounded-md">
                    {products.filter((p) => p.categoryId === cat.id).length} منتج
                  </span>
                </div>
              </div>

              <button
                onClick={() => onDeleteCategory(cat.id)}
                className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                title="حذف التصنيف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
