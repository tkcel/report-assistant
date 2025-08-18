import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/firebase/firebase";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "レポートアシスト",
  description: "AIを活用してレポート作成を効率化する支援ツール",
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <main className="w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
