'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface StoryData {
  character: string;
  place: string;
  story: string;
  imageUrl: string;
}

function StoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const character = searchParams.get('character') || '';
  const place = searchParams.get('place') || '';

  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔊 TTS 음성 상태 관리
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!character || !place) {
      router.push('/');
      return;
    }

    const fetchStory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/story?character=${encodeURIComponent(character)}&place=${encodeURIComponent(place)}`);
        const json = await res.json();

        if (json.success) {
          setStoryData(json.data);
        } else {
          setError(json.error || '동화를 불러오는데 실패했습니다.');
        }
      } catch {
        setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [character, place, router]);

  // 🔊 TTS 제어 함수들
  const handlePlayTTS = () => {
    if (!storyData || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('이 브라우저는 음성 읽어주기 기능을 지원하지 않습니다.');
      return;
    }

    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(storyData.story);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.9;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePauseTTS = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStopTTS = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // 🖨️ 인쇄 / PDF 저장 기능
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-between p-4 sm:p-8">
      {/* ☀️ 숲속 햇살 배경 이미지 레이어 (인쇄 시 숨김) */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat scale-105 pointer-events-none z-0 print:hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(254, 243, 199, 0.45), rgba(16, 185, 129, 0.25)), url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920')`,
        }}
      />

      {/* 상단 레이어 오버레이 (인쇄 시 숨김) */}
      <div className="fixed top-0 inset-x-0 h-48 bg-linear-to-b from-amber-100/70 to-transparent pointer-events-none z-0 print:hidden" />

      {/* 🔮 콘텐츠 영역 */}
      <div className="relative z-10 w-full max-w-3xl my-auto py-6 sm:py-10 print:py-0 print:max-w-none">
        
        {/* 상단 내비게이션 바 (인쇄 시 숨김) */}
        <div className="flex items-center justify-between mb-6 px-2 print:hidden">
          <button
            onClick={() => {
              handleStopTTS();
              router.push('/');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-300/80 shadow-md font-bold text-slate-800 hover:bg-amber-100/80 transition cursor-pointer"
          >
            <span>←</span>
            <span>새로운 동화 만들기</span>
          </button>
          
          <div className="px-4 py-2 rounded-full bg-amber-200/80 backdrop-blur-xs font-black text-amber-950 text-sm sm:text-base border border-amber-300/60 shadow-xs">
            ☀️ {character} & {place}
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="w-full bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-10 sm:p-16 text-center shadow-2xl shadow-emerald-950/20">
            <div className="inline-block w-16 h-16 border-4 border-amber-500/30 border-t-amber-600 rounded-full animate-spin mb-6" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
              햇살 아래 마법 동화책을 쓰는 중...
            </h2>
            <p className="text-slate-700 font-bold text-base sm:text-lg">
              주인공 <span className="text-amber-600">[{character}]</span>(이)가 <span className="text-emerald-700">[{place}]</span>에서 벌이는 마법 같은 이야기!
            </p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="w-full bg-white/90 backdrop-blur-xl border border-red-200 rounded-3xl p-8 text-center shadow-2xl">
            <div className="text-5xl mb-4">🍂</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">동화를 불러올 수 없어요</h2>
            <p className="text-red-600 font-medium mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 font-extrabold text-white transition shadow-md"
            >
              첫 화면으로 돌아가기
            </button>
          </div>
        )}

        {/* 동화 완성 상태 */}
        {!loading && !error && storyData && (
          <article className="w-full bg-white/90 backdrop-blur-xl border border-white/90 rounded-3xl p-6 sm:p-12 shadow-2xl shadow-emerald-950/15 transition-all print:shadow-none print:border-none print:bg-transparent print:p-0">
            
            {/* 삽화 영역 */}
            <div className="relative w-full aspect-square sm:aspect-video rounded-2xl overflow-hidden shadow-lg border border-amber-200/60 mb-8 bg-amber-50 print:border-none print:shadow-none print:mb-6">
              <Image
                src={storyData.imageUrl}
                alt={`${storyData.character}의 동화 일러스트`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                unoptimized
              />
            </div>

            {/* 동화 타이틀 헤더 & 버튼 컨트롤 바 */}
            <header className="border-b border-amber-200/80 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:border-b-2 print:border-slate-800 print:mb-6 print:pb-4">
              <div>
                <div className="inline-block px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm mb-2 print:hidden">
                  📖 그림 동화
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight print:text-4xl">
                  {storyData.character}의 {storyData.place} 모험
                </h1>
              </div>

              {/* 버튼 컨트롤 그룹 (TTS 및 PDF 저장 / 인쇄) */}
              <div className="flex flex-wrap items-center gap-2 bg-amber-100/80 p-2 rounded-2xl border border-amber-300/60 shadow-xs self-start sm:self-auto print:hidden">
                
                {/* 🖨️ PDF / 인쇄 버튼 */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-extrabold text-white transition cursor-pointer shadow-sm active:scale-95"
                  title="PDF로 저장하거나 인쇄합니다"
                >
                  <span>🖨️</span>
                  <span>PDF 저장 / 인쇄</span>
                </button>

                {/* 🔊 TTS 버튼 */}
                {!isPlaying ? (
                  <button
                    onClick={handlePlayTTS}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-extrabold text-white transition cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>🔊</span>
                    <span>{isPaused ? '이어듣기' : '동화 읽어주기'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTTS}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-extrabold text-white transition cursor-pointer shadow-sm animate-pulse active:scale-95"
                  >
                    <span>⏸️</span>
                    <span>일시정지</span>
                  </button>
                )}

                {(isPlaying || isPaused) && (
                  <button
                    onClick={handleStopTTS}
                    className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition cursor-pointer active:scale-95"
                    title="음성 정지"
                  >
                    ⏹️
                  </button>
                )}
              </div>
            </header>

            {/* 본문 텍스트 */}
            <section className="prose prose-amber max-w-none">
              <div className="text-xl sm:text-2xl leading-relaxed sm:leading-loose font-medium text-slate-800 whitespace-pre-line tracking-wide print:text-lg print:leading-relaxed">
                {storyData.story}
              </div>
            </section>

            {/* 하단 버튼 액션 (인쇄 시 숨김) */}
            <footer className="mt-10 pt-6 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <p className="text-sm font-bold text-slate-600">
                ☀️ 오늘도 햇살처럼 눈부신 하루 보내세요!
              </p>
              <button
                onClick={() => {
                  handleStopTTS();
                  router.push('/');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-emerald-600 hover:from-amber-400 hover:via-orange-400 hover:to-emerald-500 text-white font-black text-lg shadow-lg shadow-orange-500/20 active:scale-[0.98] transition cursor-pointer"
              >
                ✨ 다른 이야기 만들어보기
              </button>
            </footer>
          </article>
        )}
      </div>

      {/* 🌿 푸터 (인쇄 시 숨김) */}
      <footer className="relative z-10 my-4 text-sm font-bold text-slate-800 bg-white/60 backdrop-blur-xs px-5 py-2 rounded-full shadow-xs print:hidden">
        © Sunny Day Storybook • 함께 읽는 즐거움
      </footer>
    </main>
  );
}

export default function StoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-amber-50 text-slate-800 font-bold text-xl">
        동화책을 가져오는 중...
      </div>
    }>
      <StoryContent />
    </Suspense>
  );
}