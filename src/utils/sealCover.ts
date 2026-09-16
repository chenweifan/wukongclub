/**
 * 印章式封面（内联 SVG 数据 URI）。
 *
 * 影神图与资讯共用同一套做法：不引入任何二进制素材，
 * 用「首字 + 鎏金描边」的印章表达封面，离线可用也没有素材版权问题。
 */
export function buildSealCoverUrl(text: string, fallbackGlyph: string): string {
  const glyph = [...text.trim()][0] ?? fallbackGlyph;
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">',
    '<rect width="96" height="96" rx="6" fill="#0b0b0d"/>',
    '<rect x="6" y="6" width="84" height="84" rx="4" fill="none" stroke="#c8a96a" stroke-width="2"/>',
    `<text x="48" y="64" font-size="46" text-anchor="middle" fill="#e8ce96" font-family="serif">${glyph}</text>`,
    '</svg>',
  ].join('');

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** 方形小图标（来源标识用，尺寸更小）。 */
export function buildSealBadgeUrl(glyph: string): string {
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">',
    '<rect width="48" height="48" rx="4" fill="#16161a"/>',
    `<text x="24" y="33" font-size="24" text-anchor="middle" fill="#c8a96a" font-family="serif">${glyph}</text>`,
    '</svg>',
  ].join('');

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
