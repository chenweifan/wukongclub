/**
 * 运行时读取设计令牌。
 *
 * 为什么需要它：ECharts 画在 canvas 上，拿不到 CSS 变量，颜色必须传具体字符串。
 * 与其在图表配置里硬编码色值（违反协议铁律 5），不如启动时从 :root 读一次令牌 ——
 * 于是切主题时图表配色也跟着变，而且「颜色只有一个来源」这条约束依然成立。
 */
export const TOKEN_READ_FALLBACK = '';

export function readCssToken(name: string, fallback = TOKEN_READ_FALLBACK): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallback;
  }

  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  return value === '' ? fallback : value;
}

export interface ChartPalette {
  accent: string;
  accentHi: string;
  text: string;
  textMuted: string;
  line: string;
  surface: string;
  danger: string;
  spirit: string;
}

/** 图表用的一组令牌色；缺值时退回中性色，保证画得出来。 */
export function readChartPalette(): ChartPalette {
  return {
    accent: readCssToken('--hmw-accent', '#c8a96a'),
    accentHi: readCssToken('--hmw-accent-hi', '#e8ce96'),
    text: readCssToken('--hmw-text', '#ece6d9'),
    textMuted: readCssToken('--hmw-text-muted', '#9c968a'),
    line: readCssToken('--hmw-border-strong', '#666'),
    surface: readCssToken('--hmw-surface', '#16161a'),
    danger: readCssToken('--hmw-danger', '#c2453f'),
    spirit: readCssToken('--hmw-spirit', '#5c9c8b'),
  };
}

/** 稀有度 → 令牌色（5 星鎏金、4 星灵蕴青、低星次第转灰）。 */
export function rarityColor(rarity: number, palette: ChartPalette = readChartPalette()): string {
  switch (rarity) {
    case 5:
      return palette.accentHi;
    case 4:
      return palette.accent;
    case 3:
      return palette.spirit;
    case 2:
      return palette.textMuted;
    default:
      return palette.line;
  }
}
