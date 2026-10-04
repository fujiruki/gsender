import { describe, expect, it } from 'vitest';

import { deriveJobPhase } from '../jobPhase';

describe('deriveJobPhase', () => {
    it('reports running/paused directly from the workflow:state event', () => {
        expect(deriveJobPhase('running', false)).toBe('running');
        expect(deriveJobPhase('paused', false)).toBe('paused');
        expect(deriveJobPhase('running', true)).toBe('running');
    });

    it('reports idle (not done) when idle and no job was ever started this session', () => {
        expect(deriveJobPhase('idle', false)).toBe('idle');
    });

    it('reports done when idle is reached after having been running/paused', () => {
        expect(deriveJobPhase('idle', true)).toBe('done');
    });
});
