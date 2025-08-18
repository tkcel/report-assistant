"use client";

import { StepIndicator } from "@/app/components/common/StepIndicator";
import { ThemeInput } from "@/app/components/editor/ThemeInput";
import { SettingsForm } from "@/app/components/editor/SettingsForm";
import { ParagraphEditor } from "@/app/components/editor/ParagraphEditor";
import { Header } from "@/app/components/common/Header";
import { useReportStore } from "@/app/store/useReportStore";

const GeneratePage = () => {
  const { currentStep, nextStep, prevStep } = useReportStore();

  return (
    <div className="w-full">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full justify-center items-center p-6 mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        <div className="mt-8">
          {currentStep === 1 && <ThemeInput onNext={nextStep} />}
          {currentStep === 2 && <SettingsForm onBack={prevStep} onNext={nextStep} />}
          {currentStep === 3 && <ParagraphEditor onBack={prevStep} />}
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;
