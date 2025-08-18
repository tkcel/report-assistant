import type { Quality, ReportSettings } from "@/app/types";

export const createParagraphStructurePrompt = (
  theme: string,
  settings: ReportSettings,
  pdfs?: Array<{ name: string; size: number }>,
  links?: string[],
) => {
  const qualityDescription = getQualityDescription(settings.quality);
  const languageInstruction =
    settings.language === "日本語" ? "日本語で回答してください。" : "Please respond in English.";

  const contextInfo = [];
  if (pdfs && pdfs.length > 0) {
    contextInfo.push(`参考PDFファイル: ${pdfs.map((p) => p.name).join(", ")}`);
  }
  if (links && links.length > 0) {
    contextInfo.push(`参考リンク: ${links.join(", ")}`);
  }

  return `あなたは優秀な論文・レポート作成アシスタントです。
以下の条件に基づいて、レポートの段落構成を提案してください。

# レポート情報
- テーマ: ${theme}
- 言語: ${settings.language}
- 文体: ${settings.writingStyle}
- トーン: ${settings.tone}
- 品質レベル: ${settings.quality} (${qualityDescription})
${settings.purpose ? `- 目的: ${settings.purpose}` : ""}
${contextInfo.length > 0 ? `\n# 参考資料\n${contextInfo.join("\n")}` : ""}

# 要求事項
1. ${qualityDescription}に適した段落構成を作成してください
2. 各段落には以下を含めてください：
   - タイトル（明確で具体的なもの）
   - 説明（その段落で扱う内容の概要）
   - 推奨文字数の重み（targetLengthWeight: 1.0〜5.0の数値）
3. 論理的な流れを意識した構成にしてください
4. テーマ「${theme}」に対して適切な深さと広さを持つ構成にしてください
5. **重要**: レポート全体の合計文字数が5000文字を超えないように調整してください

# 出力形式
以下のJSON形式で回答してください：
\`\`\`json
{
  "paragraphs": [
    {
      "title": "段落のタイトル",
      "description": "段落の説明",
      "targetLengthWeight": 数値（1.0〜5.0）
    }
  ]
}
\`\`\`

# 注意事項
- 必ずJSON形式で回答してください
- targetLengthWeightは段落の重要度と内容量を表す数値です（序論・結論は1.0程度、本論は3.0〜5.0程度）
- 合計文字数は100文字単位で計算され、全体で5000文字を超えないようにしてください
- ${languageInstruction}

それでは、上記の条件に基づいてレポートの段落構成を作成してください。`;
};

const getQualityDescription = (quality: Quality): string => {
  switch (quality) {
    case "高レベル":
      return "学術的で詳細な内容、参考文献を含む専門的なレポート（5〜7段落程度、合計5000文字以内）";
    case "中レベル":
      return "バランスの取れた一般的なレポート（4〜5段落程度、合計3000〜4000文字程度）";
    case "低レベル":
      return "簡潔で要点のみをまとめたレポート（3〜4段落程度、合計2000文字程度）";
    default:
      return "一般的なレポート";
  }
};
