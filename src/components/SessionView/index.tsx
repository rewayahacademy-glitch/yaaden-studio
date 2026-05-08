'use client';

import { useEffect, useRef } from 'react';
import styles from './index.module.css';
import BubbleStream from '@/components/BubbleStream';
import AtomPanel from '@/components/AtomPanel';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';

export default function SessionView() {
  const braindump = useProjectStore((s) => s.braindump);
  const bubbles = useProjectStore((s) => s.bubbles);
  const addBubble = useProjectStore((s) => s.addBubble);
  const updateBubble = useProjectStore((s) => s.updateBubble);
  const addAtom = useProjectStore((s) => s.addAtom);
  const setPhase = useUIStore((s) => s.setPhase);
  const setIsProcessing = useUIStore((s) => s.setIsProcessing);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current || bubbles.length > 0) return;
    hasStarted.current = true;
    runAgentSequence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAgentSequence() {
    setIsProcessing(true);

    // ── 1. Agent Master (streaming) ──────────────────────────────────────────
    const masterId = `bubble-master-${Date.now()}`;
    addBubble({ id: masterId, agentId: 'master', content: '', isStreaming: true, timestamp: Date.now() });

    let masterContent = '';
    try {
      const res = await fetch('/api/agent/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ braindump }),
      });

      if (!res.ok || !res.body) throw new Error('Réponse Master invalide');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') break;
          try {
            const { text } = JSON.parse(raw);
            if (text) {
              masterContent += text;
              updateBubble(masterId, { content: masterContent });
            }
          } catch {
            // chunk partiel — ignorer
          }
        }
      }
    } catch {
      masterContent = 'Une erreur est survenue lors de la connexion à l\'Agent Master.';
      updateBubble(masterId, { content: masterContent });
    }

    updateBubble(masterId, { isStreaming: false });

    // ── 2. Agent Atomiseur ───────────────────────────────────────────────────
    const atomizerId = `bubble-atomizer-${Date.now()}`;
    addBubble({ id: atomizerId, agentId: 'atomizer', content: '', isStreaming: true, timestamp: Date.now() });

    try {
      const res = await fetch('/api/agent/atomizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ braindump, masterAnalysis: masterContent }),
      });

      const data = await res.json();

      if (data.error) {
        updateBubble(atomizerId, { content: `Erreur d'atomisation : ${data.error}`, isStreaming: false });
      } else {
        updateBubble(atomizerId, { content: data.intro ?? 'Décomposition terminée.', isStreaming: false });

        // Révéler les atomes progressivement
        for (const atom of (data.atoms ?? [])) {
          await new Promise<void>((r) => setTimeout(r, 75));
          addAtom({
            id: atom.id,
            title: atom.title,
            parentId: atom.parentId,
            status: atom.parentId ? 'pending' : 'active',
          });
        }
      }
    } catch {
      updateBubble(atomizerId, { content: 'Erreur lors de l\'atomisation du projet.', isStreaming: false });
    }

    setIsProcessing(false);
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoMark}>YS</div>
          <span className={styles.logoName}>Yaaden Studio</span>
        </div>
        <div className={styles.divider} />
        <p className={styles.projectSnippet}>
          {braindump.slice(0, 72)}{braindump.length > 72 ? '…' : ''}
        </p>
        <button className={styles.newBtn} onClick={() => setPhase('braindump')}>
          Nouveau projet
        </button>
      </header>

      <div className={styles.body}>
        <AtomPanel />
        <BubbleStream />
      </div>
    </div>
  );
}
