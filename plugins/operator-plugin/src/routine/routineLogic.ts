import type { ChecklistKind, RoutineState } from './types';

export const createRoutineState = (fileName: string): RoutineState => ({
    active: true,
    fileName,
    cycleCount: 0,
});

export const incrementCycle = (state: RoutineState): RoutineState => ({
    ...state,
    cycleCount: state.cycleCount + 1,
});

/**
 * Guards against running a routine against a swapped-in file by accident:
 * once the loaded file no longer matches what was loaded when routine mode
 * started, the routine is no longer valid for it.
 */
export const shouldAutoDeactivateRoutine = (
    state: RoutineState,
    currentFileName: string | null,
): boolean => state.active && state.fileName !== currentFileName;

/**
 * Cycle 0 is the routine's first run -- the operator already went through
 * the full checklist to reach READY in the first place, same as any normal
 * job. From cycle 1 onward (every material swap, including a swap right
 * after resuming from an ALARM mid-routine), only the confirmed 2-item
 * short checklist applies.
 */
export const checklistKindToShow = (
    routineActive: boolean,
    cycleCount: number,
): ChecklistKind => (routineActive && cycleCount > 0 ? 'short' : 'full');
