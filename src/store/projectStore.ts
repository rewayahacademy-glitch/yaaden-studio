import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AgentId = 'master' | 'atomizer' | 'archiviste' | 'garde-fou';

export interface Bubble {
  id: string;
  agentId: AgentId;
  content: string;
  isStreaming: boolean;
  timestamp: number;
}

export interface Atom {
  id: string;
  title: string;
  parentId: string | null;
  status: 'pending' | 'active' | 'completed' | 'blocked';
  lockedBy?: string;
}

interface ProjectState {
  braindump: string;
  bubbles: Bubble[];
  atoms: Atom[];
  setBraindump: (text: string) => void;
  addBubble: (bubble: Bubble) => void;
  updateBubble: (id: string, updates: Partial<Bubble>) => void;
  addAtom: (atom: Atom) => void;
  updateAtom: (id: string, updates: Partial<Atom>) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      braindump: '',
      bubbles: [],
      atoms: [],
      setBraindump: (text) => set({ braindump: text }),
      addBubble: (bubble) =>
        set((s) => ({ bubbles: [...s.bubbles, bubble] })),
      updateBubble: (id, updates) =>
        set((s) => ({
          bubbles: s.bubbles.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      addAtom: (atom) => set((s) => ({ atoms: [...s.atoms, atom] })),
      updateAtom: (id, updates) =>
        set((s) => ({
          atoms: s.atoms.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
      reset: () => set({ braindump: '', bubbles: [], atoms: [] }),
    }),
    {
      name: 'yaaden-project',
      partialize: (state) => ({
        braindump: state.braindump,
        bubbles: state.bubbles.map((b) => ({ ...b, isStreaming: false })),
        atoms: state.atoms,
      }),
    }
  )
);
