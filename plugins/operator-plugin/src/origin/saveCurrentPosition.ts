import { parseParameterLines } from './parseParameterLines';
import type { OriginSlot, RestoreDeps } from './types';

const toNumber = (value: string): number => Number.parseFloat(value) || 0;

const generateSlotId = (): string =>
    `slot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Admin-only convenience: jog to a known physical reference point, then call
 * this to bookmark the machine's currently-active G54 as a reusable,
 * position-independent slot.
 *
 * Reads the active G54 via `$#` only — it never sends any G-code. The
 * active G54 is already the absolute machine-coordinate value we want to
 * persist, so there is nothing to compute or redefine; issuing a command
 * (e.g. `G10 L20`) here would needlessly rewrite the machine's live WCS
 * setting just to read a value that was already available.
 *
 * Role enforcement (Admin vs Operator) is T7 scope; this function does not
 * itself check a role.
 */
export const saveCurrentPositionAsOriginSlot = async (
    name: string,
    deps: Pick<RestoreDeps, 'query'>,
): Promise<OriginSlot> => {
    const response = await deps.query('$#');
    const { G54 } = parseParameterLines(response.lines);
    if (!G54) {
        throw new Error('No G54 line in the $# response.');
    }

    return {
        id: generateSlotId(),
        name,
        x: toNumber(G54.x),
        y: toNumber(G54.y),
        z: toNumber(G54.z),
    };
};
