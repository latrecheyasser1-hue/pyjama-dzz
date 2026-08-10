'use client';

import React from 'react';
import { X, Package } from 'lucide-react';
import { ToastAlert } from '@/hooks/useOrderNotification';

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
