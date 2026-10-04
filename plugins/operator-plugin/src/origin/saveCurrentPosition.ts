import { parseParameterLines } from './parseParameterLines';
import type { OriginSlot, RestoreDeps } from './types';

const toNumber = (value: string): number => Number.parseFloat(value) || 0;

const generateSlotId = (): string =>
    `slot-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Admin-only convenience: jog to a known physical reference point, then call
 * this to bookmark it as a reusable, position-independent slot.
 *
 * `G10 L20 P1 X0 Y0 Z0` makes the CURRENT machine position read as (0,0,0) in
 * G54 (`WCS = MPos − target`, so target=0 means WCS = MPos exactly). Reading
 * G54 back immediately after therefore gives the absolute machine-coordinate
 * value to persist — the same kind of constant macro 3/5 hard-code, just
 * captured instead of hand-measured.
 *
 * Role enforcement (Admin vs Operator) is T7 scope; this function does not
 * itself check a role.
 */
export const saveCurrentPositionAsOriginSlot = async (
    name: string,
    deps: Pick<RestoreDeps, 'query' | 'sendGcode'>,
): Promise<OriginSlot> => {
    await deps.sendGcode(['G10 L20 P1 X0 Y0 Z0', '$#']);

    const response = await deps.query('$#');
    const { G54 } = parseParameterLines(response.lines);
    if (!G54) {
        throw new Error('No G54 line in the $# response after G10 L20.');
    }

    return {
        id: generateSlotId(),
        name,
        x: toNumber(G54.x),
        y: toNumber(G54.y),
        z: toNumber(G54.z),
    };
};
