'use client';

import { useReservations, useStats } from '@/hooks/useReservations';
import { Card, PageHeader, MetricCard, Spinner } from '@/components/ui';

function BarRow({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm mb-3">
      <span className="w-20 text-right text-xs text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-gray-500 shrink-0">{count}건</span>
    </div>
  );
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-gray-500">{value}</span>
      <div className="w-8 bg-gray-100 rounded-sm overflow-hidden" style={{ height: '80px' }}>
        <div
          className="w-full bg-blue-400 rounded-sm transition-all duration-500"
          style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

export default function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: reservations } = useReservations();

  // 행사 유형 분류 (키워드 기반)
  const eventTypes = [
    { label: '결혼/약혼', keywords: ['결혼', '약혼', '피로연', '웨딩'], color: 'bg-blue-400' },
    { label: '기업행사', keywords: ['기업', '창립', '론칭', '회사', '비즈니스'], color: 'bg-purple-400' },
    { label: '생일/파티', keywords: ['생일', '파티', '축하'], color: 'bg-amber-400' },
    { label: '돌잔치/칠순', keywords: ['돌잔치', '칠순', '환갑', '잔치'], color: 'bg-green-400' },
    { label: '기타', keywords: [], color: 'bg-gray-300' },
  ];

  const categorized = eventTypes.map(({ label, keywords, color }) => {
    const count = keywords.length === 0
      ? (reservations?.filter(r => !eventTypes.slice(0, -1).some(et => et.keywords.some(k => r.eventName.includes(k)))).length ?? 0)
      : (reservations?.filter(r => keywords.some(k => r.eventName.includes(k))).length ?? 0);
    return { label, count, color };
  });
  const maxCat = Math.max(...categorized.map(c => c.count), 1);

  // 월별 예약 수 (최근 6개월)
  const now = new Date();
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = `${d.getMonth() + 1}월`;
    const count = reservations?.filter(r => {
      const rd = new Date(r.createdAt);
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
    }).length ?? 0;
    return { label, count };
  });
  const maxMonthly = Math.max(...monthly.map(m => m.count), 1);

  if (statsLoading) return <div className="p-6"><Spinner /></div>;

  return (
    <div className="p-6">
      <PageHeader title="통계/분석" />

      {/* 핵심 지표 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <MetricCard label="전체 예약" value={stats?.total ?? 0} sub="누적" />
        <MetricCard label="승인율" value={`${stats?.approvalRate ?? 0}%`} sub="이번 달" valueColor="text-green-700" />
        <MetricCard label="평균 인원" value={
          reservations?.length
            ? Math.round(reservations.reduce((s, r) => s + (r.guestCount || 0), 0) / reservations.length)
            : 0
        } sub="명/행사" valueColor="text-blue-700" />
        <MetricCard label="총 고객" value={stats?.uniqueCustomers ?? 0} sub="이메일 기준" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 행사 유형 분포 */}
        <Card>
          <p className="text-sm font-medium mb-4">행사 유형 분포</p>
          {categorized.map(({ label, count, color }) => (
            <BarRow key={label} label={label} count={count} max={maxCat} color={color} />
          ))}
        </Card>

        {/* 월별 예약 추이 */}
        <Card>
          <p className="text-sm font-medium mb-4">월별 예약 추이 (최근 6개월)</p>
          <div className="flex items-end justify-around h-24 gap-2">
            {monthly.map(({ label, count }) => (
              <MiniBar key={label} label={label} value={count} max={maxMonthly} />
            ))}
          </div>
        </Card>

        {/* 상태 분포 */}
        <Card>
          <p className="text-sm font-medium mb-4">예약 상태 분포</p>
          {[
            { label: '승인', count: stats?.approved ?? 0, color: 'bg-green-400' },
            { label: '대기', count: stats?.pending ?? 0, color: 'bg-amber-400' },
            { label: '거절', count: stats?.rejected ?? 0, color: 'bg-red-400' },
          ].map(({ label, count, color }) => (
            <BarRow key={label} label={label} count={count} max={stats?.total ?? 1} color={color} />
          ))}
        </Card>

        {/* 최근 예약 인원 TOP 5 */}
        <Card>
          <p className="text-sm font-medium mb-4">대규모 행사 TOP 5</p>
          <div className="divide-y divide-gray-50">
            {[...(reservations ?? [])]
              .sort((a, b) => b.guestCount - a.guestCount)
              .slice(0, 5)
              .map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.eventName}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-700">{r.guestCount}명</span>
                </div>
              ))}
            {!reservations?.length && (
              <p className="py-8 text-center text-sm text-gray-400">데이터 없음</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
