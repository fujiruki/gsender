import { beforeEach, describe, expect, it, vi } from 'vitest';

import { restoreOrigin } from '../restoreOrigin';
import type { RestoreDeps, RestoreGuardState, RestoreTarget } from '../types';

const readyGuard: RestoreGuardState = {
    isConnected: true,
    activeState: 'Idle',
    workflowState: 'idle',
    hasHomed: true,
    pluginBusy: false,
};

const USUAL_FRONT_LEFT: RestoreTarget = {
    kind: 'xyz',
    slot: {
        id: 'usual-front-left',
        name: 'Usual front-left',
        x: -345.801,
        y: -213.302,
        z: -57.665,
    },
};

const NC_BOTTOM: RestoreTarget = {
    kind: 'z',
    slot: { id: 'nc-bottom-z0', name: 'NC bottom Z0', z: -100.118 },
    materialThicknessMm: 12.7,
};

const okResponse = (...lines: string[]) =>
    Promise.resolve({ lines: [...lines, 'ok'] });

const matchingG54Line = (x: number, y: number, z: number) =>
    `[G54:${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}]`;

const ZERO_G92 = '[G92:0.000,0.000,0.000]';
const NONZERO_G92 = '[G92:1.000,0.000,0.000]';

/**
 * Keyed on the exact command rather than call order: `restoreOrigin` now
 * sends every line of the restore sequence as its own awaited
 * `query()` call (see T8's real-machine ORIGIN_MISMATCH finding -- mixing
 * a feeder-queued gcode batch with a direct verification query raced the
 * two, sometimes reading back a stale/missing G54). The first `$#` is the
 * leading G92 check, the (strictly later) second `$#` is the final verify.
 */
const makeQueryMock = (opts: { g92?: string; finalG54Line: string }) => {
    const g92Line = opts.g92 ?? ZERO_G92;
    let hashCallCount = 0;
    return vi.fn((cmd: string) => {
        if (cmd === '$#') {
            hashCallCount += 1;
            return hashCallCount === 1
                ? okResponse(g92Line)
                : okResponse(opts.finalG54Line);
        }
        return okResponse();
    });
};

describe('restoreOrigin', () => {
    let deps: RestoreDeps;

    beforeEach(() => {
        deps = {
            query: vi.fn(),
            confirmClearG92: vi.fn(),
        };
    });

    it('refuses without touching the machine when the guard blocks', async () => {
        const result = await restoreOrigin(
            USUAL_FRONT_LEFT,
            { ...readyGuard, isConnected: false },
            deps,
        );

        expect(result).toEqual({
            outcome: 'BLOCKED',
            reason: 'マシンが接続されていません。',
        });
        expect(deps.query).not.toHaveBeenCalled();
    });

    it('sends each restore line as its own awaited query, in order, never batched through the feeder', async () => {
        deps.query = makeQueryMock({
            finalG54Line: matchingG54Line(-345.801, -213.302, -57.665),
        });

        const result = await restoreOrigin(USUAL_FRONT_LEFT, readyGuard, deps);

        expect(result.outcome).toBe('ORIGIN_SET');
        expect(deps.confirmClearG92).not.toHaveBeenCalled();

        const queryMock = deps.query as ReturnType<typeof vi.fn>;
        const commandsSent = queryMock.mock.calls.map((call) => call[0]);
        expect(commandsSent).toEqual([
            '$#', // leading G92 check
            'G21',
            'G90',
            'G54',
            'G10 L2 P1 X-345.801 Y-213.302 Z-57.665',
            '$#', // final verify -- strictly after every restore line resolved
        ]);
    });

    it('detects a leftover G92, clears it only after approval, then restores', async () => {
        deps.query = makeQueryMock({
            g92: NONZERO_G92,
            finalG54Line: matchingG54Line(-345.801, -213.302, -57.665),
        });
        (deps.confirmClearG92 as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const result = await restoreOrigin(USUAL_FRONT_LEFT, readyGuard, deps);

        expect(result.outcome).toBe('ORIGIN_SET');
        expect(deps.confirmClearG92).toHaveBeenCalledTimes(1);

        const queryMock = deps.query as ReturnType<typeof vi.fn>;
        const commandsSent = queryMock.mock.calls.map((call) => call[0]);
        expect(commandsSent).toEqual([
            '$#',
            'G92.1', // cleared via query too, not a separate sendGcode channel
            'G21',
            'G90',
            'G54',
            'G10 L2 P1 X-345.801 Y-213.302 Z-57.665',
            '$#',
        ]);
    });

    it('cancels without sending any restore gcode when G92 clear is declined', async () => {
        deps.query = makeQueryMock({
            g92: NONZERO_G92,
            finalG54Line: matchingG54Line(-345.801, -213.302, -57.665),
        });
        (deps.confirmClearG92 as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await restoreOrigin(USUAL_FRONT_LEFT, readyGuard, deps);

        expect(result).toEqual({
            outcome: 'CANCELLED',
            reason: 'G92のクリアが承認されませんでした。',
        });

        const queryMock = deps.query as ReturnType<typeof vi.fn>;
        expect(queryMock.mock.calls.map((call) => call[0])).toEqual(['$#']);
    });

    it('reports ORIGIN_MISMATCH when the post-restore G54 does not match', async () => {
        deps.query = makeQueryMock({
            finalG54Line: matchingG54Line(0, 0, 0),
        });

        const result = await restoreOrigin(USUAL_FRONT_LEFT, readyGuard, deps);

        expect(result.outcome).toBe('ORIGIN_MISMATCH');
        if (result.outcome === 'ORIGIN_MISMATCH') {
            expect(result.g54).toEqual({ x: '0.000', y: '0.000', z: '0.000' });
            expect(result.expected).toEqual({
                x: '-345.801',
                y: '-213.302',
                z: '-57.665',
            });
        }
    });

    it('reports ORIGIN_MISMATCH (not a crash) when the final $# response has no G54 line at all', async () => {
        // Regression guard for the exact T8 symptom: a premature/garbled
        // response with no G54 line must not be silently treated as a match.
        deps.query = vi.fn((cmd: string) =>
            cmd === '$#' ? okResponse() : okResponse(),
        );

        const result = await restoreOrigin(USUAL_FRONT_LEFT, readyGuard, deps);

        expect(result.outcome).toBe('ORIGIN_MISMATCH');
        if (result.outcome === 'ORIGIN_MISMATCH') {
            expect(result.g54).toEqual({ x: '0', y: '0', z: '0' });
        }
    });

    it('restores a Z-only slot with the material thickness added, leaving X/Y alone', async () => {
        deps.query = makeQueryMock({
            finalG54Line: matchingG54Line(-345.801, -213.302, -87.418),
        });

        const result = await restoreOrigin(NC_BOTTOM, readyGuard, deps);

        const queryMock = deps.query as ReturnType<typeof vi.fn>;
        expect(queryMock.mock.calls.map((call) => call[0])).toEqual([
            '$#',
            'G21',
            'G90',
            'G54',
            'G10 L2 P1 Z-87.418',
            '$#',
        ]);
        expect(result.outcome).toBe('ORIGIN_SET');
    });

    it('matches a Z-only restore on Z alone, ignoring X/Y drift', async () => {
        deps.query = makeQueryMock({
            // X/Y are whatever they happened to be before -- not the slot's concern
            finalG54Line: matchingG54Line(12.345, 67.89, -87.418),
        });

        const result = await restoreOrigin(NC_BOTTOM, readyGuard, deps);

        expect(result.outcome).toBe('ORIGIN_SET');
    });
});
