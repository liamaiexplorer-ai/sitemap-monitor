/**
 * 引导步骤组件.
 */
import React from "react";
import { useOnboardingStore, OnboardingStep } from "../../stores/onboardingStore";
import { Button } from "../UI/Button";

interface StepConfig {
  title: string;
  description: string;
  icon: string;
}

const STEP_CONFIGS: Record<OnboardingStep, StepConfig> = {
  welcome: {
    title: "欢迎使用 Sitemap Monitor",
    description:
      "Sitemap Monitor 帮助您监控网站 Sitemap 的变更，当有新页面添加或旧页面删除时，及时通知您。让我们开始设置您的第一个监控任务。",
    icon: "👋",
  },
  "add-monitor": {
    title: "添加第一个监控",
    description:
      "输入您要监控的 Sitemap URL，系统会定期检查该 Sitemap 的变更。您可以设置检查间隔（最短 15 分钟）。",
    icon: "📡",
  },
  complete: {
    title: "设置完成",
    description:
      "太棒了！您已经完成了基本设置。现在可以开始使用 Sitemap Monitor 了。如有问题，可以随时查看帮助文档。",
    icon: "🎉",
  },
};

interface OnboardingStepsProps {
  onComplete?: () => void;
  onSkip?: () => void;
  onAddMonitor?: () => void;
}

const OnboardingSteps: React.FC<OnboardingStepsProps> = ({
  onComplete,
  onSkip,
  onAddMonitor,
}) => {
  const { currentStep, nextStep, prevStep, setStep } = useOnboardingStore();
  const stepConfig = STEP_CONFIGS[currentStep];

  const steps: OnboardingStep[] = ["welcome", "add-monitor", "complete"];
  const currentIndex = steps.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;

  const handleNext = () => {
    if (currentStep === "add-monitor" && onAddMonitor) {
      onAddMonitor();
    } else if (isLastStep && onComplete) {
      onComplete();
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 步骤指示器 */}
      <div className="flex justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => setStep(step)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index <= currentIndex
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {index + 1}
            </button>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-1 ${
                  index < currentIndex ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 步骤内容 */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{stepConfig.icon}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{stepConfig.title}</h2>
        <p className="text-gray-600 leading-relaxed">{stepConfig.description}</p>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <div>
          {!isFirstStep && (
            <Button variant="secondary" onClick={prevStep}>
              上一步
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          {!isLastStep && (
            <Button variant="secondary" onClick={handleSkip}>
              跳过引导
            </Button>
          )}
          <Button onClick={handleNext}>
            {isLastStep ? "开始使用" : "下一步"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSteps;
