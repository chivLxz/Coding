'use client';

import { useState, useEffect, useRef } from 'react';
import { groupDatesByMonth, getWeekday } from '@/lib/data';

interface BottomNavProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
}

export default function BottomNav({ selectedDate, onChangeDate }: BottomNavProps) {
  const [dates, setDates] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetch('/data/index.json')
      .then(res => res.json())
      .then(data => {
        const dateList = Array.isArray(data) ? data : (data?.dates || []);
        setDates(dateList);
      })
      .catch(console.error);
  }, []);

  const groupedDates = groupDatesByMonth(dates);

  const handleSelect = (date: string) => {
    onChangeDate(date);
    setShowDatePicker(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar - Mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-header border-t border-slate-800/60 pb-safe">
        <div className="flex items-center justify-around h-14">
          <button
            onClick={() => setShowDatePicker(true)}
            className="touch-target flex flex-col items-center gap-0.5 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px]">{selectedDate.slice(5)}</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('category-AI大模型');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="touch-target flex flex-col items-center gap-0.5 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-base">🤖</span>
            <span className="text-[10px]">大模型</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('category-AI软件产品');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="touch-target flex flex-col items-center gap-0.5 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-base">💻</span>
            <span className="text-[10px]">软件</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('category-AI硬件产品');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="touch-target flex flex-col items-center gap-0.5 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-base">🔧</span>
            <span className="text-[10px]">硬件</span>
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('category-AI公司股票');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="touch-target flex flex-col items-center gap-0.5 text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-base">📈</span>
            <span className="text-[10px]">股票</span>
          </button>
        </div>
      </nav>

      {/* Date Picker Bottom Sheet */}
      {showDatePicker && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50 md:hidden"
            onClick={() => setShowDatePicker(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/98 backdrop-blur-xl border-t border-slate-700/50 rounded-t-2xl bottom-sheet-enter pb-safe max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
              <h3 className="text-base font-semibold text-white">选择日期</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="touch-target text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
              <div className="space-y-5">
                {Object.entries(groupedDates)
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .map(([month, monthDates]) => (
                    <div key={month}>
                      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                        {month}
                      </h2>
                      <div className="grid grid-cols-3 gap-2">
                        {monthDates
                          .sort((a, b) => b.localeCompare(a))
                          .map(date => (
                            <button
                              key={date}
                              onClick={() => handleSelect(date)}
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
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
