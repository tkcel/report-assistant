"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/app/components/common/Header";
import { Button } from "@/components/ui/Button";
import { useReportStore } from "@/app/store/useReportStore";
import { downloadMarkdown, downloadText, exportToMarkdown } from "@/app/utils/exportReport";
import {
  Download,
  Copy,
  FileText,
  Home,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function EditPage() {
  const router = useRouter();
  const { theme, settings, paragraphs } = useReportStore();
  const [editedContent, setEditedContent] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [showAIOutput, setShowAIOutput] = useState(true);

  useEffect(() => {
    // 段落をマークダウン形式に変換
    if (paragraphs.length > 0) {
      const markdown = paragraphs
        .sort((a, b) => a.order - b.order)
        .map((p) => `## ${p.title}\n\n${p.content || "[内容が生成されていません]"}`)
        .join("\n\n");
      setEditedContent(markdown);
    }
  }, [paragraphs]);

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
    link.download = `${theme.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龯]/g, "_")}_${new Date().toISOString().split("T")[0]}.md`;
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
    link.download = `${theme.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龯]/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;
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

  if (!theme || paragraphs.length === 0) {
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

  return (
    <div className="w-full">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{theme}</h1>
            <Button variant="outline" size="sm" onClick={() => router.push("/protected-page")}>
              <Home className="h-4 w-4 mr-2" />
              ホームへ
            </Button>
          </div>

          {/* メタ情報 */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium">言語:</span> {settings.language}
              </div>
              <div>
                <span className="font-medium">文体:</span> {settings.writingStyle}
              </div>
              <div>
                <span className="font-medium">トーン:</span> {settings.tone}
              </div>
              <div>
                <span className="font-medium">品質:</span> {settings.quality}
              </div>
            </div>
            {settings.purpose && (
              <div className="mt-2">
                <span className="font-medium">目的:</span> {settings.purpose}
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
              <div className="text-sm text-gray-500">{paragraphs.length} 段落</div>
            </div>

            <div className="border rounded-lg bg-white overflow-hidden">
              <div className="h-[600px] overflow-y-auto p-6">
                <div className="prose prose-sm max-w-none">
                  {paragraphs
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
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button onClick={handleDownloadMarkdown} className="flex items-center gap-2">
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
  );
}
