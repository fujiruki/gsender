import { describe, expect, it } from 'vitest';

import { STARTUP_STEPS, startupStepIndex } from '../startupStep';
import type { WorkflowState } from '../../workflow/types';

describe('startupStepIndex', () => {
    it('maps each workflow state to the right step in the 5-step sequence', () => {
        const cases: Array<[WorkflowState, number]> = [
            ['DISCONNECTED', 0],
            ['CONNECTED_UNHOMED', 1],
            ['HOMING', 2],
            ['G92_PRESENT', 3],
            ['HOMED_UNVERIFIED', 3],
            ['ORIGIN_SET', 3],
            ['FILE_LOADED', 4],
            ['READY', 4],
        ];
        for (const [state, expected] of cases) {
            expect(startupStepIndex(state)).toBe(expected);
        }
    });

    it('falls back to the connection step for states outside the startup flow (e.g. mid-job)', () => {
        expect(startupStepIndex('RUNNING')).toBe(0);
        expect(startupStepIndex('ALARM')).toBe(0);
        expect(startupStepIndex('PAUSED')).toBe(0);
        expect(startupStepIndex('PROBING')).toBe(0);
    });

    it('has exactly 5 step labels', () => {
        expect(STARTUP_STEPS).toHaveLength(5);
    });
});
