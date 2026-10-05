import { restoreOrigin } from '../origin/restoreOrigin';
import type { RestoreTarget } from '../origin/types';
import { runHoming } from './homing';
import type { StartupSequenceDeps, StartupSequenceResult } from './types';

const DEFAULT_HOMING_TIMEOUT_MS = 60_000;

/**
 * Macro 3 ("homing + usual front-left XY0") split per spec/07: the `$H`
 * half lives here as the homing step; the `G10 L2 ...` half is T3's
 * restoreOrigin, called as-is (not reimplemented) once homing settles.
 */
export const runStartupSequence = async (
    target: RestoreTarget,
    deps: StartupSequenceDeps,
    homingTimeoutMs: number = DEFAULT_HOMING_TIMEOUT_MS,
): Promise<StartupSequenceResult> => {
    const approved = await deps.confirmSafety();
    if (!approved) {
        return { outcome: 'CANCELLED', reason: '安全確認が承認されませんでした。' };
    }

    const homingResult = await runHoming(deps, homingTimeoutMs);
    if (homingResult.outcome === 'TIMEOUT') {
        return { outcome: 'HOMING_TIMEOUT' };
    }

    // Read fresh: hasHomed only flips true once homing above actually
    // completes, so the guard must not be captured before this point.
    return restoreOrigin(target, deps.getGuard(), deps.restoreDeps);
};
