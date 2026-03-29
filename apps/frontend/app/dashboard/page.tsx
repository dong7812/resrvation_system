'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useReservations, useStats, useUpdateStatus, useFetchEmails } from '@/hooks/useReservations';
import { MetricCard, Card, PageHeader, StatusBadge, Button, Spinner } from '@/components/ui';
import { ReservationModal } from '@/components/dashboard/ReservationModal';
import type { Reservation } from '@/lib/types';

export default function DashboardPage() {
  const [selected, setSelected] = useState<Reservation | null>(null);
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: reservations, isLoading } = useReservations();
  const updateStatus = useUpdateStatus();
  const fetchEmails = useFetchEmails();

  const recent = reservations?.slice(0, 5) ?? [];

  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=일 ~ 6=토
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
  const isThisWeek = (dateStr?: string | null) => {
    if (!dateStr) return false;
    return dateStr >= toDateStr(weekStart) && dateStr <= toDateStr(weekEnd);
  };

  const weekList = reservations?.filter(
    (r) => isThisWeek(r.eventDate) || isThisWeek(r.tastingDate),
  ).sort((a, b) => {
    const aDate = a.eventDate ?? a.tastingDate ?? '';
    const bDate = b.eventDate ?? b.tastingDate ?? '';
    return aDate.localeCompare(bDate);
  }) ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <PageHeader title="개요" />
        <Button
          onClick={() => fetchEmails.mutate()}
          disabled={fetchEmails.isPending}
          className="gap-1.5"
        >
          <RefreshCw size={12} className={fetchEmails.isPending ? 'animate-spin' : ''} />
          이메일 새로고침
        </Button>
      </div>

      {/* 지표 카드 */}
      {statsLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <MetricCard label="승인 대기" value={stats?.pending ?? 0} sub="처리 필요" valueColor="text-amber-600" />
          <MetricCard label="이번 달 승인" value={stats?.approved ?? 0} sub={`승인율 ${stats?.approvalRate ?? 0}%`} valueColor="text-green-700" />
          <MetricCard label="이번 주 일정" value={weekList.length} sub="시식/행사 포함" valueColor="text-blue-700" />
          <MetricCard label="총 고객" value={stats?.uniqueCustomers ?? 0} sub="누적 고객 수" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* 최근 예약 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium">최근 예약 요청</p>
            {(stats?.pending ?? 0) > 0 && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                신규 {stats?.pending}건
              </span>
            )}
          </div>
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.eventName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    <Button onClick={() => setSelected(r)}>상세</Button>
                  </div>
                </div>
              ))}
              {recent.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">예약이 없습니다</p>
              )}
            </div>
          )}
        </Card>

        {/* 이번 주 일정 */}
        <Card>
          <p className="text-sm font-medium mb-4">
            이번 주 일정
            <span className="text-xs text-gray-400 font-normal ml-2">
              {toDateStr(weekStart)} ~ {toDateStr(weekEnd)}
            </span>
          </p>
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="divide-y divide-gray-50">
              {weekList.map((r) => {
                const isTasting = isThisWeek(r.tastingDate);
                const isEvent = isThisWeek(r.eventDate);
                return (
                  <div key={`${r.id}-${isTasting ? 't' : 'e'}`} className="py-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {r.name} — {r.eventName}
                      </p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[
                        isTasting && `시식 ${r.tastingDate}`,
                        isEvent && `행사 ${r.eventDate}`,
                      ].filter(Boolean).join(' / ')}
                      {' · '}{r.guestCount}명 · {r.venue}
                    </p>
                  </div>
                );
              })}
              {weekList.length === 0 && (
                <p className="text-sm text-gray-400 py-4 text-center">
                  이번 주 예정된 일정이 없습니다
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* 빠른 승인/거절 (대기 목록) */}
      {(reservations?.filter((r) => r.status === 'pending').length ?? 0) > 0 && (
        <Card className="mt-4">
          <p className="text-sm font-medium mb-4">빠른 처리 — 대기 중인 예약</p>
          <div className="divide-y divide-gray-50">
            {reservations
              ?.filter((r) => r.status === 'pending')
              .map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.eventName} · {r.eventDate} · {r.guestCount}명</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="approve"
                      onClick={() => updateStatus.mutate({ id: r.id, status: 'approved' })}
                      disabled={updateStatus.isPending}
                    >
                      승인
                    </Button>
                    <Button
                      variant="reject"
                      onClick={() => updateStatus.mutate({ id: r.id, status: 'rejected' })}
                      disabled={updateStatus.isPending}
                    >
                      거절
                    </Button>
                    <Button onClick={() => setSelected(r)}>상세</Button>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {selected && <ReservationModal reservation={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
