import { NextRequest, NextResponse } from "next/server";
import type { ReportProject } from "@/app/types";

// 仮のデータストア（実際にはデータベースを使用）
const projects: ReportProject[] = [];

export async function GET() {
  try {
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProject: ReportProject = {
      id: Date.now().toString(),
      title: body.title || "新規レポート",
      theme: body.theme || "",
      context: {
        pdfs: [],
        links: [],
      },
      settings: body.settings || {
        language: "日本語",
        writingStyle: "常体",
        tone: "フォーマル",
        quality: "中レベル",
      },
      paragraphs: [],
      totalTargetLength: 0,
      totalActualLength: 0,
      maxTotalLength: 30000,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft",
    };

    projects.push(newProject);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
