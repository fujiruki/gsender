import { storage } from '@sienci/gsender-plugin-sdk';

import { DEFAULT_ROUTINE_STATE } from './types';
import type { RoutineState } from './types';

export const ROUTINE_STORAGE_KEY = 'routine';

export const getRoutineState = async (): Promise<RoutineState> =>
    (await storage.get<RoutineState>(
        ROUTINE_STORAGE_KEY,
        DEFAULT_ROUTINE_STATE,
    )) ?? DEFAULT_ROUTINE_STATE;

export const setRoutineState = (state: RoutineState): Promise<void> =>
    storage.set(ROUTINE_STORAGE_KEY, state);

export const deactivateRoutine = (): Promise<void> =>
    setRoutineState(DEFAULT_ROUTINE_STATE);
