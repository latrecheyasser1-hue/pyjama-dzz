'use client';

import React from 'react';
import { Volume2, VolumeX, Bell, X, Sparkles, Package } from 'lucide-react';
import { ToastAlert } from '@/hooks/useOrderNotification';

interface NotificationControlsProps {
  isMuted: boolean;
  onToggleSound: () => void;
  toastAlerts: ToastAlert[];
  onDismissToast: (id: string) => void;
  onTestSound: () => void;
}

export function NotificationControls({
  isMuted,
  onToggleSound,
  onTestSound,
}: NotificationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Test Sound Button */}
      <button
        onClick={onTestSound}
        className="px-3 py-1.5 rounded-xl bg-pyjama-pink-soft text-[#8A2B43] hover:bg-[#8A2B43] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 border border-pyjama-pink/40"
        title="تجربة صوت التنبيه (Test Order Sound Chime)"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#8A2B43]" />
        <span className="hidden md:inline">تجربة التنبيه الصوتية</span>
      </button>

      {/* Sound Toggle Speaker Button */}
      <button
        onClick={onToggleSound}
        className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
          isMuted
            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
        }`}
        title={isMuted ? 'تفعيل التنبيهات الصوتية' : 'كتم التنبيهات الصوتية'}
      >
        {isMuted ? (
          <>
            <VolumeX className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">الصوت مكتوم</span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">الصوت مفعل</span>
          </>
        )}
      </button>
    </div>
  );
}

export function ToastNotificationContainer({
  toastAlerts,
  onDismissToast,
}: {
  toastAlerts: ToastAlert[];
  onDismissToast: (id: string) => void;
}) {
  if (toastAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 space-y-3 max-w-sm w-full font-sans dir-rtl" dir="rtl">
      {toastAlerts.map((toast) => (
        <div
          key={toast.id}
          className="bg-[#7A1C32] text-white rounded-2xl p-4 shadow-2xl border border-[#E8A5B8]/40 flex items-start justify-between gap-3 animate-slide-up transform hover:scale-[1.02] transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#E8A5B8] text-[#7A1C32] rounded-xl font-bold shrink-0 mt-0.5">
              <Package className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{toast.title}</h4>
                <span className="text-[10px] text-[#E8A5B8] font-mono">{toast.createdAt}</span>
              </div>
              <p className="text-xs text-white/90 leading-snug">{toast.message}</p>
            </div>
          </div>

          <button
            onClick={() => onDismissToast(toast.id)}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
