# IdeaForge — 开发需求文档

> 目标：将一句话的灵感 → 产品分析 → 完整网页 → 可下载交付

---

## 一、产品目标与用户旅程

**最终用户旅程：**

```
输入一句话想法
    → AI 扩写补全描述/痛点/标签
        → 产品形态分析（类型/用户/竞品）
            → 产品方案生成（功能/技术栈/周期）
                → 网页代码生成（落地页 HTML）
                    → 沙盒预览
                        → 下载 HTML / ZIP
```

---

## 二、各阶段完成情况

### ✅ 已完成

| 阶段 | 页面文件 | 表现形式 | 核心内容 |
|------|---------|---------|---------|
| 想法捕获 | `HomePage.tsx` | 弹窗多字段表单 | 标题（必填）+ 描述 + 痛点 + 标签 + 优先级 |
| 想法详情 | `IdeaDetailPage.tsx` | 详情页 + 内联编辑 | 三步进度条、字段编辑、状态管理、备注 |
| 产品形态分析 | `ProductShapePage.tsx` | AI 分析页 + 规则引擎兜底 | 产品类型、平台、目标用户、竞品、差异点 |
| 产品方案生成 | `ProductPlanPage.tsx` | AI 方案页 + 导出 Markdown | MVP 功能、技术栈、周期、商业化、风险、指标 |
| AI 配置中心 | `SettingsPage.tsx` | 设置页 | 多厂商支持、密钥管理、模型/温度配置 |
| 想法库管理 | `HomePage.tsx` | 网格列表 | 搜索、状态/优先级筛选、删除确认 |

### ❌ 待建设（核心缺口）

| 阶段 | 优先级 | 说明 |
|------|-------|------|
| 想法录入优化 | P1 | 当前字段过多，灵感来时填写负担重，详见第三章 |
| 网页代码生成 | P1 | AI 根据产品方案生成落地页 HTML/CSS/JS，核心目标 |
| 沙盒预览 | P2 | iframe 沙盒预览生成的网页 |
| 下载 HTML | P2 | 单文件 HTML 下载（Blob + `a[download]`，无需后端） |
| 下载 ZIP | P3 | 拆分 HTML/CSS/JS 打包下载 |
| 多网页模板 | P3 | 落地页/SaaS 官网/个人项目页等模板选择 |

---

## 三、P1 — 想法录入优化

### 3.1 现状问题

当前弹窗同时展示 5 个字段（标题、描述、痛点、标签、优先级），用户灵感来时只有一句话，面对空白表单填写负担重，容易放弃记录或填写质量低。

**核心问题：把"补充信息"的责任压给了用户，应由 AI 承担。**

### 3.2 优化方案

#### 方案 A：弹窗极简化（高影响 / 低成本，首选）

**改造 `HomePage.tsx` 的新建弹窗：**

- 默认「快速模式」：只显示一个大输入框，placeholder = `"描述你的想法，一句话即可..."`
- 右下角「展开更多」按钮：展开后显示描述/痛点/标签/优先级字段（给有耐心的用户）
- 支持 `Enter` 快捷提交（当前已有，保留）
- 保存按钮文案改为「记录想法」（去掉"并分析"，减少心理压力）

```
┌─────────────────────────────────────┐
│  记录新想法                          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 描述你的想法，一句话即可...  │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                        展开更多 ∨   │
│                                     │
│  [取消]              [记录想法 →]   │
└─────────────────────────────────────┘
```

#### 方案 B：详情页 AI 一键扩写（高影响 / 中成本，配合 A）

进入详情页后，若描述/痛点字段为空，在页面顶部展示 AI 扩写引导卡片：

```
┌─────────────────────────────────────────────────────┐
│  ✦ 想法有点简短，需要 AI 帮你补全细节吗？            │
│  AI 将根据标题推断描述、痛点和标签，你来确认。       │
│                          [暂不需要]  [帮我补全 →]   │
└─────────────────────────────────────────────────────┘
```

**AI 扩写流程：**

1. 调用 `aiService`，以标题为 prompt，生成结构化补全内容
2. 返回 `{ description, problem, tags[] }` JSON
3. 以卡片形式展示 AI 建议，用户逐项「接受 / 修改 / 跳过」
4. 确认后调用 `updateIdea` 写入 store

**新增 prompt 模板（`aiService.ts`）：**

```
你是产品经理助手。用户有一个产品想法：「{title}」
请帮他补全以下信息，用中文，输出 JSON：
{
  "description": "产品是做什么的（2-3句话）",
  "problem": "解决了什么核心痛点",
  "tags": ["标签1", "标签2", "标签3"]
}
```

#### 方案 C：空字段渐进引导（中影响 / 低成本，常驻优化）

详情页空字段不显示"暂无描述"，而是显示轻量引导：

```
产品描述
─────────────────────────────────
暂未填写  ·  [+ 手动添加]  [✦ AI 补全]
```

### 3.3 实施顺序

```
Week 1：方案 A（弹窗极简化）
Week 2：方案 B（AI 扩写）+ aiService 新增 expandIdea 方法
Week 3：方案 C（空字段引导）+ 整合测试
```

---

## 四、P1 — 网页代码生成

### 4.1 功能描述

在产品方案页之后新增第四步「生成网页」，AI 根据产品定位、功能描述、目标用户，生成一个完整的落地页 HTML 文件。

**新增路由：**
```
/idea/:id/webpage   →   WebpageGeneratePage.tsx
```

**流程：**
1. 用户在 `ProductPlanPage` 完成方案后，进度条出现第四步「生成网页」
2. 进入 `WebpageGeneratePage`，展示生成参数（产品名、定位、核心功能、配色偏好）
3. 点击「生成网页」，调用 AI，流式输出 HTML
4. 生成完成后存入 `ideaStore`（`idea.generatedPage: string`）

### 4.2 AI Prompt 设计

```
你是前端开发专家。请根据以下产品信息生成一个完整的单文件落地页 HTML。

产品名称：{title}
产品描述：{description}
核心功能：{mvpFeatures}
目标用户：{targetUsers}
差异化优势：{differentiators}

要求：
- 输出完整的单文件 HTML（内联 CSS，使用 Tailwind CDN）
- 包含：Hero 区、核心功能介绍、目标用户 / 使用场景、行动号召（CTA）
- 现代设计风格，响应式，配色专业
- 不使用任何外部 JS 框架，保持纯 HTML+CSS
- 只输出 HTML 代码，不要任何解释文字
```

### 4.3 数据类型扩展

**`src/types/index.ts` 新增：**

```typescript
export interface GeneratedPage {
  html: string
  generatedAt: string
  version: number
}

// Idea 接口新增字段
export interface Idea {
  // ...现有字段
  generatedPage?: GeneratedPage
}
```

### 4.4 页面结构（`WebpageGeneratePage.tsx`）

```
顶部：进度条第四步高亮

内容区：
  ┌── 生成参数卡片 ──────────────────────┐
  │  产品名、描述（可编辑）              │
  │  配色偏好（下拉：深色/浅色/彩色）    │
  │  网页风格（下拉：落地页/官网/简洁）  │
  └──────────────────────────────────────┘

  [生成网页代码]  （生成中显示流式进度）

  ┌── 生成结果 ──────────────────────────┐
  │  [预览]  [查看代码]  [下载 HTML]     │
  │  ────────────────────────────────    │
  │  iframe 预览 / 代码高亮展示          │
  └──────────────────────────────────────┘
```

---

## 五、P2 — 预览与下载

### 5.1 沙盒 iframe 预览

```tsx
// 在 WebpageGeneratePage 中
<iframe
  srcDoc={generatedPage.html}
  sandbox="allow-scripts"
  style={{ width: '100%', height: 600, border: 'none' }}
  title="网页预览"
/>
```

> `sandbox="allow-scripts"` 允许内联脚本运行，但阻止跨域请求和导航，安全可控。

### 5.2 下载 HTML（单文件）

```typescript
function downloadHTML(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.html`
  a.click()
  URL.revokeObjectURL(url)
}
```

### 5.3 下载 ZIP（拆分资源，P3）

使用 `jszip` 库，将 HTML 拆分为 `index.html` + `style.css` + `script.js` 打包下载。

---

## 六、进度步骤条更新

当前详情页进度为三步，完成网页功能后更新为四步：

```
想法记录  →  产品形态  →  产品方案  →  生成网页
   ✓             ✓           ✓           ○
```

**修改文件：`IdeaDetailPage.tsx`**

```typescript
const steps = [
  { label: '想法记录',  icon: <FileText />,  done: true,                   link: null },
  { label: '产品形态',  icon: <Layers />,    done: !!idea.productShape,    link: `/idea/${id}/shape` },
  { label: '产品方案',  icon: <Sparkles />,  done: !!idea.productPlan,     link: `/idea/${id}/plan` },
  { label: '生成网页',  icon: <Globe />,     done: !!idea.generatedPage,   link: `/idea/${id}/webpage` },
]
```

---

## 七、完整路由规划

| 路由 | 组件 | 状态 |
|------|------|------|
| `/` | `HomePage` | ✅ 已完成 |
| `/idea/:id` | `IdeaDetailPage` | ✅ 已完成 |
| `/idea/:id/shape` | `ProductShapePage` | ✅ 已完成 |
| `/idea/:id/plan` | `ProductPlanPage` | ✅ 已完成 |
| `/idea/:id/webpage` | `WebpageGeneratePage` | ❌ 待建 |
| `/settings` | `SettingsPage` | ✅ 已完成 |

---

## 八、开发路线图

### P1（近期，核心体验）
- [ ] 想法录入弹窗极简化（快速/详细模式切换）
- [ ] `aiService` 新增 `expandIdea` 方法
- [ ] 详情页 AI 扩写引导卡片
- [ ] 详情页空字段轻量引导
- [ ] `WebpageGeneratePage.tsx` 页面骨架
- [ ] `types/index.ts` 新增 `GeneratedPage` 类型
- [ ] `ideaStore` 新增 `updateGeneratedPage` action

### P2（主线功能完整闭环）
- [ ] AI 网页代码生成（接入 aiService）
- [ ] iframe 沙盒预览
- [ ] 下载单文件 HTML
- [ ] 进度步骤条扩展为四步
- [ ] 首页卡片展示"已生成网页"标识

### P3（体验增强）
- [ ] 多模板风格选择（落地页 / SaaS 官网 / 个人项目）
- [ ] 配色主题选择
- [ ] 下载 ZIP 拆分资源
- [ ] 网页版本管理（可重新生成、对比版本）
- [ ] 对话式想法引导（AI 多轮提问）
- [ ] 想法分享链接

---

## 十、多端同步 — Supabase 配置指南

### 10.1 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)，注册并新建项目
2. 进入 **Project Settings → API**，复制：
   - `Project URL`（形如 `https://xxx.supabase.co`）
   - `anon public` Key
3. 填入项目根目录的 `.env.local`：
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxx...
   ```

### 10.2 建表 SQL（在 Supabase SQL Editor 中执行）

```sql
create table public.ideas (
  id           text primary key,
  user_id      uuid references auth.users not null default auth.uid(),
  title        text not null default '',
  description  text not null default '',
  problem      text not null default '',
  tags         text[] not null default '{}',
  status       text not null default 'draft',
  priority     text not null default 'medium',
  product_shape  jsonb,
  product_plan   jsonb,
  generated_page jsonb,
  notes        text not null default '',
  created_at   text not null,
  updated_at   text not null
);

-- 开启行级安全（RLS）
alter table public.ideas enable row level security;

-- 用户只能读写自己的数据
create policy "用户只能访问自己的想法"
  on public.ideas
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 10.3 关键逻辑说明

| 时机 | 行为 |
|------|------|
| 用户登录后 | `syncFromCloud` 拉取云端数据，与本地以 `updatedAt` 合并 |
| 每次新增/编辑/删除 | 异步 `upsertIdeaToCloud` / `deleteIdeaFromCloud`，不阻塞 UI |
| Supabase 未配置 | 降级为纯本地模式，不要求登录，行为与改造前完全相同 |
| 登录后合并冲突 | 同 id 取 `updatedAt` 最新的版本，不存在同 id 则两边都保留 |

### 10.4 未配置时的降级行为

`isSupabaseConfigured()` 返回 `false` 时：
- 路由守卫放行，不跳转到登录页
- 所有云同步函数提前返回，不发任何网络请求
- 应用完全离线可用，与改造前行为一致

---

## 九、文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types/index.ts` | 修改 | 新增 `GeneratedPage`，`Idea` 新增 `generatedPage?` |
| `src/store/ideaStore.ts` | 修改 | 新增 `updateGeneratedPage` action |
| `src/services/aiService.ts` | 修改 | 新增 `expandIdea`、`generateWebpage` 方法 |
| `src/pages/HomePage.tsx` | 修改 | 录入弹窗极简化 |
| `src/pages/IdeaDetailPage.tsx` | 修改 | 进度步骤扩展为四步，空字段引导 |
| `src/pages/WebpageGeneratePage.tsx` | 新建 | 网页生成、预览、下载 |
| `src/App.tsx` | 修改 | 新增 `/idea/:id/webpage` 路由 |
