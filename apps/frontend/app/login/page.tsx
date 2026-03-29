'use client';

import { useState } from 'react';
import { useLogin } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm shadow-sm">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-gray-900">예약 관리 시스템</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {login.isError && (
            <p className="text-sm text-red-600">
              이메일 또는 비밀번호가 올바르지 않습니다.
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {login.isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center">
          .env에서 초기 관리자 계정 설정
        </p>
      </div>
    </div>
  );
}
