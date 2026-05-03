import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 资讯日报 - 每日 AI 行业新闻汇总",
  description: "每日精选 AI 行业新闻汇总，涵盖大模型、AI软件、AI硬件、AI股票等领域，来自量子位、36氪、机器之心等权威来源。",
  keywords: "AI新闻,人工智能,大模型,GPT,AI日报,AI资讯",
  openGraph: {
    title: "AI 资讯日报",
    description: "每日精选 AI 行业新闻汇总",
    type: "website",
  },
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
