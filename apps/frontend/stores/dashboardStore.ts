import { create } from 'zustand';

interface DashboardStore {
  selectedReservationId: number | null;
  calendarMonth: { year: number; month: number };
  setSelectedId: (id: number | null) => void;
  setCalendarMonth: (year: number, month: number) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedReservationId: null,
  calendarMonth: {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  },
  setSelectedId: (id) => set({ selectedReservationId: id }),
  setCalendarMonth: (year, month) => set({ calendarMonth: { year, month } }),
}));
