import { describe, expect, it } from 'vitest';

import { canRestoreOrigin } from '../canRestoreOrigin';
import type { RestoreGuardState } from '../types';

const readyState: RestoreGuardState = {
    isConnected: true,
    activeState: 'Idle',
    workflowState: 'idle',
    hasHomed: true,
    pluginBusy: false,
};

describe('canRestoreOrigin', () => {
    it('allows when connected, idle, homed, and not busy', () => {
        expect(canRestoreOrigin(readyState)).toEqual({ allowed: true });
    });

    it('blocks when not connected', () => {
        const result = canRestoreOrigin({ ...readyState, isConnected: false });
        expect(result.allowed).toBe(false);
    });

    it('blocks when the active state is not Idle', () => {
        const result = canRestoreOrigin({ ...readyState, activeState: 'Run' });
        expect(result.allowed).toBe(false);
    });

    it('blocks when a job workflow is running', () => {
        const result = canRestoreOrigin({
            ...readyState,
            workflowState: 'running',
        });
        expect(result.allowed).toBe(false);
    });

    it('blocks when the machine has not been homed', () => {
        const result = canRestoreOrigin({ ...readyState, hasHomed: false });
        expect(result.allowed).toBe(false);
    });

    it('blocks while the plugin has another operation in progress', () => {
        const result = canRestoreOrigin({ ...readyState, pluginBusy: true });
        expect(result.allowed).toBe(false);
    });

    it('gives a distinct, human-readable reason per blocker', () => {
        const reasons = [
            canRestoreOrigin({ ...readyState, isConnected: false }),
            canRestoreOrigin({ ...readyState, activeState: 'Alarm' }),
            canRestoreOrigin({ ...readyState, workflowState: 'paused' }),
            canRestoreOrigin({ ...readyState, hasHomed: false }),
            canRestoreOrigin({ ...readyState, pluginBusy: true }),
        ].map((r) => (r.allowed ? null : r.reason));

        expect(new Set(reasons).size).toBe(reasons.length);
        expect(reasons.every((r) => typeof r === 'string' && r.length > 0)).toBe(
            true,
        );
    });
});
