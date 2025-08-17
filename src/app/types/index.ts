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

export interface User {
  uid: string; // Firebase Authentication の uid
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  phoneNumber?: string;
  photoURL?: string;
  sex?: "男性" | "女性" | "未回答";
  schoolType?: "大学" | "大学院" | "高専" | "短大" | "専門学校" | "高等学校" | "その他";
  schoolName?: string;
  schoolDepartment?: string; // ex. 理工学部/経済学部
  schoolMajor?: string; // ex. 理工学類/経済学類
  schoolGraduationYear?: number; // ex. 26年/27年
  schoolGraduationMonth?: number; // ex. 3月/9月
  selfPr?: string;
  interestedIndustries?: (
    | "IT・通信・インターネット"
    | "メーカー"
    | "商社"
    | "サービス・レジャー"
    | "流通・小売・フード"
    | "マスコミ・広告・デザイン"
    | "金融・保険"
    | "コンサルティング"
    | "不動産・建築・設備"
    | "環境・エネルギー"
    | "公的機関"
    | "該当なし"
  )[];
  interestedJobTypes?: (
    | "戦略・総合コンサルタント"
    | "システム・ITコンサルタント"
    | "トレーダー・ディーラー"
    | "経営企画・事業企画"
    | "調査・マーケティング"
    | "商品企画・プランニング"
    | "宣伝・広報"
    | "総務・人事・労務"
    | "経理・財務・会計"
    | "法務"
    | "ディレクター・プロデューサー"
    | "webエンジニア"
    | "データサイエンティスト"
    | "SE"
    | "スマホアプリエンジニア"
    | "機械学習エンジニア"
    | "基礎研究・応用研究"
    | "機械・電気・電子機器設計"
    | "一般営業"
    | "技術営業・システム営業"
    | "ゲームクリエイター"
    | "UI・UXデザイナー"
    | "編集・制作"
    | "総合職"
    | "公務員"
    | "薬剤師"
    | "該当なし"
  )[];
}
