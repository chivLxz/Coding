'use client';

import { useState } from 'react';
import { type Category, type Article, getCategoryColors, highlightText } from '@/lib/data';

interface CategorySectionProps {
  category: Category;
  searchQuery: string;
  activeSources: Set<string>;
  sectionRef?: (el: HTMLDivElement | null) => void;
}

export default function CategorySection({ category, searchQuery, activeSources, sectionRef }: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const colors = getCategoryColors(category.name);

  const filteredArticles = category.articles.filter(article => {
    if (activeSources.size > 0 && !activeSources.has(article.source)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return article.title.toLowerCase().includes(q) || article.summary.toLowerCase().includes(q);
    }
    return true;
  });

  if (filteredArticles.length === 0 && (searchQuery.trim() || activeSources.size > 0)) {
    return null;
  }

  return (
    <div ref={sectionRef} id={`category-${category.name}`} className="mb-8 fade-in">
      {/* Category Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 mb-4 group cursor-pointer touch-target"
      >
        <span className="text-2xl">{category.emoji}</span>
        <h2 className="text-lg font-bold text-white group-hover:text-slate-200 transition-colors">
          {category.name}
        </h2>
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text} ${colors.border} border`}>
          {category.name_en}
        </span>
        <span className="text-slate-500 text-sm ml-1">
          {filteredArticles.length} 篇
        </span>
        <span className="ml-auto text-slate-500 text-sm transition-transform duration-200" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {/* Articles - CSS grid animation for collapse */}
      <div className={`category-content ${collapsed ? 'collapsed' : 'expanded'}`}>
        <div>
          <div className="space-y-3 pb-2">
            {filteredArticles.map((article, index) => (
              <ArticleCard key={index} article={article} index={index} searchQuery={searchQuery} categoryName={category.name} />
            ))}
            {filteredArticles.length === 0 && !searchQuery.trim() && activeSources.size === 0 && (
              <div className="text-slate-500 text-sm py-8 text-center">
                <div className="text-3xl mb-2">🤖</div>
                今日新闻正在路上...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, index, searchQuery, categoryName }: { article: Article; index: number; searchQuery: string; categoryName: string }) {
  const colors = getCategoryColors(categoryName);

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`article-card group block p-4 md:p-5 bg-slate-800/40 rounded-xl border border-slate-700/40 card-hover fade-in`}
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="flex items-start gap-2 mb-2">
          <h3 className="text-blue-400 group-hover:text-blue-300 font-medium text-[15px] leading-snug transition-colors break-words">
            {highlightText(article.title, searchQuery)}
            <span className="inline-block ml-1.5 text-slate-600 text-xs group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">↗</span>
          </h3>
        </div>
        {/* Summary */}
        <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2 md:line-clamp-none">
          {highlightText(article.summary, searchQuery)}
        </p>
        {/* Source tag */}
        <span className={`inline-flex items-center px-3 py-1 text-xs rounded-full border transition-colors ${colors.bg} ${colors.text} ${colors.border}`}>
          {article.source}
        </span>
      </div>
    </a>
  );
}
