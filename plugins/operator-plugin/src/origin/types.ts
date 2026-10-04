import type { OriginSlot, ParameterOffset } from '../workflow/types';

export type { OriginSlot, ParameterOffset };

/**
 * "NC bottom Z0" and similar: a Z-only reference, applied with a per-job
 * material thickness. Kept separate from `OriginSlot` (not fed into
 * deriveWorkflowState's ORIGIN_SET matching) because it only ever touches Z —
 * matching it would require comparing a subset of axes, which the T2 matcher
 * does not do, and a Z-only restore never stands alone as "the" origin.
 */
export type ZOriginSlot = {
    id: string;
    name: string;
    z: number;
};

export type RestoreTarget =
    | { kind: 'xyz'; slot: OriginSlot }
    | { kind: 'z'; slot: ZOriginSlot; materialThicknessMm: number };

export type RestoreGuardState = {
    isConnected: boolean;
    activeState: string;
    workflowState: string;
    hasHomed: boolean;
    pluginBusy: boolean;
};

export type RestoreGuardResult =
    | { allowed: true }
    | { allowed: false; reason: string };

export type RestoreResult =
    | { outcome: 'BLOCKED'; reason: string }
    | { outcome: 'CANCELLED'; reason: string }
    | { outcome: 'ORIGIN_SET'; g54: ParameterOffset }
    | {
          outcome: 'ORIGIN_MISMATCH';
          g54: ParameterOffset;
          expected: Partial<ParameterOffset>;
      };

export type ParsedParameters = Partial<
    Record<'G54' | 'G55' | 'G56' | 'G57' | 'G58' | 'G59' | 'G92', ParameterOffset>
> & {
    PRB?: ParameterOffset & { ok: boolean };
};

export type RestoreDeps = {
    query: (cmd: string) => Promise<{ lines: string[] }>;
    sendGcode: (lines: string[]) => Promise<unknown>;
    confirmClearG92: () => Promise<boolean>;
};
