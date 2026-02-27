import { create } from "zustand";

type RightPanelTab = "tutor" | "assess" | "recall";

interface TopicDetailState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelTab: RightPanelTab;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  openRightPanelTo: (tab: RightPanelTab) => void;
}

export const useTopicDetailStore = create<TopicDetailState>((set) => ({
  leftPanelOpen: true,
  rightPanelOpen: false,
  rightPanelTab: "tutor",
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  openRightPanelTo: (tab) => set({ rightPanelOpen: true, rightPanelTab: tab }),
}));
