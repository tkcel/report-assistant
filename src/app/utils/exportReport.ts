import type { Paragraph, ReportSettings } from "@/app/types";

export const exportToMarkdown = (
  theme: string,
  paragraphs: Paragraph[],
  settings: ReportSettings,
): string => {
  const header = `# ${theme}\n\n`;

  const metadata = `---
言語: ${settings.language}
文体: ${settings.writingStyle}
トーン: ${settings.tone}
品質: ${settings.quality}
${settings.purpose ? `目的: ${settings.purpose}` : ""}
生成日: ${new Date().toLocaleDateString("ja-JP")}
---\n\n`;

  const content = paragraphs
    .sort((a, b) => a.order - b.order)
    .map((paragraph) => {
      const heading = `## ${paragraph.order}. ${paragraph.title}\n\n`;
      const body = paragraph.content || `*[この段落はまだ生成されていません]*\n`;
      return heading + body + "\n";
    })
    .join("\n");

  return header + metadata + content;
};

export const downloadMarkdown = (
  theme: string,
  paragraphs: Paragraph[],
  settings: ReportSettings,
) => {
  const markdown = exportToMarkdown(theme, paragraphs, settings);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${theme.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龯]/g, "_")}_${new Date().toISOString().split("T")[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToText = (
  theme: string,
  paragraphs: Paragraph[],
  settings: ReportSettings,
): string => {
  const header = `${theme}\n${"=".repeat(theme.length)}\n\n`;

  const content = paragraphs
    .sort((a, b) => a.order - b.order)
    .map((paragraph) => {
      const heading = `${paragraph.order}. ${paragraph.title}\n${"-".repeat(paragraph.title.length + 3)}\n\n`;
      const body = paragraph.content || "[この段落はまだ生成されていません]\n";
      return heading + body + "\n";
    })
    .join("\n");

  return header + content;
};

export const downloadText = (theme: string, paragraphs: Paragraph[], settings: ReportSettings) => {
  const text = exportToText(theme, paragraphs, settings);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${theme.replace(/[^a-zA-Z0-9ぁ-んァ-ヶー一-龯]/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
