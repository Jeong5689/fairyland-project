import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sunny Forest - AI 동화 이야기',
  description: 'AI로 만들어가는 나만의 써니 포레스트 동화 세상',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 상단 네비게이션 헤더 (로그인 / 회원가입 / 로그아웃 버튼 포함) */}
        <Header />

        {/* 각 페이지의 주요 콘텐츠가 들어가는 영역 */}
        <main className="min-h-[calc(100vh-65px)] bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}