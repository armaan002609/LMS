/**
 * Canonical Design Tokens (PRD §9, UI_UX_DESIGN.md §2)
 */
export const DEFAULT_DESIGN_TOKENS = {
  '--color-primary': '#4F46E5',
  '--color-primary-contrast': '#FFFFFF',
  '--color-secondary': '#0EA5E9',
  '--color-success': '#16A34A',
  '--color-warning': '#D97706',
  '--color-danger': '#DC2626',
  '--color-surface': '#FFFFFF',
  '--color-surface-muted': '#F8FAFC',
  '--color-text': '#0F172A',
  '--color-text-muted': '#475569',
  '--color-border': '#E2E8F0',
  '--font-sans': 'Inter, system-ui, sans-serif',
  '--radius-md': '8px',
  '--radius-lg': '12px',
  '--space-1': '4px',
  '--space-2': '8px',
  '--space-3': '12px',
  '--space-4': '16px',
  '--space-6': '24px',
  '--space-8': '32px',
  '--space-12': '48px',
} as const;

export type DesignTokenKey = keyof typeof DEFAULT_DESIGN_TOKENS;

/**
 * Validates WCAG 2.2 AA 4.5:1 contrast between hex colors.
 */
export function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0;
  const rgb = [0, 2, 4].map((offset) => {
    const val = parseInt(cleanHex.substring(offset, offset + 2), 16) / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (rgb[0] ?? 0) + 0.7152 * (rgb[1] ?? 0) + 0.0722 * (rgb[2] ?? 0);
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function validateContrast(foregroundHex: string, backgroundHex: string): {
  valid: boolean;
  ratio: number;
} {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);
  return {
    valid: ratio >= 4.5,
    ratio: Math.round(ratio * 100) / 100,
  };
}
