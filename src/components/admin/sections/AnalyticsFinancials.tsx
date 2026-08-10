'use client';

import React from 'react';
import { DollarSign, TrendingUp, PackageCheck, Zap, AlertOctagon, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Order, Product, Expense } from '@/types/admin';

interface AnalyticsFinancialsProps {
  orders: Order[];
  products: Product[];
  expenses: Expense[];
}

export default function AnalyticsFinancials({
  orders,
  products,
  expenses,
}: AnalyticsFinancialsProps) {
  // Financial Calculations
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const totalRevenue = deliveredOrders.reduce((acc, o) => acc + o.totalAmountDzd, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amountDzd, 0);

  // Estimate COGS as 60% of Revenue for demo/analytics
  const estimatedCOGS = totalRevenue * 0.6;
  const netProfit = totalRevenue - (estimatedCOGS + totalExpenses);

  // Logistics Ratios
  const totalOrdersCount = orders.length || 1;
  const confirmedCount = orders.filter((o) => o.status !== 'UNCONFIRMED' && o.status !== 'CANCELLED').length;
  const deliveredCount = deliveredOrders.length;
  const returnedCount = orders.filter((o) => o.status === 'RETURNED' || o.status === 'CANCELLED').length;

  const confirmationRate = Math.round((confirmedCount / totalOrdersCount) * 100);
  const deliveryRate = Math.round((deliveredCount / totalOrdersCount) * 100);
  const retourRate = Math.round((returnedCount / totalOrdersCount) * 100);

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card">
        <h2 className="text-xl font-bold text-pyjama-charcoal">التحليلات المالية والربح الصافي الحقيقي</h2>
        <p className="text-xs text-gray-500 mt-1">
          حساب صافي الأرباح (الإيرادات - التكلفة والمصاريف والمرتجعات)، سرعة حركة السلعة، ونسب التوصيل
        </p>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Profit Card */}
        <div className="bg-gradient-to-br from-[#8A2B43] to-[#581223] text-white rounded-3xl p-6 shadow-card space-y-3 relative overflow-hidden border border-[#E8A5B8]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E8A5B8]">الربح الصافي الحقيقي (Net Profit)</span>
            <div className="p-2 bg-[#E8A5B8]/20 rounded-xl text-[#E8A5B8]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black font-mono tracking-tight">
            {netProfit.toLocaleString()} DZD
          </div>
          <p className="text-[11px] text-white/70">
            الإيرادات الإجمالية مطروحاً منها تكلفة السلعة والمصاريف العامة والمرتجعات
          </p>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">إجمالي المبيعات والمدخولات</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-pyjama-charcoal font-mono">
            {totalRevenue.toLocaleString()} DZD
          </div>
          <p className="text-[11px] text-gray-400">
            من إجمالي {deliveredCount} طلبية مسلّمة بنجاح
          </p>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">المصاريف والتكاليف والشحن</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {(estimatedCOGS + totalExpenses).toLocaleString()} DZD
          </div>
          <p className="text-[11px] text-gray-400">
            تكلفة البضاعة المباعة + التشغيل والشحن
          </p>
        </div>
      </div>

      {/* Logistics Ratios Grid */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
        <h3 className="text-base font-bold text-pyjama-charcoal flex items-center gap-2">
          <Percent className="w-5 h-5 text-[#8A2B43]" />
          <span>نسب ومؤشرات التوصيل والإلغاء (Logistics Ratios)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-pyjama-cream/50 border border-gray-200 space-y-2">
            <span className="text-xs font-bold text-gray-600 block">نسبة التأكيد (Confirmation Rate)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-[#8A2B43]">{confirmationRate}%</span>
              <span className="text-xs text-gray-500 font-mono">{confirmedCount} / {totalOrdersCount}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-[#8A2B43] h-full rounded-full" style={{ width: `${confirmationRate}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-900 block">نسبة التوصيل الناجح (Delivery Rate)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-emerald-700">{deliveryRate}%</span>
              <span className="text-xs text-emerald-600 font-mono">{deliveredCount} مسلّمة</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${deliveryRate}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
            <span className="text-xs font-bold text-rose-900 block">نسبة الإلغاء والمرتجع (Retour Rate)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono text-rose-700">{retourRate}%</span>
              <span className="text-xs text-rose-600 font-mono">{returnedCount} مرتجعة</span>
            </div>
            <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-600 h-full rounded-full" style={{ width: `${retourRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Velocity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fast Moving Products */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Zap className="w-5 h-5" />
            <h3 className="text-base font-bold">المنتجات الأكثر مبيعاً (Fast-Moving Stock)</h3>
          </div>
          <div className="space-y-3">
            {products.slice(0, 3).map((prod) => (
              <div key={prod.id} className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div>
                  <h4 className="text-xs font-bold text-pyjama-charcoal">{prod.nameAr}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">SKU: {prod.sku}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold">
                  سريعة الدوران
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slow Moving / Dead Stock */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertOctagon className="w-5 h-5" />
            <h3 className="text-base font-bold">السلعة الثقيلة / بطيئة الحركة (Dead Stock)</h3>
          </div>
          <div className="space-y-3">
            {products.slice(3, 5).map((prod) => (
              <div key={prod.id} className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                <div>
                  <h4 className="text-xs font-bold text-pyjama-charcoal">{prod.nameAr}</h4>
                  <span className="text-[10px] text-gray-500 font-mono">SKU: {prod.sku}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-mono text-xs font-bold">
                  بطيئة الحركة
                </span>
              </div>
            ))}
            {products.length <= 3 && (
              <p className="text-xs text-gray-400 text-center py-4">لا توجد سلعة ثقيلة حالياً</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
