import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Gemini API 클라이언트 초기화
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
      return NextResponse.json(
        { error: '주제를 2자 이상 입력해 주세요.' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: '서버에 GEMINI_API_KEY가 설정되지 않았증니다. 환경 변수를 확인해 주세요.' },
        { status: 500 }
      );
    }

    const trimmedTopic = topic.trim();

    // 1. Gemini API를 통한 동화 텍스트 생성
    const prompt = `
너는 어린이들에게 흥미롭고 따뜻한 교훈을 주는 동화 작가야.
아래 주어진 주제로 따뜻하고 창의적인 어린이 동화를 작성해 줘.

[주제]: ${trimmedTopic}

[작성 규칙]:
1. 어린이들이 이해하기 쉬운 친근하고 예쁜 어조(~했어요, ~있었답니다)를 사용할 것.
2. 이야기 전체 구성은 제목과 본문으로 나누어 응답할 것.
3. 첫 번째 줄에는 동화의 제목만 적어줄 것 (예: 제목: 숲속 도서관의 비밀).
4. 제목 다음 줄부터는 동화 본문을 재미있게 작성할 것.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const generatedText = response.text || '';

    // 2. 결과 텍스트 파싱 (제목 / 본문)
    const lines = generatedText.trim().split('\n');
    let title = `${trimmedTopic} 이야기`;
    let content = generatedText;

    if (lines.length > 0 && lines[0].startsWith('제목:')) {
      title = lines[0].replace('제목:', '').trim();
      content = lines.slice(1).join('\n').trim();
    } else if (lines.length > 0) {
      title = lines[0].replace(/^#+\s*/, '').trim();
      content = lines.slice(1).join('\n').trim();
    }

    // 3. Pollinations.ai를 활용한 동화 표지 이미지 URL 생성
    // (어린이 동화 스타일의 일러스트 프롬프트 구성)
    const imagePrompt = encodeURIComponent(
      `children's storybook cover illustration, cute fairytale style, soft colors, story topic: ${trimmedTopic}`
    );
    // width=800, height=600, nologo=true 옵션 적용
    const coverImageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=800&height=600&nologo=true`;

    return NextResponse.json({
      title,
      content,
      cover_image_url: coverImageUrl,
    });
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);

    let status = 500;
    let errorMessage = '동화 생성 중 오류가 발생했습니다.';

    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
        status = 429;
        errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status });
  }
}