import { clsx } from 'clsx';
import type { ReservationStatus } from '@/lib/types';

// ── Badge
const STATUS_MAP: Record<ReservationStatus, string> = {
  pending:  'bg-amber-50  text-amber-800  border-amber-200',
  approved: 'bg-green-50  text-green-800  border-green-200',
  rejected: 'bg-red-50    text-red-800    border-red-200',
};
const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: '대기', approved: '승인', rejected: '거절',
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={clsx('inline-block text-xs px-2 py-0.5 rounded border', STATUS_MAP[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ── Button
type BtnVariant = 'default' | 'approve' | 'reject' | 'primary';
const BTN_MAP: Record<BtnVariant, string> = {
  default:  'border-gray-200 text-gray-700 hover:bg-gray-50',
  approve:  'border-green-300 text-green-700 hover:bg-green-50',
  reject:   'border-red-300  text-red-700  hover:bg-red-50',
  primary:  'border-gray-900 bg-gray-900 text-white hover:bg-gray-700',
};

export function Button({
  children, variant = 'default', onClick, disabled, className,
}: {
  children: React.ReactNode;
  variant?: BtnVariant;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-lg transition-colors disabled:opacity-50',
        BTN_MAP[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

// ── Card
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white border border-gray-100 rounded-xl p-5', className)}>
      {children}
    </div>
  );
}

// ── MetricCard
export function MetricCard({
  label, value, sub, valueColor,
}: {
  label: string; value: string | number; sub?: string; valueColor?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={clsx('text-2xl font-medium', valueColor ?? 'text-gray-900')}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── PageHeader
export function PageHeader({ title }: { title: string }) {
  return <h1 className="text-lg font-medium text-gray-900 mb-5">{title}</h1>;
}

// ── Spinner
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
    </div>
  );
}
