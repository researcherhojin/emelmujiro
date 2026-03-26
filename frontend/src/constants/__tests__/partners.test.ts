import { describe, it, expect } from 'vitest';
import { PARTNER_COMPANIES } from '../index';

describe('constants/partners', () => {
  it('exports PARTNER_COMPANIES array via barrel', () => {
    expect(Array.isArray(PARTNER_COMPANIES)).toBe(true);
    expect(PARTNER_COMPANIES.length).toBeGreaterThan(0);
  });

  it('each partner has required fields', () => {
    PARTNER_COMPANIES.forEach((partner) => {
      expect(partner.id).toBeTruthy();
      expect(partner.name).toBeTruthy();
      expect(partner.logo).toBeTruthy();
      expect(['enterprise', 'education', 'public']).toContain(partner.category);
      expect(partner.description).toBeTruthy();
    });
  });

  it('has unique IDs', () => {
    const ids = PARTNER_COMPANIES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
