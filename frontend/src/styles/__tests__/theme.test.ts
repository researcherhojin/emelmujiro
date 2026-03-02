import { describe, it, expect } from 'vitest';
import { theme } from '../theme';

// ---------------------------------------------------------------------------
// Helper: assert that a value looks like a CSS hex color (#xxx or #xxxxxx).
// ---------------------------------------------------------------------------
function expectHexColor(value: string, label: string) {
  expect(value, `${label} should be a string`).toBeTypeOf('string');
  expect(value, `${label} should start with #`).toMatch(/^#[0-9a-fA-F]{3,8}$/);
}

// ---------------------------------------------------------------------------
// theme.colors.primary
// ---------------------------------------------------------------------------
describe('theme.colors.primary', () => {
  it('has main, light, dark', () => {
    expect(theme.colors.primary).toHaveProperty('main');
    expect(theme.colors.primary).toHaveProperty('light');
    expect(theme.colors.primary).toHaveProperty('dark');
  });

  it('main is a hex color string', () => {
    expectHexColor(theme.colors.primary.main, 'primary.main');
  });

  it('light is a hex color string', () => {
    expectHexColor(theme.colors.primary.light, 'primary.light');
  });

  it('dark is a hex color string', () => {
    expectHexColor(theme.colors.primary.dark, 'primary.dark');
  });
});

// ---------------------------------------------------------------------------
// theme.colors.secondary
// ---------------------------------------------------------------------------
describe('theme.colors.secondary', () => {
  it('has main, light, dark', () => {
    expect(theme.colors.secondary).toHaveProperty('main');
    expect(theme.colors.secondary).toHaveProperty('light');
    expect(theme.colors.secondary).toHaveProperty('dark');
  });

  it('main is a hex color string', () => {
    expectHexColor(theme.colors.secondary.main, 'secondary.main');
  });

  it('light is a hex color string', () => {
    expectHexColor(theme.colors.secondary.light, 'secondary.light');
  });

  it('dark is a hex color string', () => {
    expectHexColor(theme.colors.secondary.dark, 'secondary.dark');
  });
});

// ---------------------------------------------------------------------------
// theme.colors.gray
// ---------------------------------------------------------------------------
describe('theme.colors.gray', () => {
  const graySteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

  it('has all expected gray scale keys', () => {
    for (const step of graySteps) {
      expect(theme.colors.gray).toHaveProperty(String(step));
    }
  });

  it.each(graySteps)('gray[%i] is a hex color string', (step) => {
    expectHexColor(theme.colors.gray[step], `gray.${step}`);
  });
});

// ---------------------------------------------------------------------------
// theme.colors.accent
// ---------------------------------------------------------------------------
describe('theme.colors.accent', () => {
  it('has coral, mint, amber', () => {
    expect(theme.colors.accent).toHaveProperty('coral');
    expect(theme.colors.accent).toHaveProperty('mint');
    expect(theme.colors.accent).toHaveProperty('amber');
  });

  it('coral is a hex color string', () => {
    expectHexColor(theme.colors.accent.coral, 'accent.coral');
  });

  it('mint is a hex color string', () => {
    expectHexColor(theme.colors.accent.mint, 'accent.mint');
  });

  it('amber is a hex color string', () => {
    expectHexColor(theme.colors.accent.amber, 'accent.amber');
  });
});

// ---------------------------------------------------------------------------
// theme.typography.fontFamily
// ---------------------------------------------------------------------------
describe('theme.typography.fontFamily', () => {
  it('has sans and mono', () => {
    expect(theme.typography.fontFamily).toHaveProperty('sans');
    expect(theme.typography.fontFamily).toHaveProperty('mono');
  });

  it('sans includes "Pretendard"', () => {
    expect(theme.typography.fontFamily.sans).toContain('Pretendard');
  });

  it('mono includes "JetBrains Mono"', () => {
    expect(theme.typography.fontFamily.mono).toContain('JetBrains Mono');
  });
});

// ---------------------------------------------------------------------------
// theme.typography.fontSize
// ---------------------------------------------------------------------------
describe('theme.typography.fontSize', () => {
  const expectedSizeKeys = [
    'xs',
    'sm',
    'base',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
    '5xl',
    '6xl',
    '7xl',
  ] as const;

  it('has all expected font size keys', () => {
    for (const key of expectedSizeKeys) {
      expect(theme.typography.fontSize).toHaveProperty(key);
    }
  });

  it.each(expectedSizeKeys)('fontSize["%s"] is a rem value', (key) => {
    const value = theme.typography.fontSize[key];
    expect(value, `fontSize.${key} should be a string`).toBeTypeOf('string');
    expect(value, `fontSize.${key} should end with "rem"`).toMatch(
      /^\d+(\.\d+)?rem$/
    );
  });
});

// ---------------------------------------------------------------------------
// theme.spacing
// ---------------------------------------------------------------------------
describe('theme.spacing', () => {
  const expectedSpacingKeys = [
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    '3xl',
  ] as const;

  it('has all expected spacing keys', () => {
    for (const key of expectedSpacingKeys) {
      expect(theme.spacing).toHaveProperty(key);
    }
  });

  it.each(expectedSpacingKeys)('spacing["%s"] is a rem value', (key) => {
    const value = theme.spacing[key];
    expect(value, `spacing.${key} should be a string`).toBeTypeOf('string');
    expect(value, `spacing.${key} should end with "rem"`).toMatch(
      /^\d+(\.\d+)?rem$/
    );
  });
});

// ---------------------------------------------------------------------------
// theme.animation.duration
// ---------------------------------------------------------------------------
describe('theme.animation.duration', () => {
  it('has fast, normal, slow', () => {
    expect(theme.animation.duration).toHaveProperty('fast');
    expect(theme.animation.duration).toHaveProperty('normal');
    expect(theme.animation.duration).toHaveProperty('slow');
  });

  it.each(['fast', 'normal', 'slow'] as const)(
    'duration["%s"] is a millisecond value',
    (key) => {
      const value = theme.animation.duration[key];
      expect(value, `duration.${key} should be a string`).toBeTypeOf('string');
      expect(value, `duration.${key} should end with "ms"`).toMatch(/^\d+ms$/);
    }
  );
});

// ---------------------------------------------------------------------------
// theme.animation.easing
// ---------------------------------------------------------------------------
describe('theme.animation.easing', () => {
  it('has default and smooth', () => {
    expect(theme.animation.easing).toHaveProperty('default');
    expect(theme.animation.easing).toHaveProperty('smooth');
  });

  it.each(['default', 'smooth'] as const)(
    'easing["%s"] is a cubic-bezier value',
    (key) => {
      const value = theme.animation.easing[key];
      expect(value, `easing.${key} should be a string`).toBeTypeOf('string');
      expect(
        value,
        `easing.${key} should be a cubic-bezier(...) value`
      ).toMatch(/^cubic-bezier\(/);
    }
  );
});
