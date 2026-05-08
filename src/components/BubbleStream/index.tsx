'use client';

import { useEffect, useRef } from 'react';
import styles from './index.module.css';
import { useProjectStore, type Bubble, type AgentId } from '@/store/projectStore';

const AGENT_CONFIG: Record<AgentId, { label: string; initials: string; color: string }> = {
  master: { label: 'Agent Master', initials: 'AM', color: 'var(--agent-master)' },
  atomizer: { label: 'Atomiseur', initials: 'AT', color: 'var(--agent-atomizer)' },
  archiviste: { label: 'Archiviste', initials: 'AR', color: 'var(--agent-archiviste)' },
  'garde-fou': { label: 'Garde-Fou', initials: 'GF', color: 'var(--agent-garde-fou)' },
};

function BubbleItem({ bubble }: { bubble: Bubble }) {
  const agent = AGENT_CONFIG[bubble.agentId];

  return (
    <div className={styles.bubble}>
      <div className={styles.avatar} style={{ background: agent.color }}>
        {agent.initials}
      </div>
      <div className={styles.content}>
        <div className={styles.agentLabel}>{agent.label}</div>
        <div className={`${styles.text} ${bubble.isStreaming ? styles.streaming : ''}`}>
          {bubble.content || <span className={styles.cursor} />}
        </div>
      </div>
    </div>
  );
}

export default function BubbleStream() {
  const bubbles = useProjectStore((s) => s.bubbles);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const bottom = bottomRef.current;
    if (!container || !bottom) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom) {
      bottom.scrollIntoView({ behavior: 'smooth' });
    }
  }, [bubbles]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.stream}>
        {bubbles.map((bubble) => (
          <BubbleItem key={bubble.id} bubble={bubble} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
