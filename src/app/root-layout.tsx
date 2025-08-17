import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "レポートアシスト",
  description: "AIを活用してレポート作成を効率化する支援ツール",
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <main className="w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
