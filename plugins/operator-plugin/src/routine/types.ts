export type RoutineState = {
    active: boolean;
    fileName: string | null;
    cycleCount: number;
};

export const DEFAULT_ROUTINE_STATE: RoutineState = {
    active: false,
    fileName: null,
    cycleCount: 0,
};

export type ChecklistKind = 'full' | 'short';
