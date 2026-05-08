import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yaaden Studio',
  description: 'Agence de conseil agentique fractale',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
