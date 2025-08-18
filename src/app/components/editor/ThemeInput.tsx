"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, Link, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";
import { useReportStore } from "@/app/store/useReportStore";
import type { PDFFile, ReferenceLink } from "@/app/types";

interface ThemeInputProps {
  onNext: () => void;
}

export function ThemeInput({ onNext }: ThemeInputProps) {
  const {
    theme: storeTheme,
    pdfs: storePdfs,
    links: storeLinks,
    setTheme: setStoreTheme,
    addPdf,
    removePdf: removeStorePdf,
    addLink: addStoreLink,
    removeLink: removeStoreLink,
  } = useReportStore();

  const [theme, setTheme] = useState(storeTheme);
  const [newLink, setNewLink] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setTheme(storeTheme);
  }, [storeTheme]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === "application/pdf" && file.size <= 10 * 1024 * 1024,
      );
      files.forEach((file) => {
        const pdfFile: PDFFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date(),
        };
        addPdf(pdfFile);
      });
    },
    [addPdf],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        (file) => file.type === "application/pdf" && file.size <= 10 * 1024 * 1024,
      );
      files.forEach((file) => {
        const pdfFile: PDFFile = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date(),
        };
        addPdf(pdfFile);
      });
    }
  };

  const removePdf = (id: string) => {
    removeStorePdf(id);
  };

  const addLink = () => {
    if (newLink && storeLinks.length < 5 && !storeLinks.find((l) => l.url === newLink)) {
      const referenceLink: ReferenceLink = {
        id: crypto.randomUUID(),
        url: newLink,
        addedAt: new Date(),
      };
      addStoreLink(referenceLink);
      setNewLink("");
    }
  };

  const removeLink = (id: string) => {
    removeStoreLink(id);
  };

  const isValid = theme.trim().length > 0 && theme.length <= 256;

  const handleThemeChange = (value: string) => {
    setTheme(value);
    setStoreTheme(value);
  };

  const handleNext = () => {
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">ステップ1: テーマ設定</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              レポートのテーマ <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              placeholder="レポートのテーマを入力してください（例：AIが社会に与える影響について）"
              className="min-h-[100px]"
              maxLength={256}
            />
            <div className="text-sm text-gray-500 mt-1">{theme.length} / 256文字</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              PDFファイルをアップロード（任意）
            </label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-gray-300",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">ドラッグ&ドロップまたは</p>
              <label className="mt-2 cursor-pointer">
                <span className="text-primary hover:underline">ファイルを選択</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">PDF形式、最大10MB</p>
            </div>

            {storePdfs.length > 0 && (
              <div className="mt-4 space-y-2">
                {storePdfs.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)}MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removePdf(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              参考リンクを追加（任意、最大5個）
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border rounded-md"
                disabled={storeLinks.length >= 5}
              />
              <Button
                onClick={addLink}
                disabled={!newLink || storeLinks.length >= 5}
                variant="outline"
              >
                <Link className="h-4 w-4 mr-2" />
                追加
              </Button>
            </div>

            {storeLinks.length > 0 && (
              <div className="mt-4 space-y-2">
                {storeLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate flex-1"
                    >
                      {link.url}
                    </a>
                    <button
                      onClick={() => removeLink(link.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!isValid}>
          次へ進む
        </Button>
      </div>
    </div>
  );
}
