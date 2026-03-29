'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, ClipboardList,
  Mail, Users, BarChart2, LogOut,
} from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

const NAV = [
  { href: '/dashboard',            label: '개요',      icon: LayoutDashboard },
  { href: '/dashboard/calendar',   label: '캘린더',    icon: Calendar },
  { href: '/dashboard/reservations', label: '예약 목록', icon: ClipboardList },
  { href: '/dashboard/email',      label: '이메일 파싱', icon: Mail },
  { href: '/dashboard/customers',  label: '고객 관리',  icon: Users },
  { href: '/dashboard/stats',      label: '통계/분석',  icon: BarChart2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useLogout();
  const admin = useAuthStore((s) => s.admin);

  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="w-[220px] shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* 로고 */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">예약 관리 시스템</p>
          <p className="text-xs text-gray-400 mt-0.5">관리자 대쉬보드</p>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 py-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/dashboard' ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors ${
                  active
                    ? 'text-gray-900 font-medium bg-gray-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* 하단 사용자 정보 */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 truncate">{admin?.email ?? '관리자'}</p>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            <LogOut size={12} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
