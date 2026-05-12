# IdeaForge — 想法 → 产品

> 把脑海中的灵感，锻造成可落地的产品方案。

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

## 简介

IdeaForge 是一个本地运行的**产品想法管理工具**。记录你的灵感，通过 AI 分析产品形态、生成完整的开发方案，帮助你把想法快速转化为可执行的产品计划。

## 功能特性

- **想法记录** — 快速捕捉灵感，支持标题、描述、核心痛点、标签、优先级管理
- **产品形态分析** — 自动识别产品类型（Web / 移动 / SaaS / 工具等）、目标用户、竞品格局、差异化优势
- **产品方案生成** — 输出 MVP 功能清单、V1.0 规划、未来路线图、技术栈选型、开发周期估算、商业模式、风险提示、成功指标
- **AI 驱动** — 支持多种 AI 模型，国内免费可用（智谱 GLM-4-Flash / 硅基流动）
- **状态跟踪** — 草稿 → 分析中 → 已规划 → 开发中 → 已完成
- **Markdown 导出** — 一键导出完整产品方案文档

## 快速开始

```bash
# 克隆项目
git clone https://github.com/YOUR_USERNAME/idea-forge.git
cd idea-forge

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

## 使用流程

```
记录想法 → 产品形态分析 → 产品方案生成 → 导出 Markdown
```

1. **记录想法** — 首页点「新建想法」，填写标题、描述、核心痛点和标签
2. **分析产品形态** — 进入详情页，点「分析产品形态」，AI 自动分析并可手动调整
3. **生成产品方案** — 点「生成产品方案」，获取 MVP / 技术栈 / 商业模式完整规划
4. **导出文档** — 点「导出为 Markdown」，保存 `.md` 文件供后续开发参考

## AI 模型配置

点击右上角 ⚙️ 进入设置页，支持以下模型：

### 免费可用（国内直连）

| 服务商 | 模型 | 费用 | 获取地址 |
|--------|------|------|---------|
| 智谱 AI | GLM-4-Flash ⭐ | **永久免费，不限次数** | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) |
| 智谱 AI | GLM-4-Flash（最新版）| 永久免费 | [open.bigmodel.cn](https://open.bigmodel.cn/usercenter/apikeys) |
| 硅基流动 | Qwen2.5 7B ⭐ | 注册送 14 元 | [cloud.siliconflow.cn](https://cloud.siliconflow.cn/account/ak) |
| 硅基流动 | DeepSeek V2.5 | 注册送 14 元 | [cloud.siliconflow.cn](https://cloud.siliconflow.cn/account/ak) |

### 付费模型

| 服务商 | 推荐模型 | 特点 |
|--------|---------|------|
| DeepSeek | DeepSeek V3 | 国产，价格极低 |
| 月之暗面 | Moonshot v1-32k | 中文理解优秀 |
| 通义千问 | Qwen Max | 阿里云，中文最强 |
| OpenAI | GPT-4o | 全球最强，需科学上网 |

> API Key 仅存储在本地浏览器，不会上传至任何服务器。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5 | 类型安全 |
| Vite | 8 | 构建工具 |
| Tailwind CSS | 4 | 样式方案 |
| Zustand | 5 | 状态管理 + localStorage 持久化 |
| React Router | 7 | 客户端路由 |
| Lucide React | latest | 图标库 |

## 项目结构

```
src/
├── pages/
│   ├── HomePage.tsx          # 想法列表页
│   ├── IdeaDetailPage.tsx    # 想法详情/编辑页
│   ├── ProductShapePage.tsx  # 产品形态分析页
│   ├── ProductPlanPage.tsx   # 产品方案生成页
│   └── SettingsPage.tsx      # AI 模型设置页
├── services/
│   └── aiService.ts          # AI API 调用封装
├── store/
│   ├── ideaStore.ts          # 想法数据管理
│   └── settingsStore.ts      # AI 设置管理
├── types/
│   ├── index.ts              # 核心数据类型
│   └── ai.ts                 # AI 相关类型
└── utils/
    └── productAnalyzer.ts    # 规则引擎（AI 降级方案）
```

## 数据说明

所有数据保存在浏览器 `localStorage`，无需后端，完全离线可用。

- 想法数据：`idea-forge-storage`
- AI 设置：`idea-forge-settings`

## License

MIT
