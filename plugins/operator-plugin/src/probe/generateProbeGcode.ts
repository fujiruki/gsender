import type { StartPosition, XyzProbeParams } from './types';

export const ENDMILL_DIAMETER_PRESETS_MM = {
    'phi3.20': 3.2,
    'phi3.16': 3.16,
} as const;

export const PROBE_PARAM_DEFAULTS: Omit<
    XyzProbeParams,
    'endmillDiameterMm' | 'jigVariant'
> = {
    plateThicknessZMm: 5.01,
    plateThicknessYMm: 10.03,
    plateThicknessXMm: 10.0,
    feedrateAMmMin: 70,
    feedrateBMmMin: 30,
    zEscapeDistanceMm: 10,
    xyStartPosDistanceMm: 20,
};

// Keeps gcode numbers free of floating-point noise (e.g. -87.41799999999999)
// while still printing "33" instead of "33.000".
const formatGcodeNumber = (value: number): string =>
    String(Math.round(value * 1000) / 1000);

/**
 * Shared generator for the XYZ and XY-only probes (spec/07's "XYZ一括プローブ"
 * / "XYのみプローブ" sections) -- both are the same sequence, minus the Z-probe
 * contact block for XY-only, with the side-probe descent depth changed from
 * -(zEscape+3) to -zEscape to account for skipping the Z retract.
 *
 * Never generates G92: the two absolute moves macro 1/2 made relative to
 * their `G92 X0 Y0 Z0` origin are replaced with a `G90 / G53 G0 ... / G91`
 * machine-coordinate move relative to `start` (the MPos when probing began).
 */
export const generateProbeGcode = (
    params: XyzProbeParams,
    start: StartPosition,
    options: { includeZ: boolean },
): string[] => {
    const { includeZ } = options;
    const n = formatGcodeNumber;

    const keepoutX = params.jigVariant === 'right-rear' ? -13 : 13;
    const keepoutY = -13;
    const dirX = Math.sign(keepoutX);
    const dirY = Math.sign(keepoutY);
    const D = params.endmillDiameterMm;
    const {
        plateThicknessZMm: plateZ,
        plateThicknessYMm: plateY,
        plateThicknessXMm: plateX,
        feedrateAMmMin: feedA,
        feedrateBMmMin: feedB,
        zEscapeDistanceMm: zEscape,
        xyStartPosDistanceMm: xyStart,
    } = params;

    // -(zEscape+3) when a Z-probe already happened (XYZ); otherwise the
    // starting tip depth itself (-zEscape) is used as the side-probe depth.
    const sideProbeDepth = includeZ ? -(zEscape + 3) : -zEscape;

    const lines: string[] = ['G21 G90 G54', 'G4 P0.5'];

    lines.push(`G91 G0 Z${n(zEscape)}`);

    if (includeZ) {
        lines.push(`G91 G0 X${n(keepoutX)} Y${n(keepoutY)}`);
        lines.push(`G38.2 Z${n(-zEscape)} F${n(feedA)}`);
        lines.push('G0 Z1');
        lines.push(`G38.2 Z${n(-zEscape)} F${n(feedB)}`);
        lines.push('G4 P0.1');
        lines.push(`G10 L20 P1 Z${n(plateZ)}`);
        lines.push('G4 P0.1');
        lines.push(`G0 Z${n(zEscape)}`);
    }

    lines.push(`G0 X${n(-keepoutX - xyStart * dirX)}`);
    lines.push(`G0 Z${n(sideProbeDepth)}`);
    lines.push(`G38.2 X${n(keepoutX)} F${n(feedA)}`);
    lines.push(`G0 X${n(-dirX)}`);
    lines.push(`G38.2 X${n(keepoutX)} F${n(feedB)}`);
    lines.push('G4 P0.1');
    lines.push(`G10 L20 P1 X${n((-D / 2 - plateX) * dirX)}`);
    lines.push('G4 P0.1');
    lines.push(`G0 X${n(-keepoutX / 2)}`);
    lines.push(`G0 Z${n(zEscape)}`);

    lines.push('G90');
    lines.push(
        `G53 G0 X${n(start.x + keepoutX)} Y${n(start.y - xyStart * dirY)}`,
    );
    lines.push('G91');

    lines.push(`G91 G0 Z${n(sideProbeDepth)}`);
    lines.push(`G38.2 Y${n(keepoutY)} F${n(feedA)}`);
    lines.push(`G0 Y${n(-dirY)}`);
    lines.push(`G38.2 Y${n(keepoutY)} F${n(feedB)}`);
    lines.push('G4 P0.1');
    lines.push(`G10 L20 P1 Y${n((-D / 2 - plateY) * dirY)}`);
    lines.push('G4 P0.1');
    lines.push(`G0 Y${n(-10 * dirY)}`);
    // Literal 20, not zEscape: macro 1/2's own final retract is hardcoded
    // "G0 Z20" regardless of Z_ESCAPE_DISTANCE, so this preserves that as-is
    // rather than "fixing" an inconsistency that isn't ours to change.
    lines.push('G0 Z20');

    lines.push('G90 G0 X0 Y0');
    lines.push('$#');

    return lines;
};
