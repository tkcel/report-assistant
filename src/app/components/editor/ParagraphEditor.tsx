"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  RefreshCw,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { Paragraph } from "@/app/types";
import { useReportStore } from "@/app/store/useReportStore";
import { generateParagraphStructure } from "@/app/services/ai/generateParagraphStructure";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ParagraphEditorProps {
  onBack: () => void;
}

interface SortableItemProps {
  paragraph: Paragraph;
  onUpdate: (id: string, updates: Partial<Paragraph>) => void;
  onRemove: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableItem({
  paragraph,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: paragraph.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("border rounded-lg p-4 bg-white", isDragging && "opacity-50")}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1">
          <div className="pt-2 cursor-move touch-none" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-col gap-1 md:hidden">
            <button
              onClick={onMoveUp}
              disabled={isFirst}
              className={cn(
                "p-1 rounded hover:bg-gray-100",
                isFirst && "opacity-50 cursor-not-allowed",
              )}
              aria-label="上に移動"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={isLast}
              className={cn(
                "p-1 rounded hover:bg-gray-100",
                isLast && "opacity-50 cursor-not-allowed",
              )}
              aria-label="下に移動"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={paragraph.title}
                onChange={(e) => onUpdate(paragraph.id, { title: e.target.value })}
                className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={() => onRemove(paragraph.id)}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <textarea
            value={paragraph.description}
            onChange={(e) => onUpdate(paragraph.id, { description: e.target.value })}
            placeholder="段落の説明を入力..."
            className="w-full px-3 py-2 text-sm border rounded-md resize-none"
            rows={2}
          />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">目標文字数:</label>
              <input
                type="number"
                value={paragraph.targetLength}
                onChange={(e) =>
                  onUpdate(paragraph.id, {
                    targetLength: Math.min(3000, Math.max(100, parseInt(e.target.value) || 0)),
                  })
                }
                min={100}
                max={3000}
                step={100}
                className="w-20 px-2 py-1 text-sm border rounded"
              />
            </div>

            {paragraph.content.length > 0 && (
              <span className="text-sm text-green-600">
                生成済み ({paragraph.content.length}文字)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ParagraphEditor({ onBack }: ParagraphEditorProps) {
  const {
    theme,
    settings,
    pdfs,
    links,
    paragraphs: storeParagraphs,
    setParagraphs: setStoreParagraphs,
    addParagraph: addStoreParagraph,
    updateParagraph: updateStoreParagraph,
    removeParagraph: removeStoreParagraph,
  } = useReportStore();

  const [paragraphs, setParagraphs] = useState<Paragraph[]>(storeParagraphs);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (storeParagraphs.length === 0) {
      const defaultParagraphs: Paragraph[] = [
        {
          id: "1",
          order: 1,
          title: "序論",
          description: "レポートの背景と目的を説明",
          content: "",
          targetLength: 500,
        },
        {
          id: "2",
          order: 2,
          title: "本論",
          description: "主要な論点と分析",
          content: "",
          targetLength: 1500,
        },
        {
          id: "3",
          order: 3,
          title: "結論",
          description: "まとめと今後の展望",
          content: "",
          targetLength: 500,
        },
      ];
      setParagraphs(defaultParagraphs);
      setStoreParagraphs(defaultParagraphs);
    } else {
      setParagraphs(storeParagraphs);
    }
  }, [storeParagraphs, setStoreParagraphs]);

  useEffect(() => {
    setStoreParagraphs(paragraphs);
  }, [paragraphs, setStoreParagraphs]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const totalTargetLength = paragraphs.reduce((sum, p) => sum + p.targetLength, 0);
  const totalActualLength = paragraphs.reduce((sum, p) => sum + p.content.length, 0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setParagraphs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // orderを更新
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }));
      });
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= paragraphs.length) return;

    setParagraphs((items) => {
      const newItems = arrayMove(items, index, newIndex);
      return newItems.map((item, idx) => ({
        ...item,
        order: idx + 1,
      }));
    });
  };

  const addParagraph = () => {
    if (paragraphs.length >= 10) return;

    const newParagraph: Paragraph = {
      id: Date.now().toString(),
      order: paragraphs.length + 1,
      title: `段落 ${paragraphs.length + 1}`,
      description: "",
      content: "",
      targetLength: 500,
    };
    const newParagraphs = [...paragraphs, newParagraph];
    setParagraphs(newParagraphs);
  };

  const removeParagraph = (id: string) => {
    setParagraphs((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((item, index) => ({
        ...item,
        order: index + 1,
      }));
    });
  };

  const updateParagraph = (id: string, updates: Partial<Paragraph>) => {
    const updatedParagraphs = paragraphs.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setParagraphs(updatedParagraphs);
  };

  const generateStructure = async () => {
    console.log("theme", theme);
    console.log("settings", settings);
    console.log("pdfs", pdfs);
    console.log("links", links);
    setIsGenerating(true);

    try {
      const response = await generateParagraphStructure({
        theme,
        settings,
        pdfs: pdfs.map((pdf) => ({
          name: pdf.name,
          size: pdf.size,
        })),
        links: links.map((link) => link.url),
      });

      console.log("response", response);

      setParagraphs(response.paragraphs);
      setStoreParagraphs(response.paragraphs);
    } catch (error) {
      console.error("段落構成の生成に失敗しました:", error);
      // TODO: エラーハンドリング（トースト通知など）
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContent = async () => {
    // TODO: AI によるコンテンツ生成
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">ステップ3: 段落構成・生成</h2>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">合計文字数</span>
            <span
              className={cn(
                "text-sm font-bold",
                totalTargetLength > 30000 ? "text-red-500" : "text-gray-700",
              )}
            >
              目標: {totalTargetLength.toLocaleString()} / 30,000文字
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                totalTargetLength > 30000 ? "bg-red-500" : "bg-primary",
              )}
              style={{ width: `${Math.min((totalTargetLength / 30000) * 100, 100)}%` }}
            />
          </div>
          {totalActualLength > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              実際: {totalActualLength.toLocaleString()}文字
            </div>
          )}
        </div>

        <div className="flex justify-between mb-4">
          <Button onClick={generateStructure} disabled={isGenerating} variant="outline">
            <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
            構成をAIで自動生成する✨
            <span className="text-[10px] text-gray-500">※ 現在の段落は上書きされます</span>
          </Button>
          <Button onClick={addParagraph} disabled={paragraphs.length >= 10} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            段落を追加
          </Button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={paragraphs} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {paragraphs.map((paragraph, index) => (
                <SortableItem
                  key={paragraph.id}
                  paragraph={paragraph}
                  onUpdate={updateParagraph}
                  onRemove={removeParagraph}
                  onMoveUp={() => moveItem(index, "up")}
                  onMoveDown={() => moveItem(index, "down")}
                  isFirst={index === 0}
                  isLast={index === paragraphs.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {paragraphs.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 mb-4">段落がありません</p>
            <Button onClick={addParagraph}>
              <Plus className="h-4 w-4 mr-2" />
              最初の段落を追加
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          戻る
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            プロンプトをエクスポート
          </Button>
          <Button onClick={generateContent} disabled={paragraphs.length === 0}>
            AIでレポートを生成✨
          </Button>
        </div>
      </div>
    </div>
  );
}
