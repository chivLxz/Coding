'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import CategorySection from '@/components/CategorySection';
import BottomNav from '@/components/BottomNav';
import {
  type NewsData,
  type Category,
  getWeekday,
  getAllSources,
  getSourceCounts,
  getCategoryCounts,
  getTotalArticles,
  getCategoryColors,
} from '@/lib/data';

type LoadingState = 'loading' | 'success' | 'error' | 'empty';

export default function Home() {
  const [dates, setDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSources, setActiveSources] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Load available dates from index.json
  useEffect(() => {
    fetch('/data/index.json')
      .then(res => res.json())
      .then((data: string[] | { dates: string[] }) => {
        const dateList = Array.isArray(data) ? data : (data.dates || []);
        setDates(dateList);
        if (dateList.length > 0) {
          setSelectedDate(dateList[0]);
        }
      })
      .catch(() => {
        setLoadingState('error');
      });
  }, []);

  // Fetch data
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingState('loading');
    setNewsData(null);
    setSearchQuery('');
    setActiveSources(new Set());

    fetch(`/data/${selectedDate}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setNewsData(data);
        if (data.categories && data.categories.length > 0) {
          setLoadingState('success');
          setActiveCategory(data.categories[0].name);
        } else {
          setLoadingState('empty');
        }
      })
      .catch(() => {
        setLoadingState('error');
      });
  }, [selectedDate]);

  // Dynamic page title
  useEffect(() => {
    if (loadingState === 'success' && newsData) {
      document.title = `${newsData.date} ${getWeekday(selectedDate)} - AI 资讯日报`;
    } else {
      document.title = 'AI 资讯日报 - 每日 AI 行业新闻汇总';
    }
  }, [selectedDate, loadingState, newsData]);

  // Dynamic meta description
  useEffect(() => {
    if (loadingState === 'success' && newsData) {
      const total = getTotalArticles(newsData.categories);
      const srcs = getAllSources(newsData.categories);
      const desc = `${newsData.date} AI资讯日报：共${total}篇精选新闻，来自${srcs.length}个来源，涵盖${newsData.categories.map(c => c.name).join('、')}等领域。`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', desc);
    }
  }, [selectedDate, loadingState, newsData]);

  // Scroll listener for back-to-top and active category
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for active category tracking
  useEffect(() => {
    if (!newsData?.categories) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id?.replace('category-', '');
            if (id) setActiveCategory(id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    newsData.categories.forEach(cat => {
      const el = document.getElementById(`category-${cat.name}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [newsData]);

  const toggleSource = useCallback((source: string) => {
    setActiveSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
  }, []);

  const scrollToCategory = useCallback((categoryName: string) => {
    const el = document.getElementById(`category-${categoryName}`);
    if (el) {
      const offset = 140;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const handleRetry = useCallback(() => {
    setLoadingState('loading');
    fetch(`/data/${selectedDate}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setNewsData(data);
        setLoadingState(data.categories?.length > 0 ? 'success' : 'empty');
      })
      .catch(() => setLoadingState('error'));
  }, [selectedDate]);

  const sources = newsData ? getAllSources(newsData.categories) : [];
  const sourceCounts = newsData ? getSourceCounts(newsData.categories) : {};
  const categoryCounts = newsData ? getCategoryCounts(newsData.categories) : [];
  const totalArticles = newsData ? getTotalArticles(newsData.categories) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="md:ml-[280px] transition-all duration-300">
        {/* Fixed Top Bar */}
        <header className="sticky top-0 z-30 glass-header border-b border-slate-800/60">
          {/* Mobile header */}
          <div className="flex items-center gap-3 px-4 py-3 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="touch-target p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="打开日期选择"
              style={{ display: sidebarOpen ? 'none' : 'block' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-bold text-lg flex items-center gap-2">
              <span>🤖</span>
              <span>AI 资讯日报</span>
            </h1>
          </div>

          {/* Desktop header */}
          <div className="hidden md:flex items-center gap-3 px-6 py-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="打开侧边栏"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="font-bold text-lg flex items-center gap-2">
              <span>🤖</span>
              <span>AI 资讯日报</span>
            </h1>
            {loadingState === 'success' && newsData && (
              <span className="text-slate-500 text-sm ml-2">
                {newsData.date} {getWeekday(selectedDate)}
              </span>
            )}
          </div>

          {/* Search Bar */}
          {loadingState === 'success' && (
            <div className="px-4 md:px-6 pb-3 pt-2 md:pt-4">
              <div className="relative max-w-2xl">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索新闻标题或摘要..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 touch-target text-slate-500 hover:text-slate-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Source Filters */}
          {loadingState === 'success' && sources.length > 0 && (
            <div className="px-4 md:px-6 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 shrink-0">来源：</span>
                {sources.map(source => (
                  <button
                    key={source}
                    onClick={() => toggleSource(source)}
                    className={`source-tag px-3 py-1.5 text-xs rounded-full border transition-all duration-150 ${
                      activeSources.has(source)
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {source}
                    <span className="ml-1 opacity-60">{sourceCounts[source] || 0}</span>
                  </button>
                ))}
                {activeSources.size > 0 && (
                  <button
                    onClick={() => setActiveSources(new Set())}
                    className="text-xs text-slate-500 hover:text-slate-300 underline touch-target"
                  >
                    清除筛选
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Category Navigation */}
          {loadingState === 'success' && categoryCounts.length > 0 && (
            <div className="px-4 md:px-6 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-xs text-slate-500 shrink-0">分类：</span>
                {categoryCounts.map(cat => {
                  const colors = getCategoryColors(cat.name);
                  const isActive = activeCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => scrollToCategory(cat.name)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs rounded-full border transition-all duration-150 touch-target ${
                        isActive
                          ? `${colors.bg} ${colors.text} ${colors.border}`
                          : 'bg-transparent border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                      <span className="opacity-60">{cat.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main ref={mainContentRef} className="px-4 md:px-8 py-6 max-w-5xl mx-auto main-content-mobile">
          {loadingState === 'loading' && <LoadingSkeleton />}
          {loadingState === 'error' && <ErrorState onRetry={handleRetry} />}
          {loadingState === 'empty' && <EmptyState date={selectedDate} />}
          {loadingState === 'success' && newsData && (
            <>
              {/* Header */}
              <div className="mb-6 fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {newsData.date} {getWeekday(selectedDate)}
                  </h1>
                </div>
                <p className="text-slate-500 text-sm">共 {totalArticles} 篇资讯，来自 {sources.length} 个来源</p>
              </div>

              {/* Statistics Panel */}
              <StatsPanel
                sources={sources}
                sourceCounts={sourceCounts}
                categoryCounts={categoryCounts}
                totalArticles={totalArticles}
              />

              {/* News Categories */}
              <div className="mt-6">
                {newsData.categories.map((category: Category) => (
                  <CategorySection
                    key={category.name}
                    category={category}
                    searchQuery={searchQuery}
                    activeSources={activeSources}
                    sectionRef={(el: HTMLDivElement | null) => {
                      categoryRefs.current[category.name] = el;
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        selectedDate={selectedDate}
        onChangeDate={setSelectedDate}
      />

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 md:bottom-6 right-6 z-50 p-3 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-full shadow-lg transition-all animate-slide-up"
          aria-label="回到顶部"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ---- Sub-components ---- */

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-4 w-40" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
      {/* Card skeletons */}
      {[1, 2, 3].map(group => (
        <div key={group} className="space-y-3">
          <div className="skeleton h-6 w-40" />
          {[1, 2, 3].map(card => (
            <div key={card} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-white mb-2">数据加载失败</h2>
      <p className="text-slate-400 mb-6 text-sm">无法获取新闻数据，请检查网络连接后重试</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-colors"
      >
        重新加载
      </button>
    </div>
  );
}

function EmptyState({ date }: { date: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🤖</div>
      <h2 className="text-xl font-bold text-white mb-2">
        {date} 暂无数据
      </h2>
      <p className="text-slate-400 text-sm">今日新闻正在路上...</p>
    </div>
  );
}

function StatsPanel({
  sources,
  sourceCounts,
  categoryCounts,
  totalArticles,
}: {
  sources: string[];
  sourceCounts: Record<string, number>;
  categoryCounts: { name: string; count: number; emoji: string }[];
  totalArticles: number;
}) {
  const maxSourceCount = Math.max(...Object.values(sourceCounts), 1);

  return (
    <div className="fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
        <div className="stat-card p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
          <div className="text-3xl font-bold gradient-number">{totalArticles}</div>
          <div className="text-xs text-slate-500 mt-1">总文章数</div>
        </div>
        <div className="stat-card p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
          <div className="text-3xl font-bold gradient-number">{categoryCounts.length}</div>
          <div className="text-xs text-slate-500 mt-1">分类数</div>
        </div>
        <div className="stat-card p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
          <div className="text-3xl font-bold gradient-number">{sources.length}</div>
          <div className="text-xs text-slate-500 mt-1">数据源</div>
        </div>
        {/* Distribution card - hidden on mobile */}
        <div className="hidden md:block stat-card p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
          <div className="flex items-center gap-2 flex-wrap">
            {categoryCounts.map(cat => {
              const colors = getCategoryColors(cat.name);
              return (
                <div key={cat.name} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-xs text-slate-400">{cat.emoji} {cat.count}</span>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-slate-500 mt-1">分类分布</div>
        </div>
      </div>

      {/* Source bar chart */}
      <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
        <h3 className="text-xs font-medium text-slate-500 mb-3">来源分布</h3>
        <div className="space-y-2">
          {sources.map(source => (
            <div key={source} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-16 text-right shrink-0 truncate">{source}</span>
              <div className="flex-1 h-4 bg-slate-800/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600/60 rounded-full animate-grow"
                  style={{ width: `${((sourceCounts[source] || 0) / maxSourceCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-6 text-right">{sourceCounts[source] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
