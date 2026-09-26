'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveStory } from '@/lib/stories';

interface GeneratedStory {
  title: string;
  content: string;
  cover_image_url?: string;
}

export default function CreateStoryPage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // 동화 및 표지 이미지 생성 핸들러
  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      alert('동화 주제를 입력해 주세요.');
      return;
    }

    if (trimmedTopic.length < 2) {
      alert('주제를 2자 이상 입력해 주세요.');
      return;
    }

    setIsGenerating(true);
    setGeneratedStory(null);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: trimmedTopic }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `동화 생성 중 오류가 발생했습니다. (상태 코드: ${response.status})`);
      }

      setGeneratedStory({
        title: data.title || `${trimmedTopic} 이야기`,
        content: data.content,
        cover_image_url: data.cover_image_url,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'TypeError') {
          alert('네트워크 연결 상태를 확인해 주세요.');
        } else {
          alert(err.message);
        }
      } else {
        alert('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Supabase DB 저장 핸들러 (표지 이미지 URL 포함)
  const handleSave = async () => {
    if (!generatedStory) return;

    setIsSaving(true);
    try {
      await saveStory({
        title: generatedStory.title,
        content: generatedStory.content,
        cover_image_url: generatedStory.cover_image_url,
      });

      alert('동화가 성공적으로 저장되었습니다!');
      router.push('/my-stories'); // 저장 완료 후 내 서재 페이지로 이동
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">✨ 새로운 AI 동화 만들기</h1>

      {/* 주제 입력 폼 */}
      <form onSubmit={handleGenerateStory} className="flex gap-2 mb-8">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="예: 숲속 도서관의 비밀, 용감한 아기 토끼"
          className="flex-1 border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
          disabled={isGenerating}
          required
        />
        <button
          type="submit"
          disabled={isGenerating}
          className="bg-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 transition shrink-0"
        >
          {isGenerating ? 'AI가 동화 작성 중...' : '동화 생성'}
        </button>
      </form>

      {/* 생성 완료된 동화 및 표지 이미지 미리보기 카드 */}
      {generatedStory && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-slate-800 text-center">
            {generatedStory.title}
          </h2>

          {/* 표지 이미지 미리보기 */}
          {generatedStory.cover_image_url && (
            <div className="mb-6 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedStory.cover_image_url}
                alt={generatedStory.title}
                className="rounded-xl max-h-72 w-full object-cover shadow-sm border border-slate-100"
              />
            </div>
          )}

          {/* 동화 본문 */}
          <p className="text-slate-700 whitespace-pre-line leading-relaxed mb-6 font-serif text-lg">
            {generatedStory.content}
          </p>

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-slate-300 transition shadow-sm"
          >
            {isSaving ? 'Supabase에 저장 중...' : '내 서재에 저장하기'}
          </button>
        </div>
      )}
    </div>
  );
}