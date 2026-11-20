import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DarkSpaceSecurity | LMS & Cyber Training Portal',
  description: 'Elevate your cybersecurity career with DarkSpaceSecurity. Industry-leading training in Ethical Hacking, VAPT, SOC, and AI.',
  icons: {
    icon: '/logo-mark.png',
    apple: '/logo-mark.png',
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
