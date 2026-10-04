import { describe, expect, it } from 'vitest';

import { hashPin, verifyPin } from '../pinHash';

describe('hashPin', () => {
    it('produces a 64-character hex SHA-256 digest', async () => {
        const hash = await hashPin('1234');
        expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('is deterministic for the same input', async () => {
        expect(await hashPin('1234')).toBe(await hashPin('1234'));
    });

    it('differs for different input', async () => {
        expect(await hashPin('1234')).not.toBe(await hashPin('5678'));
    });

    it('never stores the PIN in plaintext form as the hash itself', async () => {
        const hash = await hashPin('1234');
        expect(hash).not.toBe('1234');
    });
});

describe('verifyPin', () => {
    it('accepts the correct PIN against its own hash', async () => {
        const hash = await hashPin('4242');
        expect(await verifyPin('4242', hash)).toBe(true);
    });

    it('rejects an incorrect PIN', async () => {
        const hash = await hashPin('4242');
        expect(await verifyPin('0000', hash)).toBe(false);
    });
});
