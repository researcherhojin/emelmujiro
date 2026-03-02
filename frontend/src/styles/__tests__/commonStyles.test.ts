import { describe, it, expect } from 'vitest';
import commonStyles, {
  layout,
  typography,
  buttons,
  forms,
  cards,
  animations,
  spacing,
  colors,
  states,
  cn,
  presets,
} from '../commonStyles';

// ---------------------------------------------------------------------------
// Helper: assert that every value in a record is a non-empty string.
// The cards.noPadding entry is intentionally empty (''), so we skip that key.
// ---------------------------------------------------------------------------
function expectNonEmptyStrings(
  obj: Record<string, string>,
  skipKeys: string[] = []
) {
  for (const [key, value] of Object.entries(obj)) {
    if (skipKeys.includes(key)) continue;
    expect(typeof value, `key "${key}" should be a string`).toBe('string');
    expect(
      value.length,
      `key "${key}" should be a non-empty string`
    ).toBeGreaterThan(0);
  }
}

// ---------------------------------------------------------------------------
// layout
// ---------------------------------------------------------------------------
describe('layout', () => {
  const expectedKeys = [
    'container',
    'containerSmall',
    'section',
    'sectionSmall',
    'flexCenter',
    'flexBetween',
    'flexCol',
    'grid2',
    'grid3',
    'grid4',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(layout).toHaveProperty(key);
    }
  });

  it('all values are non-empty strings', () => {
    expectNonEmptyStrings(layout as unknown as Record<string, string>);
  });
});

// ---------------------------------------------------------------------------
// typography
// ---------------------------------------------------------------------------
describe('typography', () => {
  const expectedKeys = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'body',
    'bodyLarge',
    'bodySmall',
    'lead',
    'caption',
    'label',
    'error',
    'success',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(typography).toHaveProperty(key);
    }
  });

  it('all values are non-empty strings', () => {
    expectNonEmptyStrings(typography as unknown as Record<string, string>);
  });
});

// ---------------------------------------------------------------------------
// buttons
// ---------------------------------------------------------------------------
describe('buttons', () => {
  const expectedKeys = [
    'base',
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
    'success',
    'sm',
    'md',
    'lg',
    'xl',
    'disabled',
    'loading',
    'fullWidth',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(buttons).toHaveProperty(key);
    }
  });

  it('all values are non-empty strings', () => {
    expectNonEmptyStrings(buttons as unknown as Record<string, string>);
  });
});

// ---------------------------------------------------------------------------
// forms
// ---------------------------------------------------------------------------
describe('forms', () => {
  const expectedKeys = [
    'input',
    'inputError',
    'inputSuccess',
    'textarea',
    'select',
    'checkbox',
    'radio',
    'label',
    'labelRequired',
    'helperText',
    'errorText',
    'formGroup',
    'formRow',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(forms).toHaveProperty(key);
    }
  });

  it('all values are non-empty strings', () => {
    expectNonEmptyStrings(forms as unknown as Record<string, string>);
  });
});

// ---------------------------------------------------------------------------
// cards
// ---------------------------------------------------------------------------
describe('cards', () => {
  const expectedKeys = [
    'base',
    'bordered',
    'elevated',
    'interactive',
    'noPadding',
    'sm',
    'md',
    'lg',
    'gradient',
    'dark',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(cards).toHaveProperty(key);
    }
  });

  it('all values are strings', () => {
    for (const [key, value] of Object.entries(cards)) {
      expect(typeof value, `key "${key}" should be a string`).toBe('string');
    }
  });

  it('all values except noPadding are non-empty strings', () => {
    // noPadding is intentionally '' in the source
    expectNonEmptyStrings(cards as unknown as Record<string, string>, [
      'noPadding',
    ]);
  });

  it('noPadding is an empty string', () => {
    expect(cards.noPadding).toBe('');
  });
});

// ---------------------------------------------------------------------------
// animations
// ---------------------------------------------------------------------------
describe('animations', () => {
  const expectedKeys = [
    'fadeIn',
    'fadeOut',
    'slideUp',
    'slideDown',
    'scaleIn',
    'spin',
    'pulse',
    'bounce',
    'transition',
    'transitionFast',
    'transitionSlow',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(animations).toHaveProperty(key);
    }
  });

  it('all values are non-empty strings', () => {
    expectNonEmptyStrings(animations as unknown as Record<string, string>);
  });
});

// ---------------------------------------------------------------------------
// spacing
// ---------------------------------------------------------------------------
describe('spacing', () => {
  const expectedKeys = [
    'marginSection',
    'marginElement',
    'marginSmall',
    'paddingSection',
    'paddingElement',
    'paddingSmall',
    'gapLarge',
    'gapMedium',
    'gapSmall',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(spacing).toHaveProperty(key);
    }
  });

  it('all values are non-empty strings', () => {
    expectNonEmptyStrings(spacing as unknown as Record<string, string>);
  });
});

// ---------------------------------------------------------------------------
// colors
// ---------------------------------------------------------------------------
describe('colors', () => {
  const expectedKeys = [
    'textPrimary',
    'textSecondary',
    'textMuted',
    'textInverse',
    'bgPrimary',
    'bgSecondary',
    'bgDark',
    'bgAccent',
    'borderDefault',
    'borderDark',
    'borderLight',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(colors).toHaveProperty(key);
    }
  });

  it('all values are non-empty strings', () => {
    expectNonEmptyStrings(colors as unknown as Record<string, string>);
  });
});

// ---------------------------------------------------------------------------
// states
// ---------------------------------------------------------------------------
describe('states', () => {
  const expectedKeys = [
    'hover',
    'focus',
    'active',
    'disabled',
    'loading',
    'error',
    'success',
    'warning',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(states).toHaveProperty(key);
    }
  });

  it('all values are non-empty strings', () => {
    expectNonEmptyStrings(states as unknown as Record<string, string>);
  });
});

// ---------------------------------------------------------------------------
// cn
// ---------------------------------------------------------------------------
describe('cn', () => {
  it('joins multiple strings with a single space', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('filters out undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('filters out null values', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('filters out false values', () => {
    expect(cn('foo', false, 'bar')).toBe('foo bar');
  });

  it('filters out empty string values', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });

  it('returns empty string when given no arguments', () => {
    expect(cn()).toBe('');
  });

  it('returns empty string when all arguments are falsy', () => {
    expect(cn(undefined, null, false, '')).toBe('');
  });

  it('returns single string unchanged', () => {
    expect(cn('only')).toBe('only');
  });

  it('handles a mix of valid and falsy values', () => {
    expect(cn('a', null, 'b', false, undefined, '', 'c')).toBe('a b c');
  });
});

// ---------------------------------------------------------------------------
// presets
// ---------------------------------------------------------------------------
describe('presets', () => {
  const expectedKeys = [
    'pageContainer',
    'sectionHeading',
    'formField',
    'primaryButton',
    'interactiveCard',
    'errorMessage',
    'successMessage',
  ];

  it('has all expected keys', () => {
    for (const key of expectedKeys) {
      expect(presets).toHaveProperty(key);
    }
  });

  it('all values are non-empty strings', () => {
    expectNonEmptyStrings(presets as unknown as Record<string, string>);
  });

  it('pageContainer composes layout.container and spacing.paddingSection', () => {
    expect(presets.pageContainer).toContain(layout.container);
    expect(presets.pageContainer).toContain(spacing.paddingSection);
  });

  it('primaryButton composes buttons.base, buttons.primary, and buttons.md', () => {
    expect(presets.primaryButton).toContain(buttons.base);
    expect(presets.primaryButton).toContain(buttons.primary);
    expect(presets.primaryButton).toContain(buttons.md);
  });

  it('interactiveCard composes cards.interactive and cards.md', () => {
    expect(presets.interactiveCard).toContain(cards.interactive);
    expect(presets.interactiveCard).toContain(cards.md);
  });
});

// ---------------------------------------------------------------------------
// default export
// ---------------------------------------------------------------------------
describe('default export', () => {
  it('contains layout', () => {
    expect(commonStyles.layout).toBe(layout);
  });

  it('contains typography', () => {
    expect(commonStyles.typography).toBe(typography);
  });

  it('contains buttons', () => {
    expect(commonStyles.buttons).toBe(buttons);
  });

  it('contains forms', () => {
    expect(commonStyles.forms).toBe(forms);
  });

  it('contains cards', () => {
    expect(commonStyles.cards).toBe(cards);
  });

  it('contains animations', () => {
    expect(commonStyles.animations).toBe(animations);
  });

  it('contains spacing', () => {
    expect(commonStyles.spacing).toBe(spacing);
  });

  it('contains colors', () => {
    expect(commonStyles.colors).toBe(colors);
  });

  it('contains states', () => {
    expect(commonStyles.states).toBe(states);
  });

  it('contains presets', () => {
    expect(commonStyles.presets).toBe(presets);
  });

  it('contains cn', () => {
    expect(commonStyles.cn).toBe(cn);
  });
});
