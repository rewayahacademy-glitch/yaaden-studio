'use client';

import styles from './index.module.css';
import { useProjectStore, type Atom } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';

const STATUS_COLORS: Record<Atom['status'], string> = {
  pending: 'var(--atom-pending)',
  active: 'var(--atom-active)',
  completed: 'var(--atom-completed)',
  blocked: 'var(--atom-blocked)',
};

function getDepth(id: string): number {
  return id.split('.').length - 1;
}

function AtomNode({ atom }: { atom: Atom }) {
  const depth = getDepth(atom.id);
  const isRoot = depth === 0;

  return (
    <div
      className={`${styles.node} ${isRoot ? styles.rootNode : ''}`}
      style={{ paddingLeft: `${16 + depth * 18}px` }}
    >
      <span
        className={styles.dot}
        style={{ background: STATUS_COLORS[atom.status] }}
      />
      <span className={styles.nodeTitle}>
        <span className={styles.nodeId}>{atom.id}</span>
        {atom.title}
      </span>
    </div>
  );
}

export default function AtomPanel() {
  const atoms = useProjectStore((s) => s.atoms);
  const isProcessing = useUIStore((s) => s.isProcessing);

  const leafCount = atoms.filter(
    (a) => !atoms.some((b) => b.parentId === a.id)
  ).length;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Atomes</span>
        {atoms.length > 0 && (
          <span className={styles.badge}>{atoms.length}</span>
        )}
      </div>

      <div className={styles.tree}>
        {atoms.map((atom) => (
          <AtomNode key={atom.id} atom={atom} />
        ))}

        {atoms.length === 0 && isProcessing && (
          <p className={styles.empty}>Atomisation en cours...</p>
        )}

        {atoms.length === 0 && !isProcessing && (
          <p className={styles.empty}>Les atomes apparaîtront ici.</p>
        )}
      </div>

      {leafCount > 0 && (
        <div className={styles.footer}>
          <span className={styles.footerText}>
            {leafCount} action{leafCount > 1 ? 's' : ''} atomique{leafCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </aside>
  );
}
