'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-amber-50/80 rounded-2xl border border-amber-200 shadow-md">
      <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">로그인</h2>
      {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md transition"
        >
          로그인
        </button>
      </form>
    </div>
  );
}