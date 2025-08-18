import type { Paragraph, ReportSettings, Quality } from "@/app/types";

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

const generateParagraphTitleAndDescription = (
  theme: string,
  quality: Quality,
): Array<{
  title: string;
  description: string;
  targetLengthWeight: number;
}> => {
  // TODO: 以下モック。AIを使った実装に変える。
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

export async function generateParagraphStructure(
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
