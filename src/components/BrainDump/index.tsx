'use client';

import { useState } from 'react';
import styles from './index.module.css';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';

export default function BrainDump() {
  const [text, setText] = useState('');
  const setBraindump = useProjectStore((s) => s.setBraindump);
  const reset = useProjectStore((s) => s.reset);
  const setPhase = useUIStore((s) => s.setPhase);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    reset();
    setBraindump(text.trim());
    setPhase('session');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>YS</div>
          <span className={styles.logoText}>Yaaden Studio</span>
        </div>
        <p className={styles.tagline}>Agence de conseil agentique</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label} htmlFor="braindump">
          Décris ton projet ou ton idée brute
        </label>
        <textarea
          id="braindump"
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: Lancer une micro-ferme aquaponique urbaine en coopérative…"
          rows={6}
          autoFocus
        />
        <div className={styles.footer}>
          <span className={styles.hint}>
            Ctrl+Entrée pour lancer
          </span>
          <button type="submit" disabled={!text.trim()} className={styles.btn}>
            Lancer l&apos;analyse
          </button>
        </div>
      </form>
    </div>
  );
}
