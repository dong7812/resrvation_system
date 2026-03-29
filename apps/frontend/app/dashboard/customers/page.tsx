'use client';

import { useState } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { Card, PageHeader, StatusBadge, Button, Spinner } from '@/components/ui';
import { ReservationModal } from '@/components/dashboard/ReservationModal';
import type { Reservation } from '@/lib/types';

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

export default function CustomersPage() {
  const [selected, setSelected] = useState<Reservation | null>(null);
  const { data: reservations, isLoading } = useReservations();

  // 이메일 기준으로 중복 제거 — 가장 최근 예약을 대표로
  const customers = Object.values(
    (reservations ?? []).reduce<Record<string, Reservation & { count: number }>>((acc, r) => {
      if (!acc[r.email]) {
        acc[r.email] = { ...r, count: 1 };
      } else {
        acc[r.email].count += 1;
      }
      return acc;
    }, {}),
  );

  if (isLoading) return <div className="p-6"><Spinner /></div>;

  return (
    <div className="p-6">
      <PageHeader title="고객 관리" />
      <Card>
        <p className="text-xs text-gray-400 mb-4">총 {customers.length}명의 고객</p>
        <div className="divide-y divide-gray-50">
          {customers.map((c, i) => {
            const initials = c.name.slice(0, 2);
            const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const allReservations = reservations?.filter(r => r.email === c.email) ?? [];
            return (
              <div key={c.email} className="flex items-center gap-3 py-3">
                {/* 아바타 */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${colorClass}`}>
                  {initials}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.email} · {c.phone}</p>
                </div>

                {/* 예약 수 + 최신 상태 */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500 mb-1">예약 {(c as any).count}건</p>
                  <StatusBadge status={c.status} />
                </div>

                {/* 상세 버튼 */}
                <Button onClick={() => setSelected(c)}>상세</Button>
              </div>
            );
          })}

          {customers.length === 0 && (
            <p className="py-12 text-center text-sm text-gray-400">고객이 없습니다</p>
          )}
        </div>
      </Card>

      {selected && <ReservationModal reservation={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
