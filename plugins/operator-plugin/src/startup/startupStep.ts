import type { WorkflowState } from '../workflow/types';

export const STARTUP_STEPS = [
    '接続',
    '安全確認',
    '原点復帰',
    '原点復元',
    '準備完了',
] as const;

/**
 * Where the "接続確認→安全確認→ホーミング→加工原点復元→READY" sequence
 * currently sits, derived from T2's workflow state. States outside that
 * flow (a job already running, an alarm, a plugin-driven probe) fall back
 * to step 0 -- this stepper is about getting TO ready, not what happens
 * after.
 */
export const startupStepIndex = (state: WorkflowState): number => {
    switch (state) {
        case 'DISCONNECTED':
            return 0;
        case 'CONNECTED_UNHOMED':
            return 1;
        case 'HOMING':
            return 2;
        case 'G92_PRESENT':
        case 'HOMED_UNVERIFIED':
        case 'ORIGIN_SET':
            return 3;
        case 'FILE_LOADED':
        case 'READY':
            return 4;
        default:
            return 0;
    }
};
