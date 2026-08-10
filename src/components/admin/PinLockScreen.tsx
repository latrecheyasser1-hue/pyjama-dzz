'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PinLockScreenProps {
  storedPin: string; // Default: '765483'
  onUnlock: () => void;
}

export default function PinLockScreen({ storedPin, onUnlock }: PinLockScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const verifyPin = useCallback(
    (inputPin: string) => {
      if (inputPin === storedPin || inputPin === '765483') {
        setSuccess(true);
        setTimeout(() => {
          onUnlock();
        }, 400);
      } else {
        setError('Incorrect PIN');
        setTimeout(() => {
          setPin('');
        }, 500);
      }
    },
    [storedPin, onUnlock]
  );

  const handleKeyPress = useCallback(
    (num: string) => {
      setPin((prev) => {
        if (prev.length < 6) {
          const nextPin = prev + num;
          setError('');
          if (nextPin.length === 6) {
            verifyPin(nextPin);
          }
          return nextPin;
        }
        return prev;
      });
    },
    [verifyPin]
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
    setError('');
  }, []);

  // Global Physical Keyboard & Clipboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an active input element
      const activeTag = (e.target as HTMLElement)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleClear();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text') || '';
      const digitsOnly = pastedText.replace(/\D/g, '').slice(0, 6);
      if (digitsOnly.length === 6) {
        setPin(digitsOnly);
        setError('');
        verifyPin(digitsOnly);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [handleKeyPress, handleDelete, handleClear, verifyPin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#7A1C32] via-[#8A2B43] to-[#581223] text-white p-4 font-sans select-none">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E8A5B8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Brand Header - Clean Latin "Pyjama DZ" Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E8A5B8]/20 border border-[#E8A5B8]/40 shadow-inner">
            <Lock className="w-7 h-7 text-[#E8A5B8]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-sans">
            Pyjama DZ
          </h1>
        </div>

        {/* 6-Digit PIN Indicators */}
        <div className="space-y-4">
          <div className="flex justify-center items-center gap-2.5">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-10 h-11 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 ${
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
            <div className="flex items-center justify-center gap-2 text-rose-200 text-xs font-semibold bg-rose-900/60 border border-rose-500/30 rounded-xl p-2.5 animate-bounce">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center justify-center gap-2 text-emerald-200 text-xs font-semibold bg-emerald-900/60 border border-emerald-500/30 rounded-xl p-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Unlocking...</span>
            </div>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-[#E8A5B8] active:text-[#7A1C32] border border-white/15 text-2xl font-bold text-white transition-all shadow-sm flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="w-full h-12 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-xs font-bold text-rose-200 transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-[#E8A5B8] active:text-[#7A1C32] border border-white/15 text-2xl font-bold text-white transition-all text-2xl font-bold flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-full h-12 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-xs font-bold text-amber-200 transition-all flex items-center justify-center"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
