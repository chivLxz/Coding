import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 资讯日报",
  description: "每日 AI 行业新闻汇总",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
