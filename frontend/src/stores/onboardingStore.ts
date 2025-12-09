/**
 * 引导状态管理.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OnboardingStep = "welcome" | "add-monitor" | "complete";

interface OnboardingState {
  // 当前步骤
  currentStep: OnboardingStep;
  // 是否显示引导弹窗
  isModalOpen: boolean;
  // 是否已跳过引导
  hasSkipped: boolean;

  // Actions
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  openModal: () => void;
  closeModal: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

const STEPS: OnboardingStep[] = ["welcome", "add-monitor", "complete"];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: "welcome",
      isModalOpen: false,
      hasSkipped: false,

      setStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = STEPS.indexOf(currentStep);
        if (currentIndex < STEPS.length - 1) {
          set({ currentStep: STEPS[currentIndex + 1] });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        const currentIndex = STEPS.indexOf(currentStep);
        if (currentIndex > 0) {
          set({ currentStep: STEPS[currentIndex - 1] });
        }
      },

      openModal: () => set({ isModalOpen: true }),

      closeModal: () => set({ isModalOpen: false }),

      skipOnboarding: () => set({ hasSkipped: true, isModalOpen: false }),

      resetOnboarding: () =>
        set({ currentStep: "welcome", isModalOpen: false, hasSkipped: false }),
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({ hasSkipped: state.hasSkipped }),
    }
  )
);
