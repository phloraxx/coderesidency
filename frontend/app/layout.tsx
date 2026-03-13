import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'CodeResidency — The Clinical Rotation Simulator for Software Engineers',
  description:
    'Bridge the gap between CS theory and real-world engineering. Practice debugging, client management, technical interviews, and Git collaboration through AI-powered simulations.',
  keywords: ['software engineering', 'education', 'AI', 'simulation', 'coding bootcamp'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
