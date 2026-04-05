import { create } from 'zustand';

interface ToastState {
  message: string | null;
  type: 'success' | 'error';
  show: (message: string, type?: 'success' | 'error') => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'success',
  show: (message, type = 'success') => {
    if (timer) clearTimeout(timer);
    set({ message, type });
    timer = setTimeout(() => set({ message: null }), 3000);
  },
  hide: () => {
    if (timer) clearTimeout(timer);
    set({ message: null });
  },
}));
