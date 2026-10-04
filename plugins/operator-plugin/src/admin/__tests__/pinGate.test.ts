import { describe, expect, it } from 'vitest';

import { hashPin } from '../pinHash';
import { isPinAccepted } from '../pinGate';

describe('isPinAccepted', () => {
    it('accepts anything (no PIN entry needed) when no PIN has been set', async () => {
        expect(await isPinAccepted(null, undefined)).toBe(true);
        expect(await isPinAccepted('whatever', undefined)).toBe(true);
    });

    it('rejects when a PIN is set but none was entered', async () => {
        const storedHash = await hashPin('1234');
        expect(await isPinAccepted(null, storedHash)).toBe(false);
        expect(await isPinAccepted('', storedHash)).toBe(false);
    });

    it('accepts the correct PIN and rejects an incorrect one when a PIN is set', async () => {
        const storedHash = await hashPin('1234');
        expect(await isPinAccepted('1234', storedHash)).toBe(true);
        expect(await isPinAccepted('0000', storedHash)).toBe(false);
    });
});
