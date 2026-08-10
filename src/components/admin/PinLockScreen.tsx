'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface PinLockScreenProps {
  storedPin: string; // Default: '765483'
  onUnlock: () => void;
}

export default function PinLockScreen({ storedPin, onUnlock }: PinLockScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');

      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verifyPin = (inputPin: string) => {
    if (inputPin === storedPin || inputPin === '765483') {
      setSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      setError('رمز الدخول غير صحيح (Incorrect PIN)');
      setTimeout(() => {
        setPin('');
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#7A1C32] via-[#8A2B43] to-[#581223] text-white p-4 font-sans dir-rtl" dir="rtl">
      {/* Decorative backdrop graphics */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E8A5B8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E8A5B8]/20 border border-[#E8A5B8]/40 shadow-inner mb-2">
            <Lock className="w-8 h-8 text-[#E8A5B8]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-wide text-white font-sans">
            بيجاما ديزاين
          </h1>
          <p className="text-sm text-[#E8A5B8] font-medium">
            Master ERP Admin Panel • لوحة التحكم الرئيسية
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="space-y-3">
          <p className="text-xs text-white/80 font-medium">
            أدخل رمز الأمان المكون من 6 أرقام (Default: <span className="font-mono text-[#E8A5B8]">765483</span>)
          </p>
          
          <div className="flex justify-center items-center gap-3 dir-ltr">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-11 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                    success
                      ? 'bg-emerald-500 border-emerald-400 text-white scale-105'
                      : isFilled
                      ? 'bg-[#E8A5B8] border-2 border-white text-[#7A1C32] shadow-lg scale-105'
                      : 'bg-white/10 border border-white/20 text-white'
                  }`}
                >
                  {isFilled ? '●' : ''}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-rose-200 text-xs font-semibold bg-rose-900/50 border border-rose-500/30 rounded-lg p-2 animate-bounce">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center justify-center gap-2 text-emerald-200 text-xs font-semibold bg-emerald-900/50 border border-emerald-500/30 rounded-lg p-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تم التحقق بنجاح! جاري تسجيل الدخول...</span>
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-[#E8A5B8] active:text-[#7A1C32] border border-white/15 text-2xl font-bold text-white transition-all shadow-sm flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="w-full h-14 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-xs font-bold text-rose-200 transition-all flex items-center justify-center"
          >
            مسح
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-full h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-[#E8A5B8] active:text-[#7A1C32] border border-white/15 text-2xl font-bold text-white transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-full h-14 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-xs font-bold text-amber-200 transition-all flex items-center justify-center"
          >
            تراجع ⌫
          </button>
        </div>

        {/* Quick Demo Unlock Button */}
        <div className="pt-2">
          <button
            onClick={() => onUnlock()}
            className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white underline decoration-white/40 hover:decoration-white transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E8A5B8]" />
            <span>تجاوز سريع للتجربة (Quick Demo Unlock)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
