import { describe, expect, it } from 'vitest';

import { canExecuteJob } from '../canExecuteJob';

describe('canExecuteJob', () => {
    it('requires both READY (machine-derived) and a complete checklist (operator-confirmed)', () => {
        expect(canExecuteJob('READY', true)).toBe(true);
        expect(canExecuteJob('READY', false)).toBe(false);
        expect(canExecuteJob('FILE_LOADED', true)).toBe(false);
        expect(canExecuteJob('ORIGIN_SET', true)).toBe(false);
        expect(canExecuteJob('ALARM', true)).toBe(false);
    });
});
