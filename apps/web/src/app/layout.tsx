import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dark Space Security | LMS & Cyber Training Portal',
  description: 'Elevate your cybersecurity career with Dark Space Security. Hands-on training in Ethical Hacking, VAPT, SOC, and AI.',
  icons: {
    icon: 'https://darkspacesecurity.io/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[var(--color-surface)] text-[var(--color-text)] font-sans">
        {children}
      </body>
    </html>
  );
}
