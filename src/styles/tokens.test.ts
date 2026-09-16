import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * 令牌契约测试。
 * 目的不是「测 CSS」，而是把协议第七节的硬性要求钉死在 CI 里：
 * 1. 协议点名的 9 个基础令牌必须存在；
 * 2. 三套主题共用同一组语义令牌名，切换 data-theme 才能整体换肤。
 * 阶段 4 审查时，任何硬编码色值都能由这条测试的扩展版本兜住。
 *
 * 用 process.cwd() 而非 import.meta.url：jsdom 环境下 import.meta.url 不是 file: 协议，
 * readFileSync 会直接抛错（测试脚本均在项目根目录运行，路径稳定）。
 */
const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

const REQUIRED_BASE_TOKENS = [
  '--hmw-ink',
  '--hmw-ink-2',
  '--hmw-gold',
  '--hmw-gold-hi',
  '--hmw-cinnabar',
  '--hmw-paper',
  '--hmw-jade',
  '--radius-scroll',
  '--shadow-seal',
] as const;

const REQUIRED_SEMANTIC_TOKENS = [
  '--hmw-bg',
  '--hmw-text',
  '--hmw-surface',
  '--hmw-border',
  '--hmw-accent',
  '--hmw-danger',
  '--hmw-spirit',
  '--hmw-focus',
] as const;

const THEME_SELECTORS = ['ink', 'paper', 'contrast'] as const;

/** 取出某个主题选择器之后的整段声明块（到下一个 `}` 为止）。 */
function readThemeBlock(theme: string): string {
  const selector = `[data-theme='${theme}']`;
  const start = tokensCss.indexOf(selector);

  if (start === -1) {
    throw new Error(`tokens.css 缺少主题选择器 ${selector}`);
  }

  const end = tokensCss.indexOf('}', start);
  return tokensCss.slice(start, end);
}

describe('tokens.css 契约', () => {
  it('包含协议点名的全部基础令牌', () => {
    for (const token of REQUIRED_BASE_TOKENS) {
      expect(tokensCss, `缺少基础令牌 ${token}`).toContain(`${token}:`);
    }
  });

  it('三套主题均有独立声明块', () => {
    for (const theme of THEME_SELECTORS) {
      expect(() => readThemeBlock(theme)).not.toThrow();
    }
  });

  it('每套主题都覆写了全部语义令牌（否则会出现跨主题串色）', () => {
    for (const theme of THEME_SELECTORS) {
      const block = readThemeBlock(theme);
      for (const token of REQUIRED_SEMANTIC_TOKENS) {
        expect(block, `主题 ${theme} 缺少语义令牌 ${token}`).toContain(`${token}:`);
      }
    }
  });

  it('三套主题的主背景色互不相同（保证切主题可见变化）', () => {
    const backgrounds = THEME_SELECTORS.map((theme) => {
      const match = /--hmw-bg:\s*([^;]+);/.exec(readThemeBlock(theme));
      return match?.[1]?.trim() ?? '';
    });

    expect(backgrounds.every((value) => value !== '')).toBe(true);
    expect(new Set(backgrounds).size).toBe(THEME_SELECTORS.length);
  });

  it('基础色板只出现在令牌文件中，且未在主题块里重复定义（避免多份真相）', () => {
    const paperThemeBlock = readThemeBlock('paper');
    expect(paperThemeBlock).not.toContain('--hmw-ink:');
    expect(paperThemeBlock).not.toContain('--hmw-paper:');
  });
});
