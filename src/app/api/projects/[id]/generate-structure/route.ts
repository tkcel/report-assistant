import { NextRequest, NextResponse } from "next/server";
import type { Paragraph } from "@/app/types";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { theme, settings } = body;

    // TODO: Mastra エージェントを使用した段落構成の生成
    // 現在はモックデータを返す
    const generatedParagraphs: Paragraph[] = [
      {
        id: "1",
        order: 1,
        title: "序論",
        description: `${theme}の背景と重要性について説明`,
        content: "",
        targetLength: 500,
      },
      {
        id: "2",
        order: 2,
        title: "現状分析",
        description: `${theme}の現在の状況と課題`,
        content: "",
        targetLength: 1000,
      },
      {
        id: "3",
        order: 3,
        title: "提案・解決策",
        description: `${theme}に対する具体的な提案`,
        content: "",
        targetLength: 1000,
      },
      {
        id: "4",
        order: 4,
        title: "結論",
        description: "まとめと今後の展望",
        content: "",
        targetLength: 500,
      },
    ];

    return NextResponse.json({ paragraphs: generatedParagraphs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate structure" }, { status: 500 });
  }
}
