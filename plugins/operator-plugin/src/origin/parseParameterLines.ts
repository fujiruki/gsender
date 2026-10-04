import type { ParsedParameters } from './types';

const OFFSET_PATTERN =
    /^\[(G5[4-9]|G92):([-\d.]+),([-\d.]+),([-\d.]+)(?:,[-\d.]+)*\]$/;

const PRB_PATTERN =
    /^\[PRB:([-\d.]+),([-\d.]+),([-\d.]+)(?:,[-\d.]+)*:([01])\]$/;

/**
 * Parses the lines of a `$#` response into G54-G59/G92 offsets and the last
 * PRB result. Independent of the host's own redux parsing — the restore
 * flow needs the exact response tied to its own query, not a (possibly
 * stale) redux snapshot.
 */
export const parseParameterLines = (lines: string[]): ParsedParameters => {
    const result: ParsedParameters = {};

    for (const line of lines) {
        const offsetMatch = line.match(OFFSET_PATTERN);
        if (offsetMatch) {
            const [, name, x, y, z] = offsetMatch;
            result[name as keyof Omit<ParsedParameters, 'PRB'>] = { x, y, z };
            continue;
        }

        const prbMatch = line.match(PRB_PATTERN);
        if (prbMatch) {
            const [, x, y, z, ok] = prbMatch;
            result.PRB = { x, y, z, ok: ok === '1' };
        }
    }

    return result;
};
