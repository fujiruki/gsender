import type { ProbeKind } from './types';

/**
 * Each axis is probed twice (feed A, then feed B) with its own G38.2, so
 * the PRB parser should fire this many times for a clean run of the given
 * probe kind. Used only to surface progress/sanity-check in the UI -- not a
 * hard pass/fail gate (real-world contact counts are validated in T8).
 */
export const expectedContactCount = (kind: ProbeKind): number => {
    switch (kind) {
        case 'z':
            return 2;
        case 'xy':
            return 4;
        case 'xyz':
            return 6;
    }
};

export const hasEnoughContacts = (kind: ProbeKind, count: number): boolean =>
    count >= expectedContactCount(kind);

export type ProbeSettleState = {
    activeState: string;
    distanceMode: string;
};

/**
 * The run is only "done" once the machine is back at Idle AND back in G90
 * (absolute) mode -- per spec/07, both must hold; Idle alone can be a
 * mid-sequence pause between G91 moves.
 */
export const isProbeSettled = (state: ProbeSettleState): boolean =>
    state.activeState === 'Idle' && state.distanceMode === 'G90';
