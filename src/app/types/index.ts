export type Language = "日本語" | "英語";
export type WritingStyle = "常体" | "敬体";
export type Tone = "フォーマル" | "カジュアル" | "素直" | "堂々" | "フレンドリー";
export type Quality = "高レベル" | "中レベル" | "低レベル";
export type ParagraphStatus = "draft" | "generating" | "completed" | "error";
export type ProjectStatus = "draft" | "in_progress" | "completed";

export interface ReportProject {
  id: string;
  title: string;
  theme: string;
  context: {
    pdfs: PDFFile[];
    links: ReferenceLink[];
  };
  settings: ReportSettings;
  paragraphs: Paragraph[];
  totalTargetLength: number;
  totalActualLength: number;
  maxTotalLength: 30000;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  generatedContent?: string;
  editedContent?: string;
}

export interface ReportSettings {
  language: Language;
  writingStyle: WritingStyle;
  tone: Tone;
  quality: Quality;
  purpose?: string;
}

export interface Paragraph {
  id: string;
  order: number;
  title: string;
  description: string;
  content: string;
  targetLength: number;
  actualLength: number;
  status: ParagraphStatus;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParagraphConstraints {
  maxParagraphs: 10;
  maxLengthPerParagraph: 3000;
  minLengthPerParagraph: 100;
  maxTotalLength: 30000;
}

export interface PDFFile {
  id: string;
  name: string;
  size: number;
  url: string;
  content?: string;
  uploadedAt: Date;
}

export interface ReferenceLink {
  id: string;
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
  addedAt: Date;
}
