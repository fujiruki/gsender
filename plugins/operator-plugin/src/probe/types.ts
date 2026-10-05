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

export type QueryOptions = {
    until?: RegExp;
    timeout?: number;
};

export type RunProbeDeps = {
    /**
     * The ONLY way runProbe sends anything to the machine -- never the
     * feeder/sendGcode. T8 real-machine finding (Zのみプローブ: "検証の$#応答に
     * G54の行がありませんでした", the same symptom as restoreOrigin's
     * ORIGIN_MISMATCH with X0 Y0 Z0): mixing a feeder-queued gcode batch with
     * a separately-issued direct verify query let a stray "ok" meant for the
     * batch get consumed by the verify's own capture window instead.
     */
    query: (cmd: string, opts?: QueryOptions) => Promise<{ lines: string[] }>;
    confirmClearG92: () => Promise<boolean>;
    setBusy: (busy: boolean, label?: string) => Promise<void>;
    /** Resolves true once Idle+G90 is observed, or false on timeout. */
    waitForSettle: (timeoutMs: number) => Promise<boolean>;
};

export type RunProbeResult =
    | { outcome: 'BLOCKED'; reason: string }
    | { outcome: 'CANCELLED'; reason: string }
    | { outcome: 'TIMEOUT' }
    | { outcome: 'ALARM'; code: number | undefined }
    | { outcome: 'DONE'; g54: ParameterOffset | undefined };
