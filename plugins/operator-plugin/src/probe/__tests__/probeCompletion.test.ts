import { describe, expect, it } from 'vitest';

import {
    expectedContactCount,
    hasEnoughContacts,
    isProbeSettled,
} from '../probeCompletion';

describe('expectedContactCount', () => {
    it('expects 2 contacts per axis (feed A + feed B)', () => {
        expect(expectedContactCount('z')).toBe(2);
        expect(expectedContactCount('xy')).toBe(4);
        expect(expectedContactCount('xyz')).toBe(6);
    });
});

describe('hasEnoughContacts', () => {
    it('is false until the expected count is reached', () => {
        expect(hasEnoughContacts('z', 1)).toBe(false);
        expect(hasEnoughContacts('z', 2)).toBe(true);
        expect(hasEnoughContacts('xyz', 5)).toBe(false);
        expect(hasEnoughContacts('xyz', 6)).toBe(true);
        expect(hasEnoughContacts('xyz', 7)).toBe(true);
    });
});

describe('isProbeSettled', () => {
    it('requires both Idle and G90 (modal distance) to consider the run done', () => {
        expect(
            isProbeSettled({ activeState: 'Idle', distanceMode: 'G90' }),
        ).toBe(true);
        expect(
            isProbeSettled({ activeState: 'Run', distanceMode: 'G90' }),
        ).toBe(false);
        expect(
            isProbeSettled({ activeState: 'Idle', distanceMode: 'G91' }),
        ).toBe(false);
    });
});
