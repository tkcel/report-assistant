"use client"

import { logOutWithFirebaseAuth } from "@/lib/firebase/firebase-auth"
import { useSession } from "next-auth/react";
import Link from "next/link"
import { StepIndicator } from "@/app/components/common/StepIndicator"
import { useState } from "react";
import { ThemeInput } from "@/app/components/editor/ThemeInput";
import { SettingsForm } from "@/app/components/editor/SettingsForm";
import { ParagraphEditor } from "@/app/components/editor/ParagraphEditor";

const Page = () => {
  const {data:session} = useSession();
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div style={{display:"flex", flexDirection:"column", gap: 20}}>  
        <div style={{fontSize: 20, fontWeight: 20}}>ログインした人限定のページ</div>
        <div>あなたの名前は{session?.user?.name}さんです</div>
        <div style={{display:"flex", flexDirection:"column"}}>
            <button>
                <Link href={`/`}>&quot;/&quot;ページへのリンク</Link>
            </button>
            （※ログインしているセッションが残っているため、このページに戻ってくるよ）
        </div>
        <button onClick={logOutWithFirebaseAuth}>ログアウト</button>

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
    </div>
  )
}

export default Page