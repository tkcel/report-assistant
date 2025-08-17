'use client'

import { useState } from 'react'
import { ThemeInput } from './components/editor/ThemeInput'
import { SettingsForm } from './components/editor/SettingsForm'
import { ParagraphEditor } from './components/editor/ParagraphEditor'
import { StepIndicator } from './components/common/StepIndicator'

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator currentStep={currentStep} />
      
      <div className="mt-8">
        {currentStep === 1 && (
          <ThemeInput onNext={() => setCurrentStep(2)} />
        )}
        {currentStep === 2 && (
          <SettingsForm 
            onBack={() => setCurrentStep(1)} 
            onNext={() => setCurrentStep(3)} 
          />
        )}
        {currentStep === 3 && (
          <ParagraphEditor onBack={() => setCurrentStep(2)} />
        )}
      </div>
    </div>
  )
}