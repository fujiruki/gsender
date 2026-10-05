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
    /**
     * The ONLY way restoreOrigin sends anything to the machine -- never the
     * feeder/sendGcode. See T8's real-machine finding (ORIGIN_MISMATCH with
     * X0 Y0 Z0): machine.command('gcode', [...]) only resolves once lines
     * are DELIVERED to the feeder queue, not once the firmware has actually
     * processed them, while machine.query() writes directly to the serial
     * port and waits for Grbl's real "ok"/response. Mixing the two let a
     * verification query race ahead of the feeder's still-queued G10 L2,
     * sometimes reading back a stale (or entirely missing) G54.
     */
    query: (cmd: string) => Promise<{ lines: string[] }>;
    confirmClearG92: () => Promise<boolean>;
};
