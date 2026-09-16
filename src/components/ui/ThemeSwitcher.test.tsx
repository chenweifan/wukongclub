import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/app/ThemeProvider';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { THEME_STORAGE_KEY } from '@/app/theme';

/**
 * 主题切换的「接线」测试：
 * 颜色本身由 tokens.test.ts 的令牌契约保证，这里只验证 UI 操作 →
 * <html data-theme> → localStorage 这条链路真的通（阶段 0 验收项「切主题见效」的可自动验证部分）。
 */
function renderSwitcher() {
  return render(
    <ThemeProvider>
      <ThemeSwitcher />
    </ThemeProvider>,
  );
}

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('默认使用墨黑主题，并把主题写到 <html data-theme> 与 localStorage', () => {
    renderSwitcher();

    expect(document.documentElement.getAttribute('data-theme')).toBe('ink');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('ink');
    expect(screen.getByRole('button', { name: '墨黑' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('点击「宣纸」后属性、持久化与 aria-pressed 同步更新', () => {
    renderSwitcher();

    fireEvent.click(screen.getByRole('button', { name: '宣纸' }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('paper');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('paper');
    expect(screen.getByRole('button', { name: '宣纸' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '墨黑' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('已持久化的主题在挂载时被还原（刷新后不闪回默认主题）', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'contrast');

    renderSwitcher();

    expect(document.documentElement.getAttribute('data-theme')).toBe('contrast');
    expect(screen.getByRole('button', { name: '高对比' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('持久化了非法主题时回落到墨黑', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'neon');

    renderSwitcher();

    expect(document.documentElement.getAttribute('data-theme')).toBe('ink');
  });
});
