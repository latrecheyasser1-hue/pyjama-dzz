'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { playNewOrderChime } from '@/utils/soundAlert';

export interface ToastAlert {
  id: string;
  title: string;
  message: string;
  orderId?: string;
  createdAt: string;
}

export function useOrderNotification(onNewOrderReceived?: (newOrderData: any) => void) {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toastAlerts, setToastAlerts] = useState<ToastAlert[]>([]);

  // Load sound mute setting from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('pyjama_sound_muted');
      if (savedMute !== null) {
        setIsMuted(savedMute === 'true');
      }
    }
  }, []);

  const toggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const nextState = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('pyjama_sound_muted', String(nextState));
      }
      return nextState;
    });
  }, []);

  // Pure sound test function: strictly plays audio without altering orders state
  const playTestSound = useCallback(() => {
    playNewOrderChime();
  }, []);

  const triggerNewOrderAlert = useCallback(
    (orderData?: any) => {
      // Play sound chime if sound is enabled
      if (!isMuted) {
        playNewOrderChime();
      }

      // Add visual toast notification with guaranteed unique ID
      const uniqueId = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastAlert = {
        id: uniqueId,
        title: '📦 طلبية جديدة واردة الآن!',
        message: orderData?.customer_name || orderData?.customerName
          ? `طلب جديد باسم ${orderData.customer_name || orderData.customerName} بقيمة ${orderData.total_amount_dzd || orderData.totalAmountDzd || ''} DZD`
          : 'وصلتك طلبية جديدة في الانتظار',
        orderId: orderData?.formatted_id || orderData?.formattedId,
        createdAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      };

      setToastAlerts((prev) => [newToast, ...prev.slice(0, 4)]);

      // Auto dismiss toast after 5 seconds
      setTimeout(() => {
        setToastAlerts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);

      // Invoke callback ONLY for genuine realtime database updates
      if (onNewOrderReceived) {
        onNewOrderReceived(orderData);
      }
    },
    [isMuted, onNewOrderReceived]
  );

  const dismissToast = useCallback((id: string) => {
    setToastAlerts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Supabase Realtime Subscription: ONLY genuine DB inserts trigger state updates
  useEffect(() => {
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          triggerNewOrderAlert(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [triggerNewOrderAlert]);

  // Handle browser autoplay policy on user's first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      } catch (e) {
        // Silent catch
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return {
    isMuted,
    toggleSound,
    playTestSound,
    toastAlerts,
    dismissToast,
    triggerNewOrderAlert,
  };
}
