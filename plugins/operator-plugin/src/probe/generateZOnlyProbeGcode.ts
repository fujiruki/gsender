import type { ZOnlyProbeParams } from './types';

export const Z_ONLY_PROBE_DEFAULTS: ZOnlyProbeParams = {
    plateThicknessZMm: 5.01,
    feedrateAMmMin: 70,
    feedrateBMmMin: 30,
    zProbeDistanceMm: 10,
    zEscapeDistanceMm: 10,
};

const formatGcodeNumber = (value: number): string =>
    String(Math.round(value * 1000) / 1000);

/**
 * Macro 4 ("Z-only probing") migrated per spec/07: `G10 L20 P0` -> `P1`
 * (explicit G54 instead of "whatever WCS is active"), with a `G21 G54`
 * lead-in added to match.
 */
export const generateZOnlyProbeGcode = (params: ZOnlyProbeParams): string[] => {
    const n = formatGcodeNumber;
    return [
        'G21 G54',
        'G91',
        `G38.2 Z${n(-params.zProbeDistanceMm)} F${n(params.feedrateAMmMin)}`,
        'G0 Z1',
        `G38.2 Z${n(-params.zProbeDistanceMm)} F${n(params.feedrateBMmMin)}`,
        'G4 P0.1',
        `G10 L20 P1 Z${n(params.plateThicknessZMm)}`,
        'G4 P0.1',
        `G0 Z${n(params.zEscapeDistanceMm)}`,
        'G90',
    ];
};
