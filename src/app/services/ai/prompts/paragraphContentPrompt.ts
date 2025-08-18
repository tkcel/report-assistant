import type { Paragraph, ReportSettings } from "@/app/types";

export const createParagraphContentPrompt = (
  theme: string,
  settings: ReportSettings,
  paragraph: Paragraph,
  allParagraphs: Paragraph[],
  previousContent?: string[],
  pdfs?: Array<{ name: string; content?: string }>,
  links?: string[],
) => {
  const languageInstruction =
    settings.language === "日本語" ? "日本語で執筆してください。" : "Please write in English.";

  const writingStyleInstruction = getWritingStyleInstruction(settings);

  // 前後の段落情報を提供
  const currentIndex = allParagraphs.findIndex((p) => p.id === paragraph.id);
  const contextParagraphs = allParagraphs
    .map((p, i) => {
      if (i === currentIndex) {
        return `【現在】${p.order}. ${p.title} - ${p.description}`;
      }
      return `${p.order}. ${p.title} - ${p.description}`;
    })
    .join("\n");

  // 既に生成された内容のコンテキスト
  const previousContentContext =
    previousContent && previousContent.length > 0
      ? `\n# 既に書かれた内容（前の段落）\n${previousContent
          .map((content, i) => {
            const paragraphInfo = allParagraphs[i];
            // 最後の段落は全文、それ以外は説明文を使用
            if (i === previousContent.length - 1) {
              return `【${paragraphInfo.title}】\n${content}`;
            } else {
              return `【${paragraphInfo.title}】\n概要: ${paragraphInfo.description}`;
            }
          })
          .join("\n\n")}`
      : "";

  // 参考資料の情報
  const contextInfo = [];
  if (pdfs && pdfs.length > 0) {
    contextInfo.push(`参考PDFファイル: ${pdfs.map((p) => p.name).join(", ")}`);
  }
  if (links && links.length > 0) {
    contextInfo.push(`参考リンク: ${links.join(", ")}`);
  }

  return `あなたは優秀な論文・レポート執筆者です。
以下の条件に基づいて、指定された段落の内容を執筆してください。

# レポート情報
- テーマ: ${theme}
- 言語: ${settings.language}
- 文体: ${settings.writingStyle}
- トーン: ${settings.tone}
- 品質レベル: ${settings.quality}
${settings.purpose ? `- 目的: ${settings.purpose}` : ""}
${contextInfo.length > 0 ? `\n# 参考資料\n${contextInfo.join("\n")}` : ""}

# レポート全体の構成
${contextParagraphs}
${previousContentContext}

# 執筆する段落
- タイトル: ${paragraph.title}
- 説明: ${paragraph.description}
- 目標文字数: ${paragraph.targetLength}文字（±20%程度）

# 執筆要件
1. ${writingStyleInstruction}
2. 論理的で一貫性のある内容にしてください
3. 前後の段落との繋がりを意識してください
   ${previousContent && previousContent.length > 0 ? "- 前の段落から自然に繋がるように書き始めてください" : ""}
   ${currentIndex < allParagraphs.length - 1 ? "- 次の段落へ自然に繋がるように終わらせてください" : ""}
4. 具体例や根拠を適切に含めてください
5. 目標文字数に近い長さで執筆してください（極端に短くしたり長くしたりしないでください）
6. ${paragraph.order === 1 ? "導入として読者の興味を引く内容にしてください" : ""}
7. ${paragraph.order === allParagraphs.length ? "結論として全体をまとめ、今後の展望を示してください" : ""}
8. 前の段落で述べた内容と重複しないよう、新しい視点や情報を追加してください

# 出力形式
段落の内容のみを出力してください。タイトルや番号は不要です。
${languageInstruction}

それでは、上記の条件に基づいて「${paragraph.title}」の内容を執筆してください。`;
};

const getWritingStyleInstruction = (settings: ReportSettings): string => {
  const { language, writingStyle, tone, quality } = settings;

  let instruction = "";

  // 文体の指示
  if (language === "日本語") {
    if (writingStyle === "常体") {
      instruction += "「だ・である」調で執筆してください。";
    } else {
      instruction += "「です・ます」調で執筆してください。";
    }

    // トーンの指示
    switch (tone) {
      case "フォーマル":
        instruction += "格式高く、専門的な表現を使用してください。";
        break;
      case "カジュアル":
        instruction += "親しみやすく、読みやすい表現を使用してください。";
        break;
      case "素直":
        instruction += "簡潔で分かりやすい表現を使用してください。";
        break;
      case "堂々":
        instruction += "自信を持った、説得力のある表現を使用してください。";
        break;
      case "フレンドリー":
        instruction += "親近感のある、優しい表現を使用してください。";
        break;
    }
  } else {
    // 英語の場合
    switch (tone) {
      case "フォーマル":
        instruction += "Use formal, academic language.";
        break;
      case "カジュアル":
        instruction += "Use casual, conversational language.";
        break;
      case "素直":
        instruction += "Use simple, straightforward language.";
        break;
      case "堂々":
        instruction += "Use confident, assertive language.";
        break;
      case "フレンドリー":
        instruction += "Use friendly, approachable language.";
        break;
    }
  }

  // 品質レベルの指示
  switch (quality) {
    case "高レベル":
      instruction +=
        language === "日本語"
          ? "学術的な深さと専門性を持った内容にしてください。必要に応じて引用や参考文献への言及を含めてください。"
          : " Include scholarly depth and cite sources where appropriate.";
      break;
    case "中レベル":
      instruction +=
        language === "日本語"
          ? "バランスの取れた、読みやすい内容にしてください。"
          : " Maintain a balanced, readable style.";
      break;
    case "低レベル":
      instruction +=
        language === "日本語"
          ? "要点を簡潔にまとめた内容にしてください。"
          : " Keep it concise and to the point.";
      break;
  }

  return instruction;
};

// 全段落を一度に生成するためのプロンプト
export const createFullReportPrompt = (
  theme: string,
  settings: ReportSettings,
  paragraphs: Paragraph[],
  pdfs?: Array<{ name: string; content?: string }>,
  links?: string[],
) => {
  const languageInstruction =
    settings.language === "日本語" ? "日本語で執筆してください。" : "Please write in English.";

  const writingStyleInstruction = getWritingStyleInstruction(settings);

  // 参考資料の情報
  const contextInfo = [];
  if (pdfs && pdfs.length > 0) {
    contextInfo.push(`参考PDFファイル: ${pdfs.map((p) => p.name).join(", ")}`);
  }
  if (links && links.length > 0) {
    contextInfo.push(`参考リンク: ${links.join(", ")}`);
  }

  const paragraphsInfo = paragraphs
    .map((p) => `## ${p.title}\n- ID: ${p.id}\n- 説明: ${p.description}\n- 目標文字数: ${p.targetLength}文字`)
    .join("\n\n");

  return `あなたは優秀な論文・レポート執筆者です。
以下の条件に基づいて、完全なレポートを執筆してください。

# レポート情報
- テーマ: ${theme}
- 言語: ${settings.language}
- 文体: ${settings.writingStyle}
- トーン: ${settings.tone}
- 品質レベル: ${settings.quality}
${settings.purpose ? `- 目的: ${settings.purpose}` : ""}
${contextInfo.length > 0 ? `\n# 参考資料\n${contextInfo.join("\n")}` : ""}

# レポート構成と要件
以下の段落を順番に執筆してください。各段落のIDは変更せず、そのまま使用してください：

${paragraphsInfo}

# 執筆要件
1. ${writingStyleInstruction}
2. 各段落は論理的に繋がるようにしてください
3. 全体として一貫性のある内容にしてください
4. 各段落の目標文字数を意識してください
5. 導入で読者の興味を引き、結論で全体をまとめてください

# 出力形式
以下のJSON形式で出力してください。**必ず各段落に指定されたIDを正確に使用してください**：
\`\`\`json
{
  "paragraphs": [
    {
      "id": "（例: generated-1234567890-0 など、上記で指定されたIDをそのまま）",
      "content": "段落の内容"
    }
  ]
}
\`\`\`

**重要**: 
- 各段落のIDは、上記の「レポート構成と要件」セクションで指定されたIDと必ず一致させてください
- IDを変更したり、新しいIDを作成したりしないでください
- 指定された全ての段落を含めてください

${languageInstruction}

それでは、上記の条件に基づいてレポート全体を執筆してください。`;
};
