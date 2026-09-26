import { createClient } from '@/lib/supabase/client';

export interface StoryInput {
  title: string;
  content: string;
  summary?: string;
  cover_image_url?: string;
}

export interface Story {
  id: string;
  user_id: string;
  title: string;
  content: string;
  summary: string | null;
  cover_image_url: string | null;
  created_at: string;
}

/**
 * AI가 생성한 동화를 Supabase stories 테이블에 저장하는 함수
 */
export async function saveStory({ title, content, summary, cover_image_url }: StoryInput) {
  const supabase = createClient();

  // 1. 현재 로그인한 사용자 정보 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  // 2. stories 테이블에 insert 데이터 전송
  const { data, error } = await supabase
    .from('stories')
    .insert([
      {
        user_id: user.id,
        title,
        content,
        summary: summary || null,
        cover_image_url: cover_image_url || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('동화 저장 중 오류 발생:', error.message);
    throw new Error('동화를 저장하는 데 실패했습니다.');
  }

  return data;
}

/**
 * 로그인한 유저의 동화 목록을 가져오는 함수 (최신순)
 */
export async function getStories(): Promise<Story[]> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('동화 목록 불러오기 오류:', error.message);
    throw new Error('동화 목록을 불러오는 데 실패했습니다.');
  }

  return data || [];
}

// lib/stories.ts 파일에 추가

/**
 * 특정 동화 ID로 동화 상세 정보를 가져오는 함수
 */
export async function getStoryById(id: string): Promise<Story | null> {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('로그인이 필요합니다.');
  }

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('동화 상세 조회 오류:', error.message);
    return null;
  }

  return data;
}