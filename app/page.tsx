'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import NewsTable from '@/components/NewsTable';

interface Article {
  title: string;
  link: string;
  summary: string;
  source: string;
}

interface Category {
  name: string;
  name_en: string;
  emoji: string;
  articles: Article[];
}

interface NewsData {
  date: string;
  sources: string[];
  categories: Category[];
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState('2026-04-05');
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/data/${selectedDate}.json`)
      .then(res => res.json())
      .then(data => setNewsData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const getWeekday = (date: string) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const d = new Date(date);
    return weekdays[d.getDay()];
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <Sidebar selectedDate={selectedDate} onChangeDate={setSelectedDate} />

      <main className="flex-1 ml-72 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {loading ? (
              <div className="text-slate-400">加载中...</div>
            ) : newsData ? (
              <>
                <h1 className="text-3xl font-bold mb-2">
                  {newsData.date} {getWeekday(selectedDate)}
                </h1>
                <div className="flex flex-wrap gap-2 mt-4">
                  {newsData.sources.map((source, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-red-400">无法加载数据</div>
            )}
          </div>

          {/* News Tables */}
          {newsData && newsData.categories.map((category, index) => (
            <NewsTable key={index} category={category} />
          ))}
        </div>
      </main>
    </div>
  );
}
