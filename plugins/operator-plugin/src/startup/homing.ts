import type { HomingDeps, HomingResult, HomingSettleState } from './types';

export const isHomingComplete = (state: HomingSettleState): boolean =>
    state.hasHomed && state.activeState === 'Idle';

/**
 * Macro 3's `$H` step, split out of the "homing + restore origin" macro per
 * spec/07: sends `homing`, then waits for `homing:has-homed` AND a return to
 * Idle (the first status report after a FAILED homing cycle can itself read
 * Alarm, so Idle is required too, not just the hasHomed flag).
 */
export const runHoming = async (
    deps: HomingDeps,
    timeoutMs: number,
): Promise<HomingResult> => {
    await deps.sendHomingCommand();
    const homed = await deps.waitForHomed(timeoutMs);
    return homed ? { outcome: 'HOMED' } : { outcome: 'TIMEOUT' };
};
