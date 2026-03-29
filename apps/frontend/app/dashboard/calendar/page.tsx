'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReservations } from '@/hooks/useReservations';
import { Card, PageHeader, Button, Spinner } from '@/components/ui';
import { ReservationModal } from '@/components/dashboard/ReservationModal';
import type { Reservation } from '@/lib/types';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<Reservation | null>(null);

  const { data: reservations, isLoading } = useReservations();

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  // 42칸 고정 (6주)
  const cells: { d: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ d: prevLastDate - i, current: false });
  for (let d = 1; d <= lastDate; d++) cells.push({ d, current: true });
  while (cells.length < 42) cells.push({ d: cells.length - lastDate - firstDay + 1, current: false });

  const getEvents = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return reservations?.filter(r => r.tastingDate === dateStr || r.eventDate === dateStr) ?? [];
  };

  const todayStr = now.toISOString().slice(0, 10);
  const isToday = (d: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` === todayStr;

  if (isLoading) return <div className="p-6"><Spinner /></div>;

  return (
    <div className="p-6">
      <PageHeader title="예약 캘린더" />
      <Card>
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <p className="text-sm font-medium">{year}년 {month + 1}월</p>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            const events = cell.current ? getEvents(cell.d) : [];
            return (
              <div
                key={i}
                className={`min-h-[72px] rounded-lg p-1.5 border transition-colors ${
                  !cell.current
                    ? 'opacity-30 border-transparent'
                    : isToday(cell.d)
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <p className={`text-xs mb-1 ${
                  isToday(cell.d) ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>
                  {cell.d}
                </p>
                {events.slice(0, 2).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded mb-0.5 truncate transition-opacity hover:opacity-80 ${
                      r.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : r.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
                {events.length > 2 && (
                  <p className="text-[10px] text-gray-400">+{events.length - 2}건</p>
                )}
              </div>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
          {[
            { color: 'bg-amber-100 text-amber-800', label: '대기' },
            { color: 'bg-green-100 text-green-800', label: '승인' },
            { color: 'bg-red-100 text-red-800', label: '거절' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${color}`}>{label}</span>
            </div>
          ))}
          <span className="text-xs text-gray-400 ml-auto">클릭하면 상세 정보</span>
        </div>
      </Card>

      {selected && <ReservationModal reservation={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
