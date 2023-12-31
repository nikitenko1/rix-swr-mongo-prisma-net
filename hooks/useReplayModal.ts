import { create } from "zustand";

interface ReplayModalState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}
const useReplayModal = create<ReplayModalState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
export default useReplayModal;
