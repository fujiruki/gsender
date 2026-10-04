export type JigVariant = 'right-rear' | 'left-rear';

export type StartPosition = {
    x: number;
    y: number;
};

export type XyzProbeParams = {
    endmillDiameterMm: number;
    jigVariant: JigVariant;
    plateThicknessZMm: number;
    plateThicknessYMm: number;
    plateThicknessXMm: number;
    feedrateAMmMin: number;
    feedrateBMmMin: number;
    zEscapeDistanceMm: number;
    xyStartPosDistanceMm: number;
};

export type ZOnlyProbeParams = {
    plateThicknessZMm: number;
    feedrateAMmMin: number;
    feedrateBMmMin: number;
    zProbeDistanceMm: number;
    zEscapeDistanceMm: number;
};

export type ProbeKind = 'xyz' | 'xy' | 'z';

export type ProbeContact = {
    x: string;
    y: string;
    z: string;
    ok: boolean;
};

export type ParameterOffset = {
    x: string;
    y: string;
    z: string;
};

export type RunProbeDeps = {
    query: (cmd: string) => Promise<{ lines: string[] }>;
    sendGcode: (lines: string[]) => Promise<unknown>;
    confirmClearG92: () => Promise<boolean>;
    setBusy: (busy: boolean, label?: string) => Promise<void>;
    /** Resolves true once Idle+G90 is observed, or false on timeout. */
    waitForSettle: (timeoutMs: number) => Promise<boolean>;
};

export type RunProbeResult =
    | { outcome: 'BLOCKED'; reason: string }
    | { outcome: 'CANCELLED'; reason: string }
    | { outcome: 'TIMEOUT' }
    | { outcome: 'DONE'; g54: ParameterOffset | undefined };
