'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStories, Story } from '@/lib/stories';

export default function MyStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const data = await getStories();
        setStories(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('동화 목록을 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center text-slate-500 py-20">
        📚 내 서재를 불러오는 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center py-20">
        <p className="text-red-500 mb-4">⚠️ {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📚 내 동화 서재</h1>
          <p className="text-slate-500 text-sm mt-1">
            직접 만든 동화를 확인하고 부크크 출판용 PDF로 소장해 보세요.
          </p>
        </div>
        <Link
          href="/create"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
        >
          ✨ 새 동화 만들기
        </Link>
      </div>

      {/* 동화가 없는 경우 */}
      {stories.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center">
          <p className="text-slate-600 mb-4">아직 작성된 동화가 없습니다.</p>
          <Link
            href="/create"
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            첫 번째 동화 만들기
          </Link>
        </div>
      ) : (
        /* 동화 카드 그리드 목록 */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.id}`}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col"
            >
              {/* 표지 이미지 상단 영역 */}
              <div className="relative w-full h-48 bg-slate-100 overflow-hidden shrink-0">
                {story.cover_image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={story.cover_image_url}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                    <span className="text-3xl mb-1">📖</span>
                    <span className="text-xs">표지 이미지 없음</span>
                  </div>
                )}
              </div>

              {/* 카드 하단 정보 영역 */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
                    {story.title}
                  </h2>
                  <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed mb-4">
                    {story.content}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <span>{new Date(story.created_at).toLocaleDateString('ko-KR')}</span>
                  <span className="text-blue-600 font-medium group-hover:underline">
                    상세보기 →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}