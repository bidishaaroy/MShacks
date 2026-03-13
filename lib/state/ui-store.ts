"use client";

import { create } from "zustand";

interface UIState {
  summaryOpen: boolean;
  setSummaryOpen: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  summaryOpen: true,
  setSummaryOpen: (value) => set({ summaryOpen: value })
}));
