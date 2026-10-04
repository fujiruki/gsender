import type { RestoreGuardResult, RestoreGuardState } from './types';

/**
 * Safety gate for any origin restore/save action: spec/07's guard condition,
 * verbatim. Used both to disable the UI controls and, defense-in-depth,
 * inside `restoreOrigin` itself in case UI state went stale between render
 * and click.
 */
export const canRestoreOrigin = (
    guard: RestoreGuardState,
): RestoreGuardResult => {
    if (!guard.isConnected) {
        return { allowed: false, reason: 'Machine is not connected.' };
    }
    if (guard.workflowState !== 'idle') {
        return { allowed: false, reason: 'A job is currently running or paused.' };
    }
    if (guard.activeState !== 'Idle') {
        return {
            allowed: false,
            reason: `Machine is not idle (current state: ${guard.activeState}).`,
        };
    }
    if (!guard.hasHomed) {
        return { allowed: false, reason: 'Machine has not been homed yet.' };
    }
    if (guard.pluginBusy) {
        return {
            allowed: false,
            reason: 'Another plugin-driven operation is still in progress.',
        };
    }
    return { allowed: true };
};
