'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [character, setCharacter] = useState('');
  const [place, setPlace] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!character.trim() || !place.trim()) return;

    setIsLoading(true);
    const query = new URLSearchParams({ character, place }).toString();
    router.push(`/story?${query}`);
  };

  return (
    <main 
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-between p-6 sm:p-12 text-amber-950"
      style={{
        // ☀️ 햇살 아래 동화책을 읽는 따스한 자연 배경 이미지
        backgroundImage: `linear-gradient(to bottom, rgba(254, 243, 199, 0.75), rgba(255, 255, 255, 0.85)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920')`,
      }}
    >
      {/* ☀️ 상단 타이틀 영역 (시원하고 시인성 좋은 큰 폰트) */}
      <header className="relative z-10 text-center mt-6 sm:mt-12 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-white/90 border border-amber-300/80 shadow-sm mb-6 text-base font-semibold text-amber-900">
          <span>☀️</span>
          <span>따스한 햇살 아래 펼쳐지는 이야기</span>
          <span>📖</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-amber-950 leading-tight drop-shadow-sm">
          햇살 아래 모여 읽는 <br />
          <span className="bg-linear-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
            우리들의 동화 세상
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-xl text-amber-900/90 leading-relaxed font-semibold">
          눈부신 태양 아래 친구들과 모여 손에 쥔 책을 펼쳐보세요.<br className="hidden sm:inline" />
          상상하는 모든 순간이 생생한 동화로 살아납니다.
        </p>
      </header>

      {/* 📖 메인 입력 카드 (크기 확대 및 화사한 카드 디자인) */}
      <div className="relative z-10 w-full max-w-lg my-8 bg-white/90 backdrop-blur-md border-2 border-amber-200/90 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-amber-950/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-amber-900 tracking-wider mb-2.5 uppercase">
              🐰 상상 속 주인공
            </label>
            <input
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              placeholder="예: 햇살 머금은 아기 토끼, 노란 나비"
              required
              className="w-full px-5 py-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-slate-800 text-base placeholder-amber-900/40 focus:outline-none focus:ring-3 focus:ring-amber-400 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-900 tracking-wider mb-2.5 uppercase">
              🌳 모험이 일어날 장소
            </label>
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="예: 따뜻한 언덕, 초록빛 숲속 도서관"
              required
              className="w-full px-5 py-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-slate-800 text-base placeholder-amber-900/40 focus:outline-none focus:ring-3 focus:ring-amber-400 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-4 px-6 rounded-2xl font-bold text-lg text-white bg-linear-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-400 hover:via-orange-400 hover:to-emerald-400 active:scale-[0.98] transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>동화책을 펼치는 중...</span>
              </>
            ) : (
              <>
                <span>☀️ 동화책 열어보기</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 🌿 하단 푸터 */}
      <footer className="relative z-10 mb-4 text-sm font-semibold text-amber-950/70 text-center">
        © Sunny Day Storybook • 함께 읽는 즐거움
      </footer>
    </main>
  );
}