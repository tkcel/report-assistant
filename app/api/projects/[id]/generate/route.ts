import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { paragraphs, settings, theme } = body
    
    // TODO: Mastra エージェントを使用したコンテンツ生成
    // 現在はモックデータを返す
    const generatedContent = paragraphs.map((paragraph: any) => ({
      ...paragraph,
      content: `これは「${paragraph.title}」の生成されたコンテンツです。${theme}について${paragraph.targetLength}文字程度で説明します。`,
      actualLength: paragraph.targetLength,
      status: 'completed',
    }))
    
    // マークダウン形式の完全なレポートを生成
    const fullReport = generatedContent.map((p: any) => 
      `## ${p.title}\n\n${p.content}\n`
    ).join('\n')
    
    return NextResponse.json({ 
      paragraphs: generatedContent,
      fullReport 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}