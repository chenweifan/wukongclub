# 黑神话悟空 · 非官方粉丝互动站

> **非官方粉丝作品**：本站与游戏科学（Game Science）及其关联方无隶属关系。
> 《黑神话：悟空》的名称、角色、美术与音乐等版权归游戏科学所有，本项目仅用于学习与交流。
> 站内全部数据均由本地 Mock（MSW + Dexie/IndexedDB）生成，**没有任何真实后端**。

一个「演示优先」的纯前端 SPA：内置 DEMO 演示系统，让评审用一条 URL 复现任意界面状态
（身份 / 空态 / 加载 / 错误 / 断网 / 主题 / 剧透 / 数据快照）。

---

## 快速开始

```bash
npm install
npm run dev          # http://127.0.0.1:5173
```

| 脚本                | 说明                         |
| ------------------- | ---------------------------- |
| `npm run dev`       | 启动开发服务器               |
| `npm run build`     | 类型检查 + 生产构建          |
| `npm run typecheck` | 仅类型检查（`tsc --noEmit`） |
| `npm run lint`      | ESLint（0 warning 容忍）     |
| `npm run format`    | Prettier 格式化              |
| `npm test`          | Vitest 单测 + 路由集成测试   |

## 技术栈（协议锁定）

Vite · React 18 · TypeScript(strict) · react-router-dom v6 Data Router ·
@tanstack/react-query · zustand(persist) · Tailwind CSS + CSS 变量令牌 ·
Radix 无样式原语 · framer-motion · TipTap · react-virtual · ECharts · dnd-kit ·
MSW + faker · Dexie · lz-string · html-to-image · driver.js · Vitest + Playwright · Storybook

> 依赖按阶段推进逐步引入：当前（阶段 0）只安装骨架与测试所必需的包，
> 阶段 1/2/3 会依次引入 MSW、Dexie、Radix、framer-motion 等，不新增清单外依赖。

## 目录结构

```
src/
├─ app/          路由表、Provider 组合、布局、主题与守卫
├─ pages/        页面组装（每个路由一个目录）
├─ features/     业务特性（features 之间禁止互相 import）
├─ entities/     跨特性共享的领域模型与组件
├─ components/   ui（无业务语义）/ business（含业务语义）
├─ data/         contracts / repositories / mocks / db / seeds  ← 所有数据的唯一出口
├─ demo/         演示系统：scenarios / tours / fixtures（阶段 1）
├─ stores/       zustand 客户端状态
├─ hooks/        通用 hooks
├─ utils/        纯函数工具与集中文案
├─ styles/       tokens.css（设计令牌）+ globals.css
└─ assets/
```

依赖方向严格单向：`pages → features → entities → components/ui → data`。

## 架构铁律（摘要）

1. 业务代码**永不直接调用 fetch/axios**，只依赖 `src/data/repositories`。
2. 跨层数据必须有 TS 类型契约，定义在 `src/data/contracts/`。
3. 异步 UI 一律用 `<StateBoundary>` 包裹（阶段 1 交付），页面内不散写 `if (loading)`。
4. 颜色/间距/圆角/阴影只用 CSS 变量令牌；用户可见文案集中在 `src/utils/copy.ts`。
5. 破坏性操作二次确认；写操作持久化前缀统一 `hmw:`。
6. 严禁 `any` / `@ts-ignore`；不确定类型用 `unknown` + 类型守卫。
7. 每个 UI 组件配 Storybook story，关键纯函数配 Vitest 单测。

## 主题令牌

三套主题共用同一组语义变量，切换 `<html data-theme>` 即可整体换肤：

| 主题   | `data-theme` | 定位                                   |
| ------ | ------------ | -------------------------------------- |
| 墨黑   | `ink`        | 默认，深色主体 + 鎏金强调              |
| 宣纸   | `paper`      | 浅色阅读（鎏金压深以保证对比度）       |
| 高对比 | `contrast`   | 无障碍：纯黑白、2px 边框、关闭噪点投影 |

基础令牌：`--hmw-ink` `--hmw-ink-2` `--hmw-gold` `--hmw-gold-hi` `--hmw-cinnabar`
`--hmw-paper` `--hmw-jade` `--radius-scroll` `--shadow-seal`。

## 阶段 0 临时验证手段

阶段 0 的 `DemoProvider` 是空实现（演示控制台属于阶段 1）。若想查看 `/admin` 放行后的后台布局，
可在浏览器控制台执行：

```js
localStorage.setItem('hmw:demo-role', 'admin'); // 可选值：guest/newbie/active/moderator/admin/banned
location.reload();
```

阶段 1 会用 DemoConsole + URL query 取代这层临时兜底，该 localStorage 键会被移除。

## 进度

| 阶段 | 内容                                                                                     | 状态      |
| ---- | ---------------------------------------------------------------------------------------- | --------- |
| 0    | 项目骨架（工程配置 / 目录 / 令牌三主题 / Providers / 路由守卫 / 三布局 / 占位页 / Home） | ✅ 已交付 |
| 1    | DEMO 演示系统（URL 双向同步 / StateBoundary / 葫芦控制台 / 场景 / 引导 / 快照）          | 待开始    |
| 2    | 核心业务：用户成长 → 影神图 → 资讯 → 攻略 → 论坛 → 个人主页                              | 未开始    |
| 3    | 高级功能：配装模拟器 → 互动地图 → 收集追踪 → 二创 → 活动 → 灵蕴商城 → 后台               | 未开始    |
| 4    | 审查 / 重构 / E2E / 性能 / 交付文档                                                      | 未开始    |
