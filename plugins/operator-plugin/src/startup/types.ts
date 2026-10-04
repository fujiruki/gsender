import type { RestoreDeps, RestoreGuardState, RestoreResult, RestoreTarget } from '../origin/types';

export type HomingSettleState = {
    hasHomed: boolean;
    activeState: string;
};

export type HomingResult = { outcome: 'HOMED' } | { outcome: 'TIMEOUT' };

export type HomingDeps = {
    sendHomingCommand: () => Promise<unknown>;
    /** Resolves true once hasHomed && activeState==='Idle', false on timeout. */
    waitForHomed: (timeoutMs: number) => Promise<boolean>;
};

export type StartupSequenceResult =
    | { outcome: 'CANCELLED'; reason: string }
    | { outcome: 'HOMING_TIMEOUT' }
    | RestoreResult;

export type StartupSequenceDeps = HomingDeps & {
    confirmSafety: () => Promise<boolean>;
    getGuard: () => RestoreGuardState;
    restoreDeps: RestoreDeps;
};

export type { RestoreTarget };
