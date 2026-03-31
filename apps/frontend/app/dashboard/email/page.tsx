'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, PageHeader, Button } from '@/components/ui';
import { useCreateReservation } from '@/hooks/useReservations';
import type { Reservation } from '@/lib/types';

const SAMPLE = `안녕하세요, 케이터링 문의드립니다.

예약자: 신예은
연락처: 010-8765-4321
이메일: yeeun.shin@email.com
행사명: 회사 창립 10주년 기념 파티
행사장소: 여의도 파크원 이벤트홀
행사예정일: 2026년 6월 20일
참여인원: 250명
시식 희망일: 2026년 5월 10일
문의사항: 뷔페 형식으로 진행하고 싶고, 할랄 메뉴가 필요한 분들이 일부 있습니다.`;

const FIELDS: [string, keyof Reservation][] = [
  ['예약자 성명', 'name'],
  ['연락처', 'phone'],
  ['이메일', 'email'],
  ['행사명', 'eventName'],
  ['행사장소', 'venue'],
  ['행사예정일', 'eventDate'],
  ['시식희망일', 'tastingDate'],
  ['참여인원', 'guestCount'],
  ['문의사항', 'note'],
];

export default function EmailPage() {
  const [emailText, setEmailText] = useState('');
  const [parsed, setParsed] = useState<Partial<Reservation> | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const createReservation = useCreateReservation();

  const handleParse = async () => {
    if (!emailText.trim()) return;
    setIsParsing(true);
    setParseError('');
    setParsed(null);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/email/parse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: emailText }),
        },
      );
      const result = await res.json();

      if (result.isReservation) {
        setParsed(result);
      } else {
        setParseError('예약 관련 이메일이 아닙니다.');
      }
    } catch {
      setParseError('파싱 실패. 이메일 내용을 확인해주세요.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAdd = () => {
    if (!parsed) return;
    createReservation.mutate(parsed as any, {
      onSuccess: () => {
        setParsed(null);
        setEmailText('');
        alert('예약 목록에 추가되었습니다!');
      },
    });
  };

  return (
    <div className="p-6">
      <PageHeader title="이메일 파싱" />
      <div className="grid grid-cols-2 gap-4">
        {/* 입력 */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">이메일 원문 입력</p>
            <button
              onClick={() => setEmailText(SAMPLE)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              샘플 불러오기
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-2">예약 문의 이메일을 붙여넣기 하세요</p>
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            className="w-full h-48 text-xs font-mono p-3 border border-gray-100 rounded-lg bg-gray-50 resize-none outline-none focus:border-gray-300 transition-colors text-gray-700"
            placeholder="이메일 내용을 붙여넣기..."
          />
          <div className="flex gap-2 mt-3">
            <Button
              variant="primary"
              onClick={handleParse}
              disabled={isParsing || !emailText.trim()}
              className="gap-1.5"
            >
              {isParsing ? (
                <><Loader2 size={12} className="animate-spin" /> 분석 중...</>
              ) : (
                <><Sparkles size={12} /> AI로 파싱하기</>
              )}
            </Button>
            <Button onClick={() => { setEmailText(''); setParsed(null); setParseError(''); }}>
              초기화
            </Button>
          </div>
        </Card>

        {/* 결과 */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">파싱 결과</p>
            {parsed && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">
                파싱 완료
              </span>
            )}
          </div>

          {!parsed && !parseError && (
            <p className="text-sm text-gray-400 py-8 text-center">
              이메일을 입력하고 파싱하면 결과가 표시됩니다
            </p>
          )}

          {parseError && (
            <p className="text-sm text-red-600 py-4">{parseError}</p>
          )}

          {parsed && (
            <>
              <div className="divide-y divide-gray-50">
                {FIELDS.map(([label, key]) => (
                  <div key={key} className="flex gap-4 py-2 text-sm">
                    <span className="w-24 shrink-0 text-xs text-gray-400 pt-0.5">{label}</span>
                    <span className="text-gray-900 font-medium text-sm">
                      {key === 'guestCount'
                        ? `${parsed[key] ?? 0}명`
                        : (parsed[key] as string) || '-'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50">
                <Button
                  variant="approve"
                  onClick={handleAdd}
                  disabled={createReservation.isPending}
                  className="w-full justify-center"
                >
                  {createReservation.isPending ? '추가 중...' : '예약 목록에 추가'}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* 안내 */}
      <Card className="mt-4 bg-blue-50 border-blue-100">
        <p className="text-xs font-medium text-blue-800 mb-1">자동 이메일 파싱 안내</p>
        <p className="text-xs text-blue-600">
          백엔드 서버가 실행 중이면 5분마다 IMAP으로 새 이메일을 자동 수신하여 파싱합니다.
          이 페이지는 수동으로 이메일 원문을 붙여넣어 즉시 파싱할 때 사용하세요.
        </p>
      </Card>
    </div>
  );
}
