# AI 资讯日报网站 - 产品需求文档 (PRD)

## 项目概述
一个展示每日 AI 行业资讯的静态网站，数据来自 cn-ai-news-digest 脚本。

## 页面结构

### 主页面
- **左侧栏**（固定，宽 280px）：历史日期列表，按月分组，点击切换日期
- **主内容区**：
  - 顶部：日期标题 + 数据来源标签
  - 四个分类板块，每个板块是 Markdown 表格样式的新闻列表：
    1. AI大模型 (Foundation Models & Algorithms)
    2. AI软件产品 (Software, Agents & Applications)
    3. AI硬件产品 (Hardware, Chips & Infrastructure)
    4. AI公司股票 (AI Capital, A-Shares & HK Stocks)
  - 每条新闻：标题（可点击跳转原文）、50-80字摘要、来源标签

### 设计风格
- 深色主题（#0a0a0a 背景），科技感
- 左侧栏半透明毛玻璃效果
- 分类标题带对应 emoji 图标
- 响应式：移动端左侧栏折叠为汉堡菜单

## 数据格式

每天的数据存储为 `public/data/YYYY-MM-DD.json`：
```json
{
  "date": "2026-04-05",
  "categories": [
    {
      "name": "AI大模型",
      "name_en": "Foundation Models & Algorithms",
      "emoji": "🧠",
      "articles": [
        {
          "title": "新闻标题",
          "link": "https://...",
          "summary": "50-80字摘要",
          "source": "量子位"
        }
      ]
    }
  ]
}
```

## 技术栈
- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- 数据文件：JSON（每天一个）
- 构建为静态站 (next export)

## 目录结构
```
ai-news-daily/
├── app/
│   ├── layout.tsx
│   ├── page.tsx          # 主页面
│   └── globals.css
├── components/
│   ├── Sidebar.tsx       # 左侧历史列表
│   ├── NewsTable.tsx     # 新闻表格
│   └── CategorySection.tsx
├── lib/
│   └── data.ts           # 数据读取工具
├── public/
│   └── data/             # 每日JSON数据
│       └── 2026-04-05.json
├── scripts/
│   └── generate.ts       # 从 fetch_ai_news.py 输出转换JSON
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 数据生成脚本
需要 `scripts/generate.ts` 脚本：
1. 调用 fetch_ai_news.py 获取数据（或读取已有输出）
2. 转换为网站所需的 JSON 格式
3. 保存到 public/data/ 目录
4. 更新 index.json（所有可用日期列表）
