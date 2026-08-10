'use client';

import React, { useState } from 'react';
import { Settings, Lock, Share2, PhoneCall, MapPin, Bell, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';
import { AdminSettings } from '@/types/admin';

interface SettingsHubProps {
  settings: AdminSettings;
  onSaveSettings: (updated: AdminSettings) => void;
  onOpenPinChangeModal: () => void;
}

export default function SettingsHub({
  settings,
  onSaveSettings,
  onOpenPinChangeModal,
}: SettingsHubProps) {
  const [formData, setFormData] = useState<AdminSettings>(settings);
  const [phoneList, setPhoneList] = useState<string[]>(settings.callPhoneNumbers || ['+213 555 11 22 33']);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddPhone = () => {
    setPhoneList([...phoneList, '']);
  };

  const handleRemovePhone = (index: number) => {
    setPhoneList(phoneList.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (index: number, val: string) => {
    const updated = [...phoneList];
    updated[index] = val;
    setPhoneList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings = {
      ...formData,
      callPhoneNumbers: phoneList.filter((p) => p.trim() !== ''),
    };
    onSaveSettings(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-pyjama-charcoal">مركز الإعدادات الشاملة للمتجر</h2>
          <p className="text-xs text-gray-500 mt-1">
            إدارة روابط وسائل التواصل، هواتف التنبيهات، رموز الأمان، والعنوان الرئيسي
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم حفظ الإعدادات بنجاح!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Store Address & Location Defaults */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-[#7A1C32] font-bold text-sm border-b border-gray-100 pb-3">
            <MapPin className="w-5 h-5 text-[#8A2B43]" />
            <h3>العنوان الافتراضي وموقع المتجر</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الولاية الافتراضية</label>
              <input
                type="text"
                value={formData.addressWilaya}
                onChange={(e) => setFormData({ ...formData, addressWilaya: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43]"
                placeholder="الشلف"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">البلدية الافتراضية</label>
              <input
                type="text"
                value={formData.addressCommune}
                onChange={(e) => setFormData({ ...formData, addressCommune: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43]"
                placeholder="الشلف"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رابط خريطة جوجل (Google Maps URL)</label>
              <input
                type="text"
                value={formData.mapsUrl}
                onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43] dir-ltr text-left"
                placeholder="https://maps.google.com/?q=Chlef"
              />
            </div>
          </div>
        </div>

        {/* 2. Social Media & Communication Links */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-[#7A1C32] font-bold text-sm border-b border-gray-100 pb-3">
            <Share2 className="w-5 h-5 text-[#8A2B43]" />
            <h3>روابط شبكات التواصل الاجتماعي وهاتف الواتساب</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رابط حساب انستغرام (Instagram)</label>
              <input
                type="text"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43] dir-ltr text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رابط حساب تيك توك (TikTok)</label>
              <input
                type="text"
                value={formData.tiktokUrl}
                onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43] dir-ltr text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رابط صفحة فيسبوك (Facebook)</label>
              <input
                type="text"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43] dir-ltr text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رقم واتساب الطلبيات الرئيسي (WhatsApp)</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#8A2B43] font-mono"
              />
            </div>
          </div>

          {/* Dynamic Call Phone Numbers */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700">أرقام هواتف الاتصال المباشر (Call Numbers)</label>
              <button
                type="button"
                onClick={handleAddPhone}
                className="flex items-center gap-1 text-xs font-bold text-[#8A2B43] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة رقم هاتف آخر</span>
              </button>
            </div>

            <div className="space-y-2">
              {phoneList.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => handlePhoneChange(idx, e.target.value)}
                    placeholder="+213 555 00 00 00"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#8A2B43]"
                  />
                  {phoneList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Automated Alert Recipient Numbers */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-[#7A1C32] font-bold text-sm border-b border-gray-100 pb-3">
            <Bell className="w-5 h-5 text-[#8A2B43]" />
            <h3>أرقام هواتف مسؤولي التنبيهات المباشرة</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">هاتف مسؤول مخزون المحل</label>
              <input
                type="text"
                value={formData.storeManagerPhone}
                onChange={(e) => setFormData({ ...formData, storeManagerPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#8A2B43]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">هاتف مسؤول مخزون التوصيل</label>
              <input
                type="text"
                value={formData.deliveryManagerPhone}
                onChange={(e) => setFormData({ ...formData, deliveryManagerPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#8A2B43]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">هاتف قسم التعليب (لتنبيهات الإلغاء)</label>
              <input
                type="text"
                value={formData.packagingStaffPhone}
                onChange={(e) => setFormData({ ...formData, packagingStaffPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:outline-none focus:border-[#8A2B43]"
              />
            </div>
          </div>
        </div>

        {/* 4. PIN Passwords Security Management */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-[#7A1C32] font-bold text-sm border-b border-gray-100 pb-3">
            <Lock className="w-5 h-5 text-[#8A2B43]" />
            <h3>إدارة رموز الأمان والـ PIN للموظفين واللوحات الفرعية</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-pyjama-pink-soft/50 border border-pyjama-pink/40 space-y-2">
              <span className="text-xs font-bold text-[#7A1C32] block">رمز الأمان الرئيسي (Admin PIN)</span>
              <button
                type="button"
                onClick={onOpenPinChangeModal}
                className="w-full py-2 bg-[#8A2B43] hover:bg-[#7A1C32] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                تحديث رمز المدير 🔐
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رمز دخول الكاشير (Cashier PIN)</label>
              <input
                type="text"
                value={formData.cashierPin}
                onChange={(e) => setFormData({ ...formData, cashierPin: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono text-center font-bold tracking-widest focus:outline-none focus:border-[#8A2B43]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">رمز دخول التوضيب (Packaging PIN)</label>
              <input
                type="text"
                value={formData.packagingPin}
                onChange={(e) => setFormData({ ...formData, packagingPin: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono text-center font-bold tracking-widest focus:outline-none focus:border-[#8A2B43]"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#8A2B43] hover:bg-[#7A1C32] text-white text-sm font-bold shadow-lg transition-all transform hover:scale-[1.01]"
          >
            <Save className="w-5 h-5" />
            <span>حفظ كافة التغييرات والإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
}
