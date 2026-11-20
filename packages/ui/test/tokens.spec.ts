import { describe, it, expect } from 'vitest';
import { validateContrast, DEFAULT_DESIGN_TOKENS } from '../src/tokens';

describe('Design Tokens & WCAG Contrast Validator (Dark Space Security Theme)', () => {
  it('includes all canonical design tokens configured for Dark Space Security', () => {
    expect(DEFAULT_DESIGN_TOKENS['--color-primary']).toBe('#DC2626');
    expect(DEFAULT_DESIGN_TOKENS['--color-primary-contrast']).toBe('#FFFFFF');
    expect(DEFAULT_DESIGN_TOKENS['--color-surface']).toBe('#0A0A0E');
    expect(DEFAULT_DESIGN_TOKENS['--color-text']).toBe('#F8FAFC');
  });

  it('validates passing WCAG 2.2 AA contrast ratio (>= 4.5:1)', () => {
    const result = validateContrast('#FFFFFF', '#DC2626');
    expect(result.valid).toBe(true);
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('detects failing contrast ratio (< 4.5:1)', () => {
    const result = validateContrast('#374151', '#0A0A0E');
    expect(result.valid).toBe(false);
    expect(result.ratio).toBeLessThan(4.5);
  });
});
