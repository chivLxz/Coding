import React from 'react';

export interface Article {
  title: string;
  link: string;
  summary: string;
  source: string;
}

export interface Category {
  name: string;
  name_en: string;
  emoji: string;
  articles: Article[];
}

export interface NewsData {
  date: string;
  categories: Category[];
}

export interface IndexData {
  dates: string[];
}

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'AI大模型': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' },
  'AI软件产品': { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-500' },
  'AI硬件产品': { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  'AI公司股票': { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' },
};

export function getCategoryColors(name: string) {
  return CATEGORY_COLORS[name] || { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', dot: 'bg-slate-500' };
}

export function getAllSources(categories: Category[]): string[] {
  const sources = new Set<string>();
  categories.forEach(category => {
    category.articles.forEach(article => {
      sources.add(article.source);
    });
  });
  return Array.from(sources);
}

export function getSourceCounts(categories: Category[]): Record<string, number> {
  const counts: Record<string, number> = {};
  categories.forEach(category => {
    category.articles.forEach(article => {
      counts[article.source] = (counts[article.source] || 0) + 1;
    });
  });
  return counts;
}

export function getCategoryCounts(categories: Category[]): { name: string; count: number; emoji: string }[] {
  return categories.map(c => ({ name: c.name, count: c.articles.length, emoji: c.emoji }));
}

export function getWeekday(date: string): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const d = new Date(date);
  return weekdays[d.getDay()];
}

export function groupDatesByMonth(dates: string[]): Record<string, string[]> {
  return dates.reduce((acc: Record<string, string[]>, date) => {
    const month = date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(date);
    return acc;
  }, {});
}

export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  const lowerQuery = query.toLowerCase();
  return parts.map((part, i) =>
    part.toLowerCase() === lowerQuery
      ? <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{part}</mark>
      : part
  );
}

export function getTotalArticles(categories: Category[]): number {
  return categories.reduce((sum, c) => sum + c.articles.length, 0);
}
