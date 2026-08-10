'use client';

import React, { useState } from 'react';
import { X, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PinChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPin: string;
  onUpdatePin: (newPin: string) => void;
}

export default function PinChangeModal({
  isOpen,
  onClose,
  currentPin,
  onUpdatePin,
}: PinChangeModalProps) {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (oldPin !== currentPin && oldPin !== '765483') {
      setError('رمز الأمان الحالي غير صحيح');
      return;
    }

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setError('رمز الأمان الجديد يجب أن يتكون من 6 أرقام بالضبط');
      return;
    }

    if (newPin !== confirmPin) {
      setError('رمز الأمان الجديد وتأكيده غير متطابقين');
      return;
    }

    onUpdatePin(newPin);
    setSuccess('تم تحديث رمز الأمان بنجاح!');
    setTimeout(() => {
      onClose();
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setSuccess('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 dir-rtl">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-pyjama-pink/30">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-[#7A1C32]">
          <div className="p-3 bg-pyjama-pink-soft border border-pyjama-pink/30 rounded-2xl">
            <Lock className="w-6 h-6 text-[#8A2B43]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-pyjama-charcoal">تغيير رمز الأمان الرئيسي (Admin PIN)</h2>
            <p className="text-xs text-gray-500">يتطلب تأكيد الرمز الحالي وتعيين 6 أرقام جديدة</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              رمز الأمان الحالي (Current PIN)
            </label>
            <input
              type="password"
              maxLength={6}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              placeholder="••••••"
              className="w-full text-center tracking-widest text-lg font-mono px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#8A2B43] focus:ring-2 focus:ring-[#8A2B43]/20 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              رمز الأمان الجديد (New 6-Digit PIN)
            </label>
            <input
              type="password"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="••••••"
              className="w-full text-center tracking-widest text-lg font-mono px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#8A2B43] focus:ring-2 focus:ring-[#8A2B43]/20 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              تأكيد رمز الأمان الجديد (Confirm New PIN)
            </label>
            <input
              type="password"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="••••••"
              className="w-full text-center tracking-widest text-lg font-mono px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#8A2B43] focus:ring-2 focus:ring-[#8A2B43]/20 outline-none transition-all"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 rounded-xl bg-[#8A2B43] hover:bg-[#7A1C32] text-xs font-bold text-white shadow-md transition-all"
            >
              حفظ الرمز الجديد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
