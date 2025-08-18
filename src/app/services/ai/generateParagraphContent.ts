import type { Paragraph, ReportSettings } from "@/app/types";

interface GenerateParagraphContentRequest {
  theme: string;
  settings: ReportSettings;
  paragraph: Paragraph;
  allParagraphs: Paragraph[];
  pdfs?: Array<{ name: string; content?: string }>;
  links?: string[];
}

interface GenerateParagraphContentResponse {
  content: string;
}

const generateMockContent = (
  theme: string,
  paragraph: Paragraph,
  settings: ReportSettings,
): string => {
  const { title, description, targetLength } = paragraph;
  const { language, writingStyle, tone } = settings;

  const sentences = {
    序論: {
      日本語: {
        常体: `${theme}は、現代社会において重要な課題の一つである。本レポートでは、${theme}について多角的な視点から検討を行い、その現状と課題を明らかにすることを目的とする。`,
        敬体: `${theme}は、現代社会において重要な課題の一つです。本レポートでは、${theme}について多角的な視点から検討を行い、その現状と課題を明らかにすることを目的とします。`,
      },
      英語: {
        常体: `${theme} is one of the important issues in modern society. This report aims to examine ${theme} from multiple perspectives and clarify its current status and challenges.`,
        敬体: `${theme} is one of the important issues in modern society. This report aims to examine ${theme} from multiple perspectives and clarify its current status and challenges.`,
      },
    },
    本論: {
      日本語: {
        常体: `${theme}に関する主要な論点として、以下の観点から分析を行う。第一に、歴史的背景を踏まえた現状の把握が重要である。第二に、関連する理論や概念を適用することで、より深い理解が可能となる。第三に、実践的な観点から具体的な事例を検討することで、理論と実践の橋渡しを図る。`,
        敬体: `${theme}に関する主要な論点として、以下の観点から分析を行います。第一に、歴史的背景を踏まえた現状の把握が重要です。第二に、関連する理論や概念を適用することで、より深い理解が可能となります。第三に、実践的な観点から具体的な事例を検討することで、理論と実践の橋渡しを図ります。`,
      },
      英語: {
        常体: `Regarding the main points about ${theme}, analysis is conducted from the following perspectives. First, understanding the current situation based on historical background is crucial. Second, applying related theories and concepts enables deeper understanding. Third, examining specific cases from a practical perspective bridges theory and practice.`,
        敬体: `Regarding the main points about ${theme}, analysis is conducted from the following perspectives. First, understanding the current situation based on historical background is crucial. Second, applying related theories and concepts enables deeper understanding. Third, examining specific cases from a practical perspective bridges theory and practice.`,
      },
    },
    結論: {
      日本語: {
        常体: `本レポートでは、${theme}について包括的な検討を行った。分析の結果、${theme}が現代社会において果たす役割の重要性が明らかになった。今後は、本レポートで示した視点を踏まえ、より実践的な取り組みが期待される。`,
        敬体: `本レポートでは、${theme}について包括的な検討を行いました。分析の結果、${theme}が現代社会において果たす役割の重要性が明らかになりました。今後は、本レポートで示した視点を踏まえ、より実践的な取り組みが期待されます。`,
      },
      英語: {
        常体: `This report conducted a comprehensive examination of ${theme}. The analysis revealed the importance of the role that ${theme} plays in modern society. Moving forward, more practical approaches are expected based on the perspectives presented in this report.`,
        敬体: `This report conducted a comprehensive examination of ${theme}. The analysis revealed the importance of the role that ${theme} plays in modern society. Moving forward, more practical approaches are expected based on the perspectives presented in this report.`,
      },
    },
  };

  let baseContent = "";

  if (title.includes("序論")) {
    baseContent = sentences.序論[language][writingStyle];
  } else if (title.includes("結論")) {
    baseContent = sentences.結論[language][writingStyle];
  } else {
    baseContent = sentences.本論[language][writingStyle];
  }

  // トーンに応じて文体を調整
  if (tone === "カジュアル" && language === "日本語") {
    baseContent = baseContent.replace(/である/g, "だ").replace(/であった/g, "だった");
  } else if (tone === "フレンドリー" && language === "日本語") {
    baseContent = baseContent.replace(/である/g, "なんです").replace(/であった/g, "でした");
  }

  // 目標文字数に近づけるための追加文章
  const additionalContent =
    language === "日本語"
      ? `さらに、${description}ことが重要な要素として挙げられる。これらの点を総合的に考慮することで、${theme}に対する理解を深めることができる。`
      : `Furthermore, ${description} is an important element to consider. By comprehensively considering these points, we can deepen our understanding of ${theme}.`;

  let content = baseContent;
  while (content.length < targetLength * 0.8) {
    content += " " + additionalContent;
  }

  // 目標文字数を超えないように調整
  if (content.length > targetLength) {
    content = content.substring(0, targetLength);
  }

  return content;
};

export async function generateParagraphContentMock(
  request: GenerateParagraphContentRequest,
): Promise<GenerateParagraphContentResponse> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { theme, paragraph, settings } = request;
  const content = generateMockContent(theme, paragraph, settings);

  return {
    content,
  };
}

export async function generateParagraphContent(
  request: GenerateParagraphContentRequest,
): Promise<GenerateParagraphContentResponse> {
  // TODO: 実際のFirebase Functions呼び出しに置き換える
  // const functions = getFunctions();
  // const generateContent = httpsCallable(functions, 'generateParagraphContent');
  // const result = await generateContent(request);
  // return result.data as GenerateParagraphContentResponse;

  // 現在はモック関数を使用
  return generateParagraphContentMock(request);
}
