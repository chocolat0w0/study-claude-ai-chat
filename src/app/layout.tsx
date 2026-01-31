import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Code Assistant',
  description: 'AI-powered coding assistant using Claude',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
