'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '@/app/actions/auth';
import type { SessionUser } from '@/lib/session';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.refresh();
    router.push('/page-1');
  };

  const navItems = [
    { href: '/page-1', label: '행사 목록' },
    { href: '/page-3', label: '내 신청 내역' },
    ...(user?.role === 'admin' ? [{ href: '/page-4', label: '관리자' }] : []),
  ];

  return (
    <nav className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between">
      <Link href="/page-1" className="text-xl font-bold tracking-tight">
        행사 플랫폼
      </Link>
      <div className="flex gap-6 items-center">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium transition-colors hover:text-indigo-200 ${
              pathname?.startsWith(item.href)
                ? 'text-white border-b-2 border-white pb-0.5'
                : 'text-indigo-200'
            }`}
          >
            {item.label}
          </Link>
        ))}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-indigo-200 text-sm">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            href="/page-2/page-2"
            className="bg-white text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-indigo-50 transition-colors"
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
