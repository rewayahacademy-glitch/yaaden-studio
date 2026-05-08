import { create } from 'zustand';

export type AppPhase = 'braindump' | 'session';

interface UIState {
  phase: AppPhase;
  isProcessing: boolean;
  setPhase: (phase: AppPhase) => void;
  setIsProcessing: (val: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  phase: 'braindump',
  isProcessing: false,
  setPhase: (phase) => set({ phase }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}));
