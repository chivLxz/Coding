'use client';

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

interface NewsTableProps {
  category: Category;
}

const categoryColors: Record<string, string> = {
  'AI大模型': 'bg-blue-600',
  'AI软件产品': 'bg-green-600',
  'AI硬件产品': 'bg-orange-600',
  'AI公司股票': 'bg-red-600',
};

export default function NewsTable({ category }: NewsTableProps) {
  const colorClass = categoryColors[category.name] || 'bg-slate-600';

  return (
    <div className="mb-8">
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{category.emoji}</span>
        <h2 className="text-xl font-bold text-white">
          {category.name}
        </h2>
        <span className={`px-2 py-1 text-xs font-semibold text-white rounded ${colorClass}`}>
          {category.name_en}
        </span>
        <span className="text-slate-400 text-sm">
          ({category.articles.length})
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300 w-12">#</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">标题</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300">摘要</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-slate-300 w-24">来源</th>
            </tr>
          </thead>
          <tbody>
            {category.articles.map((article, index) => (
              <tr
                key={index}
                className="border-b border-slate-800 hover:bg-slate-700/50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-slate-400">
                  {index + 1}
                </td>
                <td className="py-3 px-4">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    {article.title}
                    <span className="text-slate-500 text-xs ml-1">↗</span>
                  </a>
                </td>
                <td className="py-3 px-4 text-sm text-slate-300">
                  {article.summary}
                </td>
                <td className="py-3 px-4 text-sm text-slate-400">
                  {article.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
