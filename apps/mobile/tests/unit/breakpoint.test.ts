import { getBreakpoint } from '@/hooks/useBreakpoint';

describe('getBreakpoint', () => {
  it.each([
    [320, 'compact'],
    [599, 'compact'],
    [600, 'medium'],
    [899, 'medium'],
    [900, 'expanded'],
    [1366, 'expanded'],
  ] as const)('largeur %i → %s', (width, expected) => {
    expect(getBreakpoint(width)).toBe(expected);
  });
});
