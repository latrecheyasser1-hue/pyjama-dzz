'use client';

import React from 'react';
import {
  BellRing,
  Package,
  Grid,
  Users,
  UserCheck,
  MessageSquareWarning,
  TrendingUp,
  History,
  Settings,
  Lock,
  LogOut,
  ChevronLeft,
  X
} from 'lucide-react';
import { DashboardSection } from '@/types/admin';

interface AdminSidebarProps {
  activeSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
  unconfirmedCount: number;
  onOpenPinChangeModal: () => void;
  onLock: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  activeSection,
  onSelectSection,
  unconfirmedCount,
  onOpenPinChangeModal,
  onLock,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const menuItems = [
    {
      id: 'NEW_ORDERS' as DashboardSection,
      labelAr: 'الطلبيات الجديدة',
      icon: BellRing,
      badge: unconfirmedCount > 0 ? unconfirmedCount : null,
      pulse: unconfirmedCount > 0,
    },
    {
      id: 'INVENTORY' as DashboardSection,
      labelAr: 'المخزون والمنتجات',
      icon: Package,
    },
    {
      id: 'CATEGORIES' as DashboardSection,
      labelAr: 'الأقسام والتصنيفات',
      icon: Grid,
    },
    {
      id: 'SUPPLIERS' as DashboardSection,
      labelAr: 'إدارة الموردين',
      icon: Users,
    },
    {
      id: 'CUSTOMERS' as DashboardSection,
      labelAr: 'إدارة الزبائن والتصنيف',
      icon: UserCheck,
    },
    {
      id: 'COMPLAINTS' as DashboardSection,
      labelAr: 'الشكاوى والاقتراحات',
      icon: MessageSquareWarning,
    },
    {
      id: 'ANALYTICS' as DashboardSection,
      labelAr: 'التحليلات والمصاريف',
      icon: TrendingUp,
    },
    {
      id: 'ORDER_HISTORY' as DashboardSection,
      labelAr: 'الأرشيف والسجل العام',
      icon: History,
    },
    {
      id: 'SETTINGS' as DashboardSection,
      labelAr: 'الإعدادات الشاملة',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-all"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 w-72 bg-[#7A1C32] text-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } dir-rtl`}
        dir="rtl"
      >
        {/* Top Brand Banner */}
        <div>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E8A5B8] flex items-center justify-center shadow-lg text-[#7A1C32] font-black text-xl">
                بي
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-wide font-sans">
                  بيجاما ديزاين
                </h1>
                <p className="text-[11px] text-[#E8A5B8] font-medium tracking-wider">
                  Pyjama Design ERP
                </p>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-[#8A2B43] text-white shadow-lg border border-[#E8A5B8]/30 scale-[1.02]'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#E8A5B8] text-[#7A1C32]'
                          : 'bg-white/10 text-white/80 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-sans">{item.labelAr}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold text-[#7A1C32] bg-[#E8A5B8] shadow-sm ${
                        item.pulse ? 'animate-pulse' : ''
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-[#581223]/50">
          <button
            onClick={onOpenPinChangeModal}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#E8A5B8]" />
              <span>تغيير رمز الأمان (Admin PIN)</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-white/40" />
          </button>

          <button
            onClick={onLock}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-200 bg-rose-950/40 border border-rose-500/20 hover:bg-rose-900/60 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>قفل لوحة التحكم (Lock ERP)</span>
          </button>
        </div>
      </aside>
    </>
  );
}
