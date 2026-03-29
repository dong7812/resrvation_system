export type ReservationStatus = 'pending' | 'approved' | 'rejected';

export interface Reservation {
  id: number;
  name: string;
  phone: string;
  email: string;
  eventName: string;
  venue: string;
  eventDate: string;
  tastingDate: string;
  guestCount: number;
  note: string;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  uniqueCustomers: number;
  approvalRate: number;
}

export interface Admin {
  id: number;
  email: string;
  role: string;
}
