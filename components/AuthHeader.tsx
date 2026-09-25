'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function AuthHeader() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="w-full py-4 px-6 bg-amber-100/60 backdrop-blur border-b border-amber-200/60 flex justify-between items-center print:hidden">
      <Link href="/" className="text-xl font-bold text-amber-900">
        🌲 햇살 숲속 동화
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-amber-800">{user.email}님</span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-medium transition"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-amber-900 font-medium hover:underline">
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium shadow-sm transition"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}