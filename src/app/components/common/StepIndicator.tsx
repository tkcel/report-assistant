"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "テーマ設定" },
  { id: 2, name: "詳細設定" },
  { id: 3, name: "段落構成・生成" },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full justify-center items-center">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 flex items-center">
            <div className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  currentStep > step.id
                    ? "bg-primary border-primary text-white"
                    : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-gray-300 text-gray-300",
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-gray-900" : "text-gray-400",
                  )}
                >
                  {step.name}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4",
                  currentStep > step.id ? "bg-primary" : "bg-gray-200",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
