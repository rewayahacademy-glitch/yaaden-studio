'use client';

import { useUIStore } from '@/store/uiStore';
import BrainDump from '@/components/BrainDump';
import SessionView from '@/components/SessionView';

export default function Home() {
  const phase = useUIStore((s) => s.phase);
  return phase === 'braindump' ? <BrainDump /> : <SessionView />;
}
