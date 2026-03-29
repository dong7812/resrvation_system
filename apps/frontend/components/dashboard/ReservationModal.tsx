'use client';

import { X } from 'lucide-react';
import type { Reservation } from '@/lib/types';
import { StatusBadge, Button } from '@/components/ui';
import { useUpdateStatus } from '@/hooks/useReservations';

const FIELDS: [string, keyof Reservation][] = [
  ['행사명', 'eventName'],
  ['행사장소', 'venue'],
  ['행사예정일', 'eventDate'],
  ['시식희망일', 'tastingDate'],
  ['참여인원', 'guestCount'],
  ['연락처', 'phone'],
  ['이메일', 'email'],
  ['문의사항', 'note'],
];

export function ReservationModal({
  reservation,
  onClose,
}: {
  reservation: Reservation;
  onClose: () => void;
}) {
  const updateStatus = useUpdateStatus();

  const handleStatus = (status: 'approved' | 'rejected') => {
    updateStatus.mutate({ id: reservation.id, status }, { onSuccess: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl border border-gray-100 p-6 w-full max-w-md relative shadow-sm">
        {/* 닫기 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={16} />
        </button>

        {/* 헤더 */}
        <div className="mb-5">
          <p className="text-base font-medium text-gray-900">{reservation.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={reservation.status} />
            <span className="text-xs text-gray-400">
              {new Date(reservation.createdAt).toLocaleDateString('ko-KR')} 접수
            </span>
          </div>
        </div>

        {/* 필드 목록 */}
        <div className="space-y-0 divide-y divide-gray-50">
          {FIELDS.map(([label, key]) => (
            <div key={key} className="flex gap-4 py-2.5 text-sm">
              <span className="w-24 shrink-0 text-gray-400 text-xs pt-0.5">{label}</span>
              <span className="text-gray-900 font-medium">
                {key === 'guestCount'
                  ? `${reservation[key]}명`
                  : (reservation[key] as string) || '-'}
              </span>
            </div>
          ))}
        </div>

        {/* 액션 버튼 */}
        {reservation.status === 'pending' && (
          <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
            <Button
              variant="approve"
              onClick={() => handleStatus('approved')}
              disabled={updateStatus.isPending}
              className="flex-1 justify-center"
            >
              승인
            </Button>
            <Button
              variant="reject"
              onClick={() => handleStatus('rejected')}
              disabled={updateStatus.isPending}
              className="flex-1 justify-center"
            >
              거절
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
