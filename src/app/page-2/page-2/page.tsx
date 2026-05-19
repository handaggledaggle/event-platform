'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { login, register } from '@/app/actions/auth';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (tab === 'register') {
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }
      const result = await register({ name, email, password });
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
      }
    } else {
      const result = await login({ email, password });
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
        router.refresh();
      }
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">{tab === 'login' ? '👋' : '✅'}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {tab === 'login' ? '로그인 완료!' : '가입이 완료되었습니다!'}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {tab === 'login'
              ? '환영합니다.'
              : '로그인하여 행사를 신청해 보세요.'}
          </p>
          <a
            href="/page-1"
            className="inline-block bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            행사 목록 보기
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError('');
                  setDone(false);
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === t
                    ? 'bg-white shadow-sm text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'login' ? '로그인' : '회원 가입'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="홍길동"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@university.ac.kr"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="8자 이상"
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {tab === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호를 다시 입력"
                  required
                  minLength={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mt-2 disabled:opacity-60"
            >
              {loading
                ? '처리 중...'
                : tab === 'login'
                  ? '로그인'
                  : '가입하기'}
            </button>
          </form>

          {tab === 'login' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              아직 계정이 없으신가요?{' '}
              <button
                onClick={() => setTab('register')}
                className="text-indigo-600 font-medium hover:underline"
              >
                회원 가입
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
