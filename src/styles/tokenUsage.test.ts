import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * 令牌使用约定的守卫测试。
 *
 * 背景（阶段 1 实测发现）：Tailwind v3 **无法**为 `var(--x)` 定义的颜色生成透明度修饰符 ——
 * `bg-surface/50` 这类类名不会产出任何 CSS 规则，于是元素背景静默变成透明。
 * 这类问题在代码里看不出来、只有肉眼比对才发现，因此用测试挡住：
 * 需要半透明时请用 `color-mix(in srgb, var(--x) N%, transparent)`（内联样式或 tokens.css）。
 *
 * 扫描时排除测试文件本身 —— 否则规则字符串会匹配到自己。
 */
const FORBIDDEN_PATTERN =
  /\b(?:bg|text|border|from|to|via|ring|fill|stroke|outline|shadow)-(?:bg|surface|surface-2|content|line|accent|danger|spirit|focus|overlay|ink|gold|cinnabar|paper|jade)(?:-[a-z0-9]+)?\/\d+/g;

interface Finding {
  file: string;
  match: string;
}

function scanSource(): Finding[] {
  const root = resolve(process.cwd(), 'src');
  const findings: Finding[] = [];

  function walk(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name);

      if (entry.isDirectory()) {
        walk(full);
        continue;
      }

      if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) {
        continue;
      }

      if (entry.name.includes('.test.')) {
        continue;
      }

      const content = readFileSync(full, 'utf8');
      for (const match of content.matchAll(FORBIDDEN_PATTERN)) {
        findings.push({ file: full.replace(root, 'src'), match: match[0] });
      }
    }
  }

  walk(root);
  return findings;
}

describe('令牌使用约定', () => {
  it('不使用 Tailwind 的透明度修饰符（v3 对 var() 颜色会静默丢弃整条规则）', () => {
    const findings = scanSource();

    expect(
      findings,
      `以下位置使用了 var() 颜色 + 透明度修饰符，请改用 color-mix：\n${findings
        .map((finding) => `  ${finding.file}: ${finding.match}`)
        .join('\n')}`,
    ).toEqual([]);
  });

  it('半透明色一律用 color-mix 表达（保证令牌仍是唯一色源）', () => {
    const globals = readFileSync(resolve(process.cwd(), 'src/styles/globals.css'), 'utf8');

    expect(globals).toContain('color-mix(in srgb, var(--hmw-accent)');
  });
});
