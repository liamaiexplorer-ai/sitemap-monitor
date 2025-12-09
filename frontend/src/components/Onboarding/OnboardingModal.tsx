/**
 * 引导弹窗组件.
 */
import React from "react";
import { Modal } from "../UI/Modal";
import OnboardingSteps from "./OnboardingSteps";
import { useOnboardingStore } from "../../stores/onboardingStore";

interface OnboardingModalProps {
  onAddMonitor?: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onAddMonitor,
}) => {
  const { isModalOpen, closeModal, skipOnboarding } = useOnboardingStore();

  const handleComplete = async () => {
    try {
      // 调用后端 API 标记引导完成
      const response = await fetch("/api/users/me/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        closeModal();
      }
    } catch (error) {
      console.error("完成引导失败:", error);
      closeModal();
    }
  };

  const handleSkip = async () => {
    try {
      await fetch("/api/users/me/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("跳过引导失败:", error);
    }
    skipOnboarding();
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={handleSkip}
      title=""
      size="lg"
    >
      <div className="py-6">
        <OnboardingSteps
          onComplete={handleComplete}
          onSkip={handleSkip}
          onAddMonitor={onAddMonitor}
        />
      </div>
    </Modal>
  );
};

export default OnboardingModal;
