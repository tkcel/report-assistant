"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/app/components/common/Header";
import { Button } from "@/components/ui/Button";
import { useReportStore } from "@/app/store/useReportStore";
import type { ReportSettings } from "@/app/types";
import {
  Download,
  Copy,
  FileText,
  Home,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSession } from "next-auth/react";
import {
  createReportInFirestore,
  updateReportInFirestore,
  getReportFromFirestore,
} from "@/lib/firebase/firestore-reports";

export default function EditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");
  const { theme, settings, paragraphs, setTheme, setSettings, setParagraphs } = useReportStore();
  const { data: session } = useSession();
  const [editedContent, setEditedContent] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [showAIOutput, setShowAIOutput] = useState(true);
  const [currentReportId, setCurrentReportId] = useState<string | null>(reportId);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [loadedParagraphs, setLoadedParagraphs] = useState(paragraphs);
  const [loadedTheme, setLoadedTheme] = useState(theme);
  const [loadedSettings, setLoadedSettings] = useState(settings);

  // Firestoreからのデータ取得（編集のみ、新規作成はしない）
  useEffect(() => {
    let isCancelled = false;

    const loadReport = async () => {
      // レポートIDがない場合はエラー
      if (!reportId) {
        console.error("レポートIDが指定されていません");
        return;
      }

      // 既に初期化中の場合は何もしない
      if (isInitializing) return;
      if (!session?.user?.uid) return;

      const userId = session.user.uid;

      // 初期化フラグを立てる
      setIsInitializing(true);

      try {
        if (isCancelled) return;

        const result = await getReportFromFirestore(reportId, userId);
        if (result.success && result.report) {
          // Firestoreからデータを取得して表示
          const report = result.report;
          if (!isCancelled) {
            setCurrentReportId(report.id);
            // ローカルの状態を更新
            setLoadedTheme(report.theme);
            setLoadedSettings(report.settings as ReportSettings);
            setLoadedParagraphs(report.paragraphs);
            // storeも更新（リロード時のため）
            setTheme(report.theme);
            setSettings(report.settings as ReportSettings);
            setParagraphs(report.paragraphs);

            // 編集内容を優先的に使用
            // editedContentが存在する場合は必ずそれを使用（再編集時の内容保持）
            if (report.editedContent !== undefined && report.editedContent !== null) {
              setEditedContent(report.editedContent);
            } else {
              // editedContentがない場合のみ、paragraphsから生成
              const markdown = report.paragraphs
                .sort((a, b) => a.order - b.order)
                .map((p) => `## ${p.title}\n\n${p.content || "[内容が生成されていません]"}`)
                .join("\n\n");
              setEditedContent(markdown);
            }
          }
        } else {
          console.error("レポートの取得に失敗しました");
        }
      } finally {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }
    };

    loadReport();

    // クリーンアップ関数
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.uid, reportId]); // 無限ループを防ぐため依存配列を限定

  const handleSave = async () => {
    if (!session?.user?.uid || !currentReportId) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 編集内容をそのまま保存（パラグラフは元のまま保持）
      const result = await updateReportInFirestore(currentReportId, session.user.uid, {
        editedContent: editedContent,  // 編集したマークダウンを保存
        // paragraphsは更新しない（AI生成結果を保持）
      });

      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error("保存エラー:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("コピーに失敗しました:", err);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([editedContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${displayTheme.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龯]/g, "_")}_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadText = () => {
    const plainText = editedContent
      .replace(/#{1,6} /g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "");

    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${displayTheme.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龯]/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  // レポートIDがない場合のエラー表示
  if (!reportId) {
    return (
      <div className="w-full">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">レポートIDが指定されていません</p>
            <Button onClick={() => router.push("/protected-page")}>ホームに戻る</Button>
          </div>
        </div>
      </div>
    );
  }

  // ローディング中または初期化中の表示
  if (isInitializing || (!loadedTheme && !theme)) {
    return (
      <div className="w-full">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">レポートを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // データが読み込まれた後、まだ存在しない場合
  if (!isInitializing && !loadedTheme && !theme) {
    return (
      <div className="w-full">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">レポートが見つかりません</p>
            <Button onClick={() => router.push("/protected-page")}>ホームに戻る</Button>
          </div>
        </div>
      </div>
    );
  }

  // 表示用のデータを選択（loadedデータを優先）
  const displayTheme = loadedTheme || theme;
  const displaySettings = loadedSettings || settings;
  const displayParagraphs = loadedParagraphs.length > 0 ? loadedParagraphs : paragraphs;

  return (
    <div className="w-full">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{displayTheme}</h1>
            <Button variant="outline" size="sm" onClick={() => router.push("/protected-page")}>
              <Home className="h-4 w-4 mr-2" />
              ホームへ
            </Button>
          </div>

          {/* メタ情報 */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium">言語:</span> {displaySettings.language}
              </div>
              <div>
                <span className="font-medium">文体:</span> {displaySettings.writingStyle}
              </div>
              <div>
                <span className="font-medium">トーン:</span> {displaySettings.tone}
              </div>
              <div>
                <span className="font-medium">品質:</span> {displaySettings.quality}
              </div>
            </div>
            {displaySettings.purpose && (
              <div className="mt-2">
                <span className="font-medium">目的:</span> {displaySettings.purpose}
              </div>
            )}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div
          className={cn("grid gap-8", showAIOutput ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}
        >
          {/* 編集エリア */}
          <div className={cn("space-y-4", !showAIOutput && "lg:col-span-1")}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">編集</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className={cn(
                    "transition-colors",
                    copySuccess && "bg-green-50 text-green-600 border-green-300",
                  )}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copySuccess ? "コピー済み" : "コピー"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAIOutput(!showAIOutput)}>
                  {showAIOutput ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      AI出力結果を隠す
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      AI出力結果を表示
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-[600px] p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ここでレポートを編集できます..."
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                {editedContent.length} 文字
              </div>
            </div>
          </div>

          {/* AI出力結果エリア */}
          <div className={cn("space-y-4", !showAIOutput && "hidden")}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">AI出力結果</h2>
              <div className="text-sm text-gray-500">{displayParagraphs.length} 段落</div>
            </div>

            <div className="border rounded-lg bg-white overflow-hidden">
              <div className="h-[600px] overflow-y-auto p-6">
                <div className="prose prose-sm max-w-none">
                  {displayParagraphs
                    .sort((a, b) => a.order - b.order)
                    .map((paragraph) => (
                      <div key={paragraph.id} className="mb-6 border-b pb-4 last:border-b-0">
                        <div
                          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                          onClick={() => toggleSection(paragraph.id)}
                        >
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <span className="text-blue-600">{paragraph.order}.</span>
                            {paragraph.title}
                          </h3>
                          {collapsedSections.has(paragraph.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          )}
                        </div>

                        {!collapsedSections.has(paragraph.id) && (
                          <>
                            <p className="text-xs text-gray-500 mt-1 mb-3">
                              {paragraph.description}
                            </p>
                            <div className="text-gray-700 whitespace-pre-wrap">
                              {paragraph.content || "[内容が生成されていません]"}
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              {paragraph.content?.length || 0} / {paragraph.targetLength} 文字
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-8 space-y-4">
          {/* 保存ボタン */}
          <div className="flex justify-center">
            <Button
              onClick={handleSave}
              disabled={isSaving || !currentReportId}
              className={cn(
                "flex items-center gap-2 min-w-[200px]",
                saveSuccess && "bg-green-600 hover:bg-green-700",
              )}
            >
              <Save className="h-4 w-4" />
              {isSaving ? "保存中..." : saveSuccess ? "保存しました" : "レポートを保存"}
            </Button>
          </div>

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">ダウンロード</span>
            </div>
          </div>

          {/* ダウンロードボタン */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleDownloadMarkdown}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Markdownでダウンロード
            </Button>
            <Button
              onClick={handleDownloadText}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              テキストでダウンロード
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
