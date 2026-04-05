'use client';

import { useState, useEffect } from 'react';

interface SidebarProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
}

export default function Sidebar({ selectedDate, onChangeDate }: SidebarProps) {
  const [dates, setDates] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetch('/data/index.json')
      .then(res => res.json())
      .then(data => setDates(data.dates || []))
      .catch(console.error);
  }, []);

  // Group dates by month
  const groupedDates = dates.reduce((acc: Record<string, string[]>, date) => {
    const month = date.slice(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(date);
    return acc;
  }, {});

  const getWeekday = (date: string) => {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const d = new Date(date);
    return weekdays[d.getDay()];
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-slate-900/80 backdrop-blur border-r border-slate-800 transition-transform duration-300 z-40 ${
          isOpen || !isMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            🤖 AI 资讯日报
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            每日 AI 行业新闻汇总
          </p>

          <div className="space-y-4">
            {Object.entries(groupedDates)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([month, monthDates]) => (
                <div key={month}>
                  <h2 className="text-sm font-semibold text-slate-400 mb-2">
                    {month}
                  </h2>
                  <ul className="space-y-1">
                    {monthDates
                      .sort((a, b) => b.localeCompare(a))
                      .map((date) => (
                        <li key={date}>
                          <button
                            onClick={() => {
                              onChangeDate(date);
                              if (isMobile) setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              selectedDate === date
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{date}</span>
                              <span className="text-xs opacity-60">
                                {getWeekday(date)}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
