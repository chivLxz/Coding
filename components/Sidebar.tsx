'use client';

import { useState, useEffect } from 'react';
import { groupDatesByMonth, getWeekday } from '@/lib/data';

interface SidebarProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ selectedDate, onChangeDate, isOpen, onClose }: SidebarProps) {
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    fetch('/data/index.json')
      .then(res => res.json())
      .then(data => {
        // data is either { dates: [...] } or [...] (array)
        const dateList = Array.isArray(data) ? data : (data?.dates || []);
        setDates(dateList);
      })
      .catch(console.error);
  }, []);

  const groupedDates = groupDatesByMonth(dates);

  const handleSelect = (date: string) => {
    onChangeDate(date);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Desktop Sidebar - slides from left on md+ */}
      <aside
        className={`fixed left-0 top-0 h-full w-[280px] bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80 z-50 transition-transform duration-300 ease-out md:flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent
          selectedDate={selectedDate}
          groupedDates={groupedDates}
          onSelect={handleSelect}
        />
      </aside>

      {/* Mobile Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        <div className="bg-slate-900/98 backdrop-blur-xl border-t border-slate-700/50 rounded-t-2xl flex flex-col" style={{ maxHeight: '70vh' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60 shrink-0">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span>选择日期</span>
            </h3>
            <button
              onClick={onClose}
              className="touch-target text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
            <SidebarDateList
              selectedDate={selectedDate}
              groupedDates={groupedDates}
              onSelect={handleSelect}
              mobile
            />
          </div>
        </div>
      </div>
    </>
  );
}

function SidebarContent({
  selectedDate,
  groupedDates,
  onSelect,
}: {
  selectedDate: string;
  groupedDates: Record<string, string[]>;
  onSelect: (date: string) => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="p-6 pb-4 border-b border-slate-800/60 shrink-0">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span>AI 资讯日报</span>
        </h1>
        <p className="text-slate-500 text-xs mt-1.5">每日 AI 行业新闻汇总</p>
      </div>

      {/* Date List */}
      <div className="flex-1 overflow-y-auto p-4">
        <SidebarDateList
          selectedDate={selectedDate}
          groupedDates={groupedDates}
          onSelect={onSelect}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/60 shrink-0">
        <p className="text-slate-600 text-xs text-center">
          Powered by AI News Daily
        </p>
      </div>
    </>
  );
}

function SidebarDateList({
  selectedDate,
  groupedDates,
  onSelect,
  mobile = false,
}: {
  selectedDate: string;
  groupedDates: Record<string, string[]>;
  onSelect: (date: string) => void;
  mobile?: boolean;
}) {
  return (
    <div className="space-y-5">
      {Object.entries(groupedDates)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, monthDates]) => (
          <div key={month}>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
              {month}
            </h2>
            {mobile ? (
              <div className="grid grid-cols-3 gap-2">
                {monthDates
                  .sort((a, b) => b.localeCompare(a))
                  .map(date => (
                    <button
                      key={date}
                      onClick={() => onSelect(date)}
                      className={`touch-target rounded-xl text-center py-3 transition-all duration-150 ${
                        selectedDate === date
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-sm font-medium">{date.slice(8)}</div>
                      <div className={`text-[10px] mt-0.5 ${selectedDate === date ? 'text-blue-200' : 'text-slate-500'}`}>
                        {getWeekday(date)}
                      </div>
                    </button>
                  ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {monthDates
                  .sort((a, b) => b.localeCompare(a))
                  .map(date => (
                    <li key={date}>
                      <button
                        onClick={() => onSelect(date)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 ${
                          selectedDate === date
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{date}</span>
                          <span className={`text-xs ${selectedDate === date ? 'text-blue-200' : 'opacity-50'}`}>
                            {getWeekday(date)}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        ))}
    </div>
  );
}
