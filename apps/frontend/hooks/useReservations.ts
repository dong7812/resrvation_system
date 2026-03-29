import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiClient } from '@/lib/api';
import type { Reservation, Stats } from '@/lib/types';

// ── 예약 목록 조회
export const useReservations = (status?: string) =>
  useQuery<Reservation[]>({
    queryKey: ['reservations', status],
    queryFn: () => api.get<Reservation[]>(`/reservations${status ? `?status=${status}` : ''}`),
  });

// ── 예약 단건 조회
export const useReservation = (id: number) =>
  useQuery<Reservation>({
    queryKey: ['reservations', id],
    queryFn: () => api.get<Reservation>(`/reservations/${id}`),
    enabled: !!id,
  });

// ── 통계
export const useStats = () =>
  useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => api.get<Stats>('/reservations/stats'),
    refetchInterval: 30_000, // 30초마다 자동 갱신
  });

// ── 상태 변경 (승인/거절)
export const useUpdateStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/reservations/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

// ── 예약 생성
export const useCreateReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Reservation>) => api.post('/reservations', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  });
};

// ── 예약 삭제
export const useDeleteReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/reservations/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

// ── Excel 가져오기
export const useImportReservations = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient
        .post<{ imported: number; skipped: number; errors: string[] }>('/reservations/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservations'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

// ── 이메일 수동 폴링
export const useFetchEmails = () =>
  useMutation({
    mutationFn: () => api.post('/email/fetch'),
  });

// ── AI 파싱 (프론트에서 직접 호출용 — 백엔드 프록시 필요 시)
export const useParseEmail = () =>
  useMutation({
    mutationFn: (emailText: string) =>
      api.post<{ parsed: Partial<Reservation>; isReservation: boolean }>(
        '/email/parse',
        { text: emailText },
      ),
  });
