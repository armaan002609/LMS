import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LMS Portal — Multi-Tenant Learning Platform',
  description: 'Enterprise grade white-label learning management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--color-surface)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
