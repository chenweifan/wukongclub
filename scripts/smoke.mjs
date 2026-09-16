#!/usr/bin/env node
/**
 * 路由冒烟测试（交付验收用，零新增依赖）。
 *
 * 单元测试跑在 jsdom 里，看不到「真实构建产物 + 真实 HTTP」这一层：
 * 路由懒加载的 chunk 拆分、public/ 资源、预览服务器的 SPA 回退都可能在这里出问题。
 * 因此这一步做三件事：
 *   1. 起 `vite preview` 伺服 dist/（不是 dev server：验的是交付产物）；
 *   2. 逐个请求已交付路由与占位路由，断言 200 + 挂载点 + 真实引用了构建产物；
 *   3. 断言首页拿到的入口 JS 存在且非空（防止「HTML 能返回但脚本 404」）。
 *
 * 用法：npm run build && npm run smoke（`npm run verify` 里已包含这两步）
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST_INDEX = join(ROOT, 'dist', 'index.html');
const VITE_BIN = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');

/** 已交付路由 + 占位路由 + 404：覆盖「能走通」和「走得进去但不是坏的」两类。 */
const ROUTES = [
  '/',
  '/news',
  '/wiki',
  '/guide',
  '/user',
  '/login',
  '/forum',
  '/admin',
  '/definitely-not-a-page',
];

const STARTUP_TIMEOUT_MS = 30_000;
const REQUEST_TIMEOUT_MS = 15_000;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      const port = typeof address === 'object' && address !== null ? address.port : 0;
      probe.close(() => {
        resolve(port);
      });
    });
  });
}

async function waitForServer(baseUrl) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) {
        return;
      }
    } catch {
      // 还没起来：继续等
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`预览服务器在 ${STARTUP_TIMEOUT_MS}ms 内没有就绪`);
}

async function main() {
  if (!existsSync(DIST_INDEX)) {
    fail('找不到 dist/index.html —— 先跑 npm run build（npm run verify 会自动按顺序执行）');
    return;
  }

  const port = await findFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const server = spawn(
    process.execPath,
    [VITE_BIN, 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const serverLog = [];
  server.stdout.on('data', (chunk) => serverLog.push(String(chunk)));
  server.stderr.on('data', (chunk) => serverLog.push(String(chunk)));

  try {
    await waitForServer(baseUrl);

    const indexHtml = readFileSync(DIST_INDEX, 'utf8');
    const entryMatch = indexHtml.match(/src="(\/assets\/[^"]+\.js)"/);

    if (entryMatch === null) {
      fail('dist/index.html 里找不到入口脚本引用');
    } else {
      const entryPath = entryMatch[1];
      const entryFile = join(ROOT, 'dist', entryPath.replace(/^\//, ''));
      const entrySize = existsSync(entryFile) ? statSync(entryFile).size : 0;

      if (entrySize === 0) {
        fail(`入口脚本不存在或为空：${entryPath}`);
      } else {
        console.log(`✓ 入口脚本 ${entryPath}（${(entrySize / 1024).toFixed(1)} kB）`);
      }
    }

    for (const route of ROUTES) {
      const response = await fetch(`${baseUrl}${route}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const body = await response.text();

      const mounted = body.includes('<div id="root">');
      const hasScript = /src="\/assets\/[^"]+\.js"/.test(body);

      if (response.status !== 200 || !mounted || !hasScript) {
        fail(`${route} → ${response.status}（挂载点=${mounted} 脚本引用=${hasScript}）`);
        continue;
      }

      console.log(`✓ ${route} → 200（SPA 回退 + 挂载点正常）`);
    }

    // Mock Service Worker 是纯前端方案的运行时依赖，缺了它整站没有数据
    const worker = await fetch(`${baseUrl}/mockServiceWorker.js`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!worker.ok) {
      fail(`mockServiceWorker.js → ${worker.status}（Mock 后端无法启动）`);
    } else {
      console.log('✓ /mockServiceWorker.js → 200（MSW worker 随产物一起交付）');
    }
  } catch (error) {
    fail(`冒烟测试失败：${error instanceof Error ? error.message : String(error)}`);
    if (serverLog.length > 0) {
      console.error(serverLog.join(''));
    }
  } finally {
    server.kill();
  }

  if (process.exitCode === undefined) {
    console.log('\n冒烟测试通过：构建产物可伺服，已交付路由与占位路由都可达。');
  }
}

await main();
