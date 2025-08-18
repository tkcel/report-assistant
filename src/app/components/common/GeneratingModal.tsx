"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface GeneratingModalProps {
  isOpen: boolean;
  totalSteps: number;
}

const loadingMessages = [
  "テーマを分析しています...",
  "段落構成を確認しています...",
  "AIモデルを準備しています...",
  "コンテンツを生成しています...",
  "文章を最適化しています...",
  "整合性をチェックしています...",
  "最終調整を行っています...",
];

export function GeneratingModal({ isOpen, totalSteps }: GeneratingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);
  const [_messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setMessageIndex(0);
      setCurrentMessage(loadingMessages[0]);
      return;
    }

    // プログレスバーのアニメーション
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 15 + 5; // 5-20%のランダムな増分
        const newProgress = Math.min(prev + increment, 95); // 95%で止める
        return newProgress;
      });
    }, 1000);

    // メッセージの更新
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => {
        const nextIndex = (prev + 1) % loadingMessages.length;
        setCurrentMessage(loadingMessages[nextIndex]);
        return nextIndex;
      });
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* モーダル */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-6">
          {/* アイコン */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <Sparkles className="h-16 w-16 text-purple-400 opacity-75" />
            </div>
            <Sparkles className="relative h-16 w-16 text-purple-600 animate-pulse" />
          </div>

          {/* タイトル */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">レポートを生成中</h2>
            <p className="text-sm text-gray-600">AIが最適なコンテンツを作成しています</p>
          </div>

          {/* プログレスバー */}
          <div className="w-full space-y-2">
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
              <span className="text-xs text-gray-500">
                {totalSteps > 0 ? `${totalSteps}段落を生成中` : "処理中"}
              </span>
            </div>
          </div>

          {/* ステータスメッセージ */}
          <div className="text-center">
            <p className="text-sm text-gray-600 animate-pulse">{currentMessage}</p>
          </div>

          {/* 注意書き */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              生成には数分かかる場合があります。
              <br />
              このまましばらくお待ちください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
