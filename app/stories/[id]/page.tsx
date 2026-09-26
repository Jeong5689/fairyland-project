'use client';

import React, { useRef } from 'react';

interface StoryPageProps {
  params: {
    id: string;
  };
}

export default function StoryDetailPage({ params }: StoryPageProps) {
  // 예시 데이터
  const story = {
    id: params.id,
    title: '별빛 아래 아기 여우의 모험',
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
    content: '옛날 옛적 깊은 숲 속에 아기 여우가 살고 있었어요...',
  };

  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    // 클라이언트 사이드에서만 html2pdf.js 불러오기
    const html2pdf = (await import('html2pdf.js')).default;

    // ✅ opt 객체 전체에 as const를 부여하고 필요한 부분만 타입 추론이 가능하도록 정리
    const opt = {
      margin: 15,
      filename: `${story.title}_부크크출판원고.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 }, // 👈 'jpeg' as const 추가
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' as const },
    };

    html2pdf().set(opt).from(contentRef.current).save();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 상단 액션 버튼 */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition-colors"
        >
          PDF 다운로드
        </button>
      </div>

      {/* PDF 변환 영역 */}
      <div ref={contentRef} className="bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">{story.title}</h1>

        {/* 커버 이미지 영역 */}
        {story.cover_image_url && (
          <div className="mb-8 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.cover_image_url}
              alt={story.title}
              className="rounded-xl max-h-80 object-cover shadow-sm"
            />
          </div>
        )}

        {/* 동화 본문 */}
        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line text-lg">
          {story.content}
        </div>
      </div>
    </div>
  );
}