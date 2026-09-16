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

> 依赖按阶段推进逐步引入。**阶段 1 已引入**：msw、@faker-js/faker、dexie、
> framer-motion、driver.js、@radix-ui/react-dialog、@radix-ui/react-switch，
> 以及开发期的 fake-indexeddb（jsdom 没有 IndexedDB，Dexie 与 MSW 链路需要它才能测）。
> 阶段 2/3 会继续引入 TipTap、react-virtual、ECharts、dnd-kit、lz-string、html-to-image，
> 全部来自协议清单，不新增清单外依赖。

## 目录结构

```
src/
├─ app/          路由表、Provider 组合、布局、主题与守卫
├─ pages/        页面组装（每个路由一个目录）
├─ features/     业务特性（features 之间禁止互相 import）
├─ entities/     跨特性共享的领域模型与组件
├─ components/   ui（无业务语义）/ business（含业务语义）
├─ data/         contracts / repositories / mocks / db / seeds  ← 所有数据的唯一出口
├─ demo/         演示系统：store / urlState / scenarios / tours / console / panels / snapshot
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

## DEMO 演示系统（阶段 1）

「演示优先」是这个项目的核心卖点：**任何界面状态都能用一条 URL 复现**。
右下角葫芦打开演示控制台；所有开关都会实时写回地址栏（`replaceState`，不污染浏览器历史）。

### URL 参数

| 参数      | 取值                                                   | 说明                         |
| --------- | ------------------------------------------------------ | ---------------------------- |
| `demo`    | `1` / `0`                                              | 进入演示模式（含控制台）     |
| `role`    | `guest` `newbie` `active` `moderator` `admin` `banned` | 身份，决定权限与可见内容     |
| `ui`      | `normal` `empty` `loading` `error` `slow` `offline`    | 覆盖所有异步 UI 的状态       |
| `theme`   | `ink` `paper` `contrast`                               | 主题                         |
| `spoiler` | `1` / `0`                                              | 剧透开关                     |
| `seed`    | 整数                                                   | 种子数据随机种子（可复现）   |
| `time`    | ISO 时间                                               | 冻结时间                     |
| `tour`    | `first-visit` `console-guide`                          | 自动启动的引导剧本           |
| `clean`   | `1` / `0`                                              | 截图模式：隐藏控制台与提示条 |
| `grid`    | `1` / `0`                                              | 布局栅格                     |
| `record`  | `1`                                                    | 记录操作路径（内存，可导出） |

示例：

```
/?demo=1&role=admin&ui=offline&theme=contrast&spoiler=0&seed=666&clean=1
/?demo=1&tour=first-visit
```

> 演示模式开启时所有字段都会显式写进 URL（链接自描述，换台机器打开结果一致）；
> 关闭时演示参数会被摘掉，且**不会**动 `?build=...` 这类第三方参数。

### 控制台分区

身份 · 界面状态 · 主题 · 剧透 · 数据（重置 / 填满 / 清空 / 导出快照 / 导入快照）·
引导（剧本 + 启动）· 场景（预设 + 应用）· 工具（栅格 / 组件边界 / 性能面板 / 复制演示链接 / 操作记录）。

### 预设场景

| id              | 名称       | 说明                                       |
| --------------- | ---------- | ------------------------------------------ |
| `first-visit`   | 首次到访   | 基线数据 + 跨页引导                        |
| `spoiler-free`  | 零剧透浏览 | 剧透全关、宣纸主题，适合分享给未通关的朋友 |
| `build-master`  | 配装大师   | 直奔配装模拟器 + 满量数据                  |
| `moderate-flow` | 版主值班   | 版主身份进论坛，预演审核动线               |
| `empty-launch`  | 空数据首启 | 清空全部本地数据，检查空态                 |
| `chaos`         | 混沌故障   | 断网 + 封禁 + 高对比 + 栅格，压满异常态    |
| `event-season`  | 赛季活动   | 活动中心 + 满量数据                        |

场景切换 = 应用状态 patch + 可选重置种子数据 + 跳转路由 + 可选启动引导。
链接复现的是**状态**；要连数据一起复现，请用快照导入导出（两者互补）。

### 引导剧本

- `first-visit`：八步走完站点骨架，中途跨页跳转（`/` → `/wiki` → `/`）再回来。
- `console-guide`：控制台六个分区逐个讲解（启动时自动展开控制台）。

键盘 `←` `→` 翻页、`Esc` 退出；步骤只写路由与选择器，文案集中在
`src/demo/fixtures/tourCopy.ts`。单测会校验每个 `data-tour` 锚点在源码里真实存在。

### 数据快照

导出内容：`{ version, app, exportedAt, demoState, db, ls }` ——
`db` 是 Dexie 全量，`ls` 只含 `hmw:` 前缀的本地存储。
导入会校验版本与结构，脏记录被逐条过滤，非 `hmw:` 键一律拒绝写入。

### 演示系统如何接管数据

- `<StateBoundary>`：所有异步 UI 的统一边界。它优先服从 `uiState`
  （`error` / `offline` / `loading` / `empty` 直接覆盖），`normal` / `slow` 则回落到真实查询状态。
- `mockDelay()` / `mockError()`：所有 MSW handler 必须先 `mockError()` 再 `await mockDelay()`；
  `slow` 注入 3–5s 延迟，`offline` 抛 `HttpError(0)`，`error` 抛 `HttpError(500, '灵蕴紊乱')`。
- 已知架构例外：`src/data/mocks/**` 允许读取 `demoStore`（协议 6.3 的写法就是
  `useDemoStore.getState()`）。除此之外数据层不认识演示状态。
- 首页底部的「演示系统自检 · 探针列表」是阶段 1 的验收实物：它真实走
  Repository → MSW → IndexedDB，可勾选（写操作持久化），也会被快照一起备份。
  阶段 2 起会被真实业务列表取代。

## 组件文档（Storybook）

```bash
npm run storybook         # http://localhost:6006
npm run build-storybook   # 静态站点输出到 storybook-static/（已 gitignore）
```

- **42 个组件 / 202 个 story**，与源码同目录（`Component.stories.tsx`），组件搬家时 story 跟着走。
- 每个组件都覆盖它真正拥有的形态：`default` / `loading` / `empty` / `error` / 极端长文本；
  没有这些形态的组件（例如纯展示的占位页）会在 story 文件头注明原因，而不是硬凑。
- 工具栏可切三套主题：写的是 `demoStore.theme`，与页面内切换是同一个状态源。
- 装饰器把 story 放进**与应用一致的上下文**：QueryClient、ThemeProvider、MemoryRouter、
  演示状态、以及 MSW Mock 后端（`mockServiceWorker.js` 通过 `staticDirs` 提供）。
  所以「演示探针面板」的 story 跑的是真实的 Repository → MSW → IndexedDB 链路，
  而不是把数据塞成 props。
- 用 `parameters.demo` 预置演示状态：

  ```tsx
  export const OfflineOverride: Story = {
    args: { query: successQuery },
    parameters: { demo: { state: { enabled: true, uiState: 'offline' } } },
  };
  ```

- 已装 `@storybook/addon-a11y`：每个 story 都能在面板里查看对比度、语义与键盘问题。

## 阶段 2 · 用户成长与登录（模块 1/6）

登录注册 → 天命人名片 → 土地庙上香 → 任务中心 → 消息中心，全部走真实链路
（Repository → MSW → Dexie），没有一条是把数据塞进组件的 shortcuts。

### 功能与接口

| 功能             | 接口                                                                                             | 说明                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| 注册 / 登录      | `POST /api/auth/register`、`POST /api/auth/login`                                                | 校验规则前后端共用一份（`data/contracts/user.ts`）   |
| 演示账号一键登录 | `POST /api/auth/demo-login`                                                                      | 演示站专用；账号不存在时自动创建                     |
| 当前用户         | `GET /api/auth/me`                                                                               | 令牌失效或被清库时返回 401，前端回落未登录           |
| 上香签到         | `GET/POST /api/growth/check-in`                                                                  | 同一天只能签一次（服务端按日期键保证，重复点击 409） |
| 任务             | `GET /api/growth/tasks`、`POST /api/growth/tasks/:id/claim`                                      | 每日/周常按周期键自动重置；进度由真实行为推导        |
| 消息             | `GET /api/notifications`、`POST /api/notifications/:id/read`、`POST /api/notifications/read-all` | 分类 + 仅未读 + 未读红点                             |

### 演示用法：身份联动登录态

演示模式下，控制台的身份会单向联动登录态 —— 这让「已登录的成长中心」也能被一条 URL 复现：

| `role`                                      | 登录态           | 打开 `/user` 看到             |
| ------------------------------------------- | ---------------- | ----------------------------- |
| `guest`                                     | 未登录           | 「尚未登录」引导 + 去登录按钮 |
| `newbie` / `active` / `moderator` / `admin` | 自动登录演示账号 | 名片 + 签到 + 任务 + 消息     |
| `banned`                                    | 未登录           | 「账号处于封禁状态」说明      |

```
/user?demo=1&role=active          # 直接落到成长中心
/user?demo=1&role=guest           # 未登录引导
/user?demo=1&role=banned&ui=offline
```

> 未开启演示模式时（普通浏览）**永远不会**改动访客自己的登录态。

### 种子与规则

- 演示账号：`tianming / hmw-demo`（登录页直接给出），附 4/8 个章节徽章与修为。
- 签到历史：42 天（faker 固定 seed），最近 6 天连续、更早稀疏 —— 日历的连续段与断点都有真实数据。
- 奖励曲线：基础 10 + 连续加成 2/天，封顶 40（`utils/checkInRules.ts`，含边界单测）。
- 修行境界：凡体 → 山门客 → 行者 → 降妖者 → 大圣 → 齐天，由修为纯函数推导。
- 任务进度不是写死的：**签到会让「土地庙上香」变成可领取**，领取后灵蕴与修为同时入账。

### 会话与令牌

- 令牌存在 localStorage（`hmw:auth-token`），由 `httpClient` 统一注入请求头，**只有一处**写入。
- 会话 store 不持久化：刷新时用令牌换回用户，服务端删号后不会留下幽灵账号。
- 登出即使请求失败也会清掉本地令牌（`finally` 语义），不会卡在「登不出去」。

## 阶段 2 · 影神图百科（模块 2/6）

48 条词条（妖王 / 妖怪 / 人物 / 地点，覆盖六个章节），卡片墙 + 筛选 + 详情抽屉 + 关联图谱 + 对比。

### 功能与接口

| 功能     | 接口                              | 说明                                                          |
| -------- | --------------------------------- | ------------------------------------------------------------- |
| 词条列表 | `GET /api/wiki/entries`           | 章节 / 类型 / 稀有度 / 关键词 / 排序 / 分页**都在服务端**完成 |
| 词条详情 | `GET /api/wiki/entries/:id`       | 不存在返回 404                                                |
| 关联图谱 | `GET /api/wiki/entries/:id/graph` | 中心词条 + 一跳邻居 + 连线（反向邻接也会连上）                |
| 收藏     | `GET/POST /api/wiki/favorites`    | 已登录按账号、未登录按设备；两者共用一张表                    |

### 筛选状态在 URL 上

筛选与搜索参数（`wikiChapter` / `wikiCategory` / `wikiRarity` / `wikiSearch` / `wikiSort`）
写在 URL 里，因此**某一组筛选结果可以直接分享**：

```
/wiki?wikiCategory=boss&wikiRarity=5        # 五星妖王
/wiki?wikiSearch=hfs                        # 拼音首字母搜索
/wiki?wikiChapter=6&wikiSort=rarity         # 第六章按稀有度排
```

> 参数名统一加 `wiki` 前缀，与演示参数互不干扰（DemoProvider 回写 URL 时保留不认识的参数）。
> 搜索框用 250ms 防抖写入，避免每敲一个字就写一次地址栏。

### 搜索与高亮

- 匹配面：名称、别名、简介、全拼、拼音首字母、章节名。
- **拼音随词条入库**（`pinyin` / `aliasPinyin`）：技术栈清单里没有拼音库，
  而中文转拼音需要额外依赖，因此种子直接带上拼音，并由单测守住「音节数 === 汉字数」。
- 高亮与搜索共用同一套规则：搜 `hfs` 时标出的是「黑风山」三个字，而不是拼音本身。
- 相关度分档（精确名 1000 > 前缀 300 > 包含 150 …）保证搜「黑风山」时黑风山排第一 ——
  这条是实装后被单测抓出来的：原版权重让「别名命中两次」的妖王压过了地名本身。

### 性能与交互取舍

- **卡片墙按行虚拟化**（`@tanstack/react-virtual`）：48 张带图卡片不会一次性进 DOM；
  行内卡片高度不一，用 `measureElement` 动态测量。列数由 matchMedia 断点决定。
- **ECharts 按需**：只注册 Graph + Tooltip + Canvas 渲染器，且图谱组件用 `React.lazy` 加载 ——
  520 kB 的 echarts chunk 只在打开详情抽屉时才下载，百科页首屏不受影响。
- **颜色仍走令牌**：canvas 拿不到 CSS 变量，因此启动时从 `:root` 读一次令牌
  （`utils/themeTokens.ts`），切主题时图谱配色同步变化。
- 详情用 Radix Dialog 承载的右侧抽屉，**不跳页**，Esc 与焦点陷阱由原语保证。
- 对比最多 3 条，超出时给出明确提示而不是静默丢弃。

## 阶段 2 · 资讯（模块 3/6）

28 条资讯，按天组成时间线；筛选在 URL 上，剧透默认遮罩，来源可跳转。

### 内容口径（重要）

本站是**非官方粉丝站**，因此这里**没有一条是伪造的官方公告**：

- `official` / `media` 类目是**聚合位**：标题与摘要描述「该渠道有哪些公开动态」，
  正文明确标注为演示数据，来源按钮指向**真实渠道首页**（官网 / Steam / 微博 / B 站），
  评审可以点出去核对；
- 其余类目是**本站编辑内容**（`source.kind = 'editorial'`），没有站外链接；
- 页面顶部常驻一句「本页为演示数据，不代表任何官方信息」。

种子测试守着这条一致性：`editorial` 来源不得带外链，外部来源必须是 `https://` 链接。

### 功能与接口

| 功能     | 接口                 | 说明                                             |
| -------- | -------------------- | ------------------------------------------------ |
| 资讯列表 | `GET /api/news`      | 类目 / 标签 / 关键词 / 排序 / 分页都在服务端完成 |
| 标签统计 | `GET /api/news/tags` | 返回标签及条数，供筛选条角标                     |
| 资讯详情 | `GET /api/news/:id`  | 不存在返回 404                                   |

### 剧透是「遮罩」而不是「隐藏」

隐藏条目会让人误以为漏发了新闻，因此含剧透的资讯**仍在列表里**，只是内容被遮住：

- **全站开关**（顶栏 / 演示控制台）——适合已经通关的人；
- **单条揭开**——只解开当前这一条，其余仍然遮着；
- 遮罩层带 `aria-hidden`：读屏用户不会比视觉用户更容易拿到剧透，
  否则「默认不剧透」对无障碍用户就是失效的。

### 筛选与来源

```
/news?newsCategory=official            # 只看官方渠道聚合位
/news?newsTags=version&newsTags=balance  # 多标签是「同时满足」，缩小范围
/news?newsSearch=剧透&newsSort=oldest
```

- 标签写成带角标的 chip：点击前就能看出哪些标签是空的（空标签不渲染）。
- 来源按钮：外部渠道是真 `<a target="_blank">`，在**演示模式下会被阶段 1 的外链拦截**
  拦下并提示，退出演示模式即可跳转；站内编辑内容则是按钮 + 说明文案。
- 置顶条目恒在最前，不参与时间排序——被时间序压倒就失去置顶的意义。

## 阶段 2 · 攻略库（模块 4/6）

16 篇攻略（10 BOSS / 3 配装 / 3 结局），步骤时间轴 + **步骤级**剧透遮罩 + 点赞。

### 内容口径（重要）

与资讯同一条底线：这里是**攻略示范**，不是官方资料转述。

- 全部文案是本站编辑与社区作者的原创演示内容，页面上常驻一句「数值与时机未做校验」；
- 章节名与妖王名取自游戏内公开内容，具体打法为示例；
- 「关联影神图词条」只引用本站词条，点击后在站内打开对应详情（不跳出站点）。

### 功能与接口

| 功能     | 接口                       | 说明                                                |
| -------- | -------------------------- | --------------------------------------------------- |
| 攻略列表 | `GET /api/guide`           | 分类 / 难度 / 章节 / 关键词 / 排序 / 分页都在服务端 |
| 分类统计 | `GET /api/guide/counts`    | 三类篇数；统计全量数据，不随筛选变化                |
| 攻略详情 | `GET /api/guide/:id`       | 不存在返回 404                                      |
| 点赞列表 | `GET /api/guide/likes`     | 按归属者（账号 `user:<id>` 或设备 `device:<id>`）   |
| 点赞切换 | `POST /api/guide/:id/like` | 返回 `{ liked, likes, ids }`                        |

### 步骤级剧透

攻略的剧透不是「整篇挡掉」：一条配装攻略可以整体不涉及剧情，但其中某一步提到后期珍玩的获取时机。

- 遮罩按**步骤**判定，只遮那一步，其余步骤照常可读——整篇挡住会让人以为攻略写得不全；
- 被遮的步骤连「提示」一起挡住（提示本身往往就是剧透信息）；
- 卡片上标 `peakSpoilerLevel`（攻略与步骤里的最高级别）：列表上就能看出点进去会不会被剧透；
- 种子测试守着这个演示前提：必须存在「整体 0 级、个别步骤 > 0 级」的攻略，
  否则步骤级机制在数据上就无从体现。

### 检索面包含步骤标题

找「怎么定风」的人未必记得攻略标题，但他一定记得那一步叫什么——
`matchesGuideQuery` 因此把 `steps[].title` 也纳入检索面，搜索框占位文案里也写明了这一点。

### 点赞的并发一致性

点赞要同时改「点赞记录」与「攻略上的计数」，因此读-改-写被包在**同一个 Dexie 事务**里：
否则并发点击会出现「记录被删了、计数却还是 +1」（读过攻略之后、写回之前，另一个请求改了记录）。
测试用 `Promise.all` 并发点三次，断言最终「记录是否存在」与计数始终自洽。

### 关联词条：影神图深链

抽屉里的关联词条是 `<Link to="/wiki?wikiEntry=<id>">`。影神图把 `wikiEntry` 当**视图状态**而不是筛选条件：

- 解析与写回都走 URL（链接可分享、可后退、可刷新）；
- 「清空筛选」不会把正在看的词条一起关掉；
- 回写时保留它不认识的参数（演示参数、其他筛选），因此两者能共存。

### 演示用法

```
/guide?guideKind=boss&guideDifficulty=challenge   # 只看挑战向 BOSS 攻略
/guide?guideSearch=定风                            # 搜标题、摘要、作者或步骤标题
/guide?guideSort=difficulty                        # 难度递增
/wiki?wikiEntry=wiki-heixiongjing                  # 直接打开某条词条详情
```

## 进度

| 阶段 | 内容                                                                                     | 状态             |
| ---- | ---------------------------------------------------------------------------------------- | ---------------- |
| 0    | 项目骨架（工程配置 / 目录 / 令牌三主题 / Providers / 路由守卫 / 三布局 / 占位页 / Home） | ✅ 已交付        |
| 1    | DEMO 演示系统（URL 双向同步 / StateBoundary / 葫芦控制台 / 7 场景 / 引导 / 快照 / 录制） | ✅ 已交付        |
| 2    | 核心业务：**用户成长 ✅** → **影神图 ✅** → **资讯 ✅** → **攻略 ✅** → 论坛 → 个人主页  | 🚧 进行中（4/6） |
| 3    | 高级功能：配装模拟器 → 互动地图 → 收集追踪 → 二创 → 活动 → 灵蕴商城 → 后台               | 未开始           |
| 4    | 审查 / 重构 / E2E / 性能 / 交付文档                                                      | 未开始           |
