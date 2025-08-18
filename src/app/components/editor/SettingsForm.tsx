"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import type { Language, WritingStyle, Tone, Quality } from "@/app/types";
import { useReportStore } from "@/app/store/useReportStore";

interface SettingsFormProps {
  onBack: () => void;
  onNext: () => void;
}

export function SettingsForm({ onBack, onNext }: SettingsFormProps) {
  const { settings, updateSettings } = useReportStore();

  const [language, setLanguage] = useState<Language>(settings.language);
  const [writingStyle, setWritingStyle] = useState<WritingStyle>(settings.writingStyle);
  const [tone, setTone] = useState<Tone>(settings.tone);
  const [quality, setQuality] = useState<Quality>(settings.quality);
  const [purpose, setPurpose] = useState(settings.purpose || "");

  useEffect(() => {
    setLanguage(settings.language);
    setWritingStyle(settings.writingStyle);
    setTone(settings.tone);
    setQuality(settings.quality);
    setPurpose(settings.purpose || "");
  }, [settings]);

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    updateSettings({ language: value });
  };

  const handleWritingStyleChange = (value: WritingStyle) => {
    setWritingStyle(value);
    updateSettings({ writingStyle: value });
  };

  const handleToneChange = (value: Tone) => {
    setTone(value);
    updateSettings({ tone: value });
  };

  const handleQualityChange = (value: Quality) => {
    setQuality(value);
    updateSettings({ quality: value });
  };

  const handlePurposeChange = (value: string) => {
    setPurpose(value);
    updateSettings({ purpose: value });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">ステップ2: 詳細設定</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">言語設定</label>
            <RadioGroup
              value={language}
              onValueChange={(value) => handleLanguageChange(value as Language)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="日本語" id="japanese" />
                <label
                  htmlFor="japanese"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  日本語
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="英語" id="english" />
                <label
                  htmlFor="english"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  英語
                </label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">文体設定</label>
            <RadioGroup
              value={writingStyle}
              onValueChange={(value) => handleWritingStyleChange(value as WritingStyle)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="常体" id="jotai" />
                <label
                  htmlFor="jotai"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  常体（だ・である）
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="敬体" id="keitai" />
                <label
                  htmlFor="keitai"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  敬体（です・ます）
                </label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">口調設定</label>
            <Select value={tone} onValueChange={(value) => handleToneChange(value as Tone)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="口調を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="フォーマル">フォーマル</SelectItem>
                <SelectItem value="カジュアル">カジュアル</SelectItem>
                <SelectItem value="素直">素直</SelectItem>
                <SelectItem value="堂々">堂々</SelectItem>
                <SelectItem value="フレンドリー">フレンドリー</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">品質設定</label>
            <RadioGroup
              value={quality}
              onValueChange={(value) => handleQualityChange(value as Quality)}
            >
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="高レベル" id="high" className="mt-1" />
                  <div>
                    <label
                      htmlFor="high"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      高レベル
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      詳細で専門的な内容。参考文献や引用を含む学術的なレポート
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="中レベル" id="medium" className="mt-1" />
                  <div>
                    <label
                      htmlFor="medium"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      中レベル
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      バランスの取れた内容。一般的なレポートや課題提出向け
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="低レベル" id="low" className="mt-1" />
                  <div>
                    <label
                      htmlFor="low"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      低レベル
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      簡潔で要点のみ。概要や簡単なメモ向け
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">目的設定（任意）</label>
            <Textarea
              value={purpose}
              onChange={(e) => handlePurposeChange(e.target.value)}
              placeholder="レポートの目的や想定読者を記入してください（任意）"
              className="min-h-[100px]"
              maxLength={256}
            />
            <div className="text-sm text-gray-500 mt-1">{purpose.length} / 256文字</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          戻る
        </Button>
        <Button onClick={handleNext}>次へ進む</Button>
      </div>
    </div>
  );
}
