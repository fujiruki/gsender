import { describe, expect, it } from 'vitest';

import {
    checklistKindToShow,
    createRoutineState,
    incrementCycle,
    shouldAutoDeactivateRoutine,
} from '../routineLogic';
import type { RoutineState } from '../types';

describe('createRoutineState', () => {
    it('starts active, at cycle 0, recording the file loaded at the moment routine mode begins', () => {
        expect(createRoutineState('job.nc')).toEqual({
            active: true,
            fileName: 'job.nc',
            cycleCount: 0,
        });
    });
});

describe('incrementCycle', () => {
    it('bumps cycleCount by one, keeping everything else the same', () => {
        const state: RoutineState = {
            active: true,
            fileName: 'job.nc',
            cycleCount: 2,
        };
        expect(incrementCycle(state)).toEqual({
            active: true,
            fileName: 'job.nc',
            cycleCount: 3,
        });
    });
});

describe('shouldAutoDeactivateRoutine', () => {
    it('is false while the loaded file still matches the recorded one', () => {
        const state: RoutineState = {
            active: true,
            fileName: 'job.nc',
            cycleCount: 3,
        };
        expect(shouldAutoDeactivateRoutine(state, 'job.nc')).toBe(false);
    });

    it('is true once a different file is loaded (prevents running routine against the wrong file)', () => {
        const state: RoutineState = {
            active: true,
            fileName: 'job.nc',
            cycleCount: 3,
        };
        expect(shouldAutoDeactivateRoutine(state, 'other.nc')).toBe(true);
        expect(shouldAutoDeactivateRoutine(state, null)).toBe(true);
    });

    it('is false when routine mode is not active (nothing to deactivate)', () => {
        const state: RoutineState = {
            active: false,
            fileName: 'job.nc',
            cycleCount: 0,
        };
        expect(shouldAutoDeactivateRoutine(state, 'other.nc')).toBe(false);
    });
});

describe('checklistKindToShow', () => {
    it('is full outside routine mode, regardless of cycle count', () => {
        expect(checklistKindToShow(false, 0)).toBe('full');
        expect(checklistKindToShow(false, 5)).toBe('full');
    });

    it('is full for the first cycle of a routine (cycle 0), short from the second cycle on', () => {
        expect(checklistKindToShow(true, 0)).toBe('full');
        expect(checklistKindToShow(true, 1)).toBe('short');
        expect(checklistKindToShow(true, 7)).toBe('short');
    });
});
