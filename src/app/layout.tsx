import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Class Deadline Hub',
    default: 'Class Deadline Hub - Cổng Quản Lý Hạn Nộp',
  },
  description:
    'Cổng thông tin theo dõi và quản lý deadline bài tập, đồ án dành cho sinh viên.',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Class Deadline Hub',
    description: 'Cổng theo dõi hạn nộp bài tập và đồ án của lớp',
    siteName: 'Class Deadline Hub',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
