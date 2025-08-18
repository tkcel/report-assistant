import type { Paragraph, ReportSettings, Quality } from "@/app/types";
import { geminiFlashModel } from "@/lib/firebase/ai";
import { createParagraphStructurePrompt } from "./prompts/paragraphStructurePrompt";

interface GenerateParagraphStructureRequest {
  theme: string;
  settings: ReportSettings;
  pdfs?: Array<{ name: string; size: number }>;
  links?: string[];
}

interface GenerateParagraphStructureResponse {
  paragraphs: Paragraph[];
  totalEstimatedLength: number;
}

interface ParagraphStructureItem {
  title: string;
  description: string;
  targetLengthWeight: number;
}

const getQualityMultiplier = (quality: Quality): number => {
  switch (quality) {
    case "高レベル":
      return 1.5;
    case "中レベル":
      return 1.0;
    case "低レベル":
      return 0.7;
    default:
      return 1.0;
  }
};

// AIの応答がミスった時のフォールバック用
const generateParagraphTitleAndDescription = (
  theme: string,
  quality: Quality,
): Array<{
  title: string;
  description: string;
  targetLengthWeight: number;
}> => {
  if (quality === "高レベル") {
    return [
      {
        title: "研究の背景と目的",
        description: `${theme}に関する背景と、本レポートで扱う問題の概要を説明`,
        targetLengthWeight: 1.0,
      },
      {
        title: "先行研究の概観",
        description: `${theme}に関する既存の研究や文献をレビューし、現在の知見を整理`,
        targetLengthWeight: 2.0,
      },
      {
        title: "理論的枠組み",
        description: `${theme}を分析するための理論的な枠組みや概念を提示`,
        targetLengthWeight: 3.0,
      },
      {
        title: "主要な論点の分析",
        description: `${theme}に関する主要な論点を詳細に分析し、批判的に検討`,
        targetLengthWeight: 5.0,
      },
      {
        title: "議論と考察",
        description: `提示した論点について分析を行い、独自の考察を展開`,
        targetLengthWeight: 3.0,
      },
      {
        title: "結論と今後の展望",
        description: `研究の成果を総括し、${theme}に関する今後の展望や課題を論述`,
        targetLengthWeight: 2.0,
      },
      {
        title: "参考文献",
        description: `本レポートで引用・参照した文献のリスト`,
        targetLengthWeight: 1.0,
      },
    ];
  } else if (quality === "中レベル") {
    return [
      {
        title: "序論",
        description: `${theme}に関する背景と、本レポートで扱う問題の概要を説明`,
        targetLengthWeight: 1.0,
      },
      {
        title: "背景と現状",
        description: `${theme}の歴史的背景と現在の状況を解説`,
        targetLengthWeight: 2.0,
      },
      {
        title: "主要な論点",
        description: `${theme}における重要な論点や課題を整理・提示`,
        targetLengthWeight: 3.0,
      },
      {
        title: "分析と考察",
        description: `提示した論点について分析を行い、独自の考察を展開`,
        targetLengthWeight: 3.0,
      },
      {
        title: "結論",
        description: `本レポートの要点をまとめ、${theme}に関する結論を提示`,
        targetLengthWeight: 1.0,
      },
    ];
  } else {
    return [
      { title: "序論", description: `${theme}に関して詳述`, targetLengthWeight: 1.0 },
      { title: "本論", description: `${theme}に関して詳述`, targetLengthWeight: 3.0 },
      { title: "結論", description: `${theme}に関して詳述`, targetLengthWeight: 1.0 },
    ];
  }
};

const calculateTargetLength = (quality: Quality, targetLengthWeight: number): number => {
  const qualityMultiplier = getQualityMultiplier(quality);
  const baseLength = 500;

  return Math.round(baseLength * targetLengthWeight * qualityMultiplier);
};

const parseAIResponse = (responseText: string): ParagraphStructureItem[] => {
  try {
    // JSONコードブロックを抽出
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : responseText;

    const parsed = JSON.parse(jsonString);

    if (parsed.paragraphs && Array.isArray(parsed.paragraphs)) {
      return parsed.paragraphs;
    }

    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("AIレスポンスの解析に失敗しました");
  }
};

export async function generateParagraphStructureWithAI(
  request: GenerateParagraphStructureRequest,
): Promise<GenerateParagraphStructureResponse> {
  const { theme, settings, pdfs, links } = request;

  try {
    // プロンプトを作成
    const prompt = createParagraphStructurePrompt(theme, settings, pdfs, links);

    // Firebase AI Logicを使用して生成
    const result = await geminiFlashModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // レスポンスを解析
    const paragraphStructure = parseAIResponse(text);

    // Paragraph型に変換
    const paragraphs: Paragraph[] = paragraphStructure.map(
      ({ title, description, targetLengthWeight }, index) => ({
        id: `generated-${Date.now()}-${index}`,
        order: index + 1,
        title,
        description,
        content: "",
        targetLength: calculateTargetLength(settings.quality, targetLengthWeight),
      }),
    );

    const totalEstimatedLength = paragraphs.reduce((sum, p) => sum + p.targetLength, 0);

    return {
      paragraphs,
      totalEstimatedLength,
    };
  } catch (error) {
    console.error("AI generation failed:", error);
    // エラー時はモック関数にフォールバック
    return generateParagraphStructureMock(request);
  }
}

// モック実装（フォールバック用）
export async function generateParagraphStructureMock(
  request: GenerateParagraphStructureRequest,
): Promise<GenerateParagraphStructureResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { theme, settings } = request;
  const titleAndDescription = generateParagraphTitleAndDescription(theme, settings.quality);

  const paragraphs: Paragraph[] = titleAndDescription.map(
    ({ title, description, targetLengthWeight }, index) => ({
      id: `generated-${Date.now()}-${index}`,
      order: index + 1,
      title,
      description,
      content: "",
      targetLength: calculateTargetLength(settings.quality, targetLengthWeight),
    }),
  );

  const totalEstimatedLength = paragraphs.reduce((sum, p) => sum + p.targetLength, 0);

  return {
    paragraphs,
    totalEstimatedLength,
  };
}

// エクスポートする関数（環境に応じて切り替え）
export async function generateParagraphStructure(
  request: GenerateParagraphStructureRequest,
): Promise<GenerateParagraphStructureResponse> {
  // 環境変数でAIの有効/無効を切り替え可能にする
  const useAI = process.env.NEXT_PUBLIC_USE_AI !== "false";

  if (useAI) {
    try {
      return await generateParagraphStructureWithAI(request);
    } catch (error) {
      console.warn("Falling back to mock implementation due to AI error:", error);
      return generateParagraphStructureMock(request);
    }
  } else {
    return generateParagraphStructureMock(request);
  }
}
