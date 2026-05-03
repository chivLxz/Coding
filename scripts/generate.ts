import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface RawArticle {
  title: string;
  link: string;
  summary: string;
  source: string;
  category: string;
}

interface Category {
  name: string;
  name_en: string;
  emoji: string;
  articles: RawArticle[];
}

const categoryMapping: Record<string, { name: string; name_en: string; emoji: string }> = {
  'AI大模型': { name: 'AI大模型', name_en: 'Foundation Models & Algorithms', emoji: '🧠' },
  'AI软件产品': { name: 'AI软件产品', name_en: 'Software, Agents & Applications', emoji: '💻' },
  'AI硬件产品': { name: 'AI硬件产品', name_en: 'Hardware, Chips & Infrastructure', emoji: '🔧' },
  'AI公司股票': { name: 'AI公司股票', name_en: 'AI Capital, A-Shares & HK Stocks', emoji: '📈' },
};

export interface Article {
  title: string;
  link: string;
  summary: string;
  source: string;
}

export interface CategoryData {
  name: string;
  name_en: string;
  emoji: string;
  articles: Article[];
}

export interface NewsData {
  date: string;
  categories: CategoryData[];
}

export interface IndexData {
  dates: string[];
}

function getTodayDate(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];
  return dateStr;
}

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateNewsData(): NewsData {
  const date = getTodayDate();

  const categories: CategoryData[] = Object.entries(categoryMapping).map(
    ([key, config]) => ({
      name: config.name,
      name_en: config.name_en,
      emoji: config.emoji,
      articles: [],
    })
  );

  return {
    date,
    categories,
  };
}

function saveNewsData(data: NewsData, date?: string): string {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  ensureDirectoryExists(dataDir);

  const fileName = date || data.date;
  const filePath = path.join(dataDir, `${fileName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  return filePath;
}

function updateIndex(date: string): void {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  ensureDirectoryExists(dataDir);

  const indexPath = path.join(dataDir, 'index.json');
  let indexData: IndexData = { dates: [] };

  if (fs.existsSync(indexPath)) {
    try {
      const content = fs.readFileSync(indexPath, 'utf-8');
      indexData = JSON.parse(content);
    } catch (error) {
      console.error('Error reading index.json:', error);
    }
  }

  if (!indexData.dates.includes(date)) {
    indexData.dates.push(date);
    indexData.dates.sort((a, b) => b.localeCompare(a));
  }

  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
}

function generate(): void {
  console.log('Generating AI news data...');

  const newsData = generateNewsData();
  const filePath = saveNewsData(newsData);
  console.log(`News data saved to: ${filePath}`);

  updateIndex(newsData.date);
  console.log('Index updated successfully');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'update-index') {
    // Usage: npx tsx scripts/generate.ts update-index 2026-04-09
    const date = args[1];
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error('Usage: npx tsx scripts/generate.ts update-index YYYY-MM-DD');
      process.exit(1);
    }
    updateIndex(date);
    console.log(`Index updated with ${date}`);
  } else if (command === 'fix-index') {
    // Validate and fix index.json format
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const indexPath = path.join(dataDir, 'index.json');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        // Fix: convert plain array to { dates: [...] }
        const fixed: IndexData = { dates: parsed };
        fs.writeFileSync(indexPath, JSON.stringify(fixed, null, 2), 'utf-8');
        console.log(`Fixed index.json: converted plain array to { dates: [...] } with ${parsed.length} dates`);
      } else if (parsed.dates && Array.isArray(parsed.dates)) {
        console.log('index.json format is correct, no fix needed');
      } else {
        console.error('index.json has unexpected format:', typeof parsed);
      }
    } else {
      console.error('index.json not found');
    }
  } else {
    generate();
  }
}

export { generateNewsData, saveNewsData, updateIndex };
