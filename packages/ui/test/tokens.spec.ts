import { describe, it, expect } from 'vitest';
import { validateContrast, DEFAULT_DESIGN_TOKENS } from '../src/tokens';

describe('Design Tokens & WCAG Contrast Validator (UI_UX_DESIGN §2.1, §8)', () => {
  it('includes all canonical design tokens from PRD §9', () => {
    expect(DEFAULT_DESIGN_TOKENS['--color-primary']).toBe('#4F46E5');
    expect(DEFAULT_DESIGN_TOKENS['--color-primary-contrast']).toBe('#FFFFFF');
    expect(DEFAULT_DESIGN_TOKENS['--color-success']).toBe('#16A34A');
    expect(DEFAULT_DESIGN_TOKENS['--color-danger']).toBe('#DC2626');
  });

  it('validates passing WCAG 2.2 AA contrast ratio (>= 4.5:1)', () => {
    // White text on dark blue/purple (#4F46E5)
    const result = validateContrast('#FFFFFF', '#4F46E5');
    expect(result.valid).toBe(true);
    expect(result.ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('detects failing contrast ratio (< 4.5:1)', () => {
    // Light gray text on white
    const result = validateContrast('#A0AEC0', '#FFFFFF');
    expect(result.valid).toBe(false);
    expect(result.ratio).toBeLessThan(4.5);
  });
});
