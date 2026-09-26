'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // 현재 로그인된 유저 정보 가져오기
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // 로그인/로그아웃 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-slate-100 border-b">
      <Link href="/" className="text-xl font-bold text-slate-800 hover:text-blue-600">
        ☀️ Sunny Forest
      </Link>
      
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm font-medium text-slate-600">{user.email}님</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}