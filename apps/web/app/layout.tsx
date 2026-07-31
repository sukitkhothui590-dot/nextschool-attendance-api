import type { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const notoThai = Noto_Sans_Thai({
  variable: '--font-noto-thai',
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Attendance Operations | คอนโซลบริหารการเข้าเรียน',
  description: 'ระบบบริหารการเช็คชื่อนักเรียนสำหรับผู้ดูแลโรงเรียน',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${notoThai.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
