"use client";

import { StepIndicator } from "@/app/components/common/StepIndicator";
import { useState } from "react";
import { ThemeInput } from "@/app/components/editor/ThemeInput";
import { SettingsForm } from "@/app/components/editor/SettingsForm";
import { ParagraphEditor } from "@/app/components/editor/ParagraphEditor";
import { Header } from "@/app/components/common/Header";

const Page = () => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="w-full">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full justify-center items-center bg-white rounded-lg p-6 mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        <div className="mt-8">
          {currentStep === 1 && <ThemeInput onNext={() => setCurrentStep(2)} />}
          {currentStep === 2 && (
            <SettingsForm onBack={() => setCurrentStep(1)} onNext={() => setCurrentStep(3)} />
          )}
          {currentStep === 3 && <ParagraphEditor onBack={() => setCurrentStep(2)} />}
        </div>
      </div>
    </div>
  );
};

export default Page;
