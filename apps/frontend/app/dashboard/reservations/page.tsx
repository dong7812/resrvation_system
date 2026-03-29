'use client';

import { useRef, useState } from 'react';
import { useReservations, useUpdateStatus, useDeleteReservation, useImportReservations } from '@/hooks/useReservations';
import { Card, PageHeader, StatusBadge, Button, Spinner } from '@/components/ui';
import { ReservationModal } from '@/components/dashboard/ReservationModal';
import type { Reservation, ReservationStatus } from '@/lib/types';
import { Download, Trash2, Upload } from 'lucide-react';

const FILTERS: { label: string; value: string }[] = [
  { label: '전체', value: '' },
  { label: '대기', value: 'pending' },
  { label: '승인', value: 'approved' },
  { label: '거절', value: 'rejected' },
];

export default function ReservationsPage() {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: reservations, isLoading } = useReservations(filter || undefined);
  const updateStatus = useUpdateStatus();
  const deleteRes = useDeleteReservation();
  const importMutation = useImportReservations();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importMutation.mutate(file, {
      onSuccess: (result) => {
        setImportResult(result as { imported: number; skipped: number; errors: string[] });
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: () => {
        alert('가져오기 실패. Excel 파일 형식을 확인해주세요.');
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  const handleTemplateDownload = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/reservations/import/template`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'reservation_template.xlsx');
    // JWT 인증이 필요하므로 fetch로 다운로드
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        a.href = URL.createObjectURL(blob);
        a.click();
      });
  };

  return (
    <div className="p-6">
      <PageHeader title="예약 목록" />
      {/* 가져오기 결과 */}
      {importResult && (
        <div className="mb-4 p-4 bg-white border border-gray-100 rounded-xl text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-700">가져오기 완료</span>
            <button onClick={() => setImportResult(null)} className="text-gray-400 hover:text-gray-600 text-xs">닫기</button>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="text-green-600 font-medium">성공 {importResult.imported}건</span>
            {importResult.skipped > 0 && <span className="text-amber-600">건너뜀 {importResult.skipped}건</span>}
          </div>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs text-red-500">
              {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      <Card>
        {/* 필터 + 액션 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filter === value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTemplateDownload}>
              <Download size={12} />
              템플릿
            </Button>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={importMutation.isPending}
            >
              <Upload size={12} />
              {importMutation.isPending ? '가져오는 중...' : 'Excel 가져오기'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>

        {/* 테이블 */}
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['예약자', '행사명', '행사예정일', '시식일', '인원', '상태', '액션'].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-400 font-normal pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservations?.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.phone}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{r.eventName}</td>
                    <td className="py-3 pr-4 text-gray-700">{r.eventDate || '-'}</td>
                    <td className="py-3 pr-4 text-gray-700">{r.tastingDate || '-'}</td>
                    <td className="py-3 pr-4 text-gray-700">{r.guestCount}명</td>
                    <td className="py-3 pr-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {r.status === 'pending' && (
                          <>
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
                          </>
                        )}
                        <Button onClick={() => setSelected(r)}>상세</Button>
                        <button
                          onClick={() => {
                            if (confirm('삭제하시겠습니까?')) deleteRes.mutate(r.id);
                          }}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!reservations?.length && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-gray-400">
                      예약이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && <ReservationModal reservation={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
