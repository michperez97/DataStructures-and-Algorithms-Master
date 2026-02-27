import { create } from "zustand";

interface CourseState {
  activeCourseId: string | null;
  setActiveCourseId: (id: string | null) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  activeCourseId: null,
  setActiveCourseId: (id) => set({ activeCourseId: id }),
}));
