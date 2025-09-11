import { it, test, describe } from 'vitest';

// Helper for skipping tests in CI environment
// CI has rendering issues with React Testing Library
export const itSkipInCI = process.env.CI === 'true' ? it.skip : it;
export const testSkipInCI = process.env.CI === 'true' ? test.skip : test;
export const describeSkipInCI =
  process.env.CI === 'true' ? describe.skip : describe;
