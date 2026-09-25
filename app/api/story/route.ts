import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const character = searchParams.get('character') || '아기 토끼';
  const place = searchParams.get('place') || '비밀의 숲';

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY가 설정되어 있지 않습니다.");
    return NextResponse.json(
      { success: false, error: "GEMINI_API_KEY 설정을 확인해 주세요." },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // ✅ 최신 지원 모델인 gemini-3.8-flash 및 gemini-2.5-flash로 업데이트
  const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash'];
  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `You are a professional children's storybook writer and illustrator prompt generator.
Generate a cute short story for children in Korean based on Character: "${character}" and Place: "${place}".
Also provide a detailed English prompt describing the core visual scene for storybook illustration.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              story: {
                type: Type.STRING,
                description: 'Story text in Korean',
              },
              imagePrompt: {
                type: Type.STRING,
                description: 'Detailed illustration prompt in English',
              },
            },
            required: ['story', 'imagePrompt'],
          },
          temperature: 0.7,
        },
      });

      const content = response.text;
      if (!content) {
        throw new Error('Gemini 응답 내용이 비어있습니다.');
      }

      const { story, imagePrompt } = JSON.parse(content);

      // Pollinations.ai 무료 이미지 생성
      const fullPrompt = `${imagePrompt}, sunny warm lighting, soft pastel colors, storybook illustration, children's book style, 8k resolution`;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

      return NextResponse.json({
        success: true,
        data: { character, place, story, imageUrl },
      });
    } catch (error: unknown) {
      console.warn(`⚠️ ${modelName} 모델 호출 실패, 다음 모델로 재시도합니다...`, error);
      lastError = error;
    }
  }

  const errorMessage = lastError instanceof Error ? lastError.message : '동화 생성 도중 오류가 발생했습니다.';
  console.error('❌ 모든 Gemini 모델 호출 최종 실패:', errorMessage);

  return NextResponse.json(
    { 
      success: false, 
      error: `서버 혼잡으로 요청이 지연되었습니다. 잠시 후 다시 시도해 주세요. (${errorMessage})` 
    },
    { status: 503 }
  );
}