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

describe('restoreOrigin', () => {
    let deps: RestoreDeps;

    beforeEach(() => {
        deps = {
            query: vi.fn(),
            sendGcode: vi.fn().mockResolvedValue(undefined),
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
        expect(deps.sendGcode).not.toHaveBeenCalled();
    });

    it('restores an XYZ slot and reports ORIGIN_SET on a matching verify', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:0.000,0.000,0.000]'))
            .mockImplementationOnce(() =>
                okResponse(matchingG54Line(-345.801, -213.302, -57.665)),
            );

        const result = await restoreOrigin(USUAL_FRONT_LEFT, readyGuard, deps);

        expect(result.outcome).toBe('ORIGIN_SET');
        expect(deps.confirmClearG92).not.toHaveBeenCalled();
        expect(deps.sendGcode).toHaveBeenCalledTimes(1);
        expect(deps.sendGcode).toHaveBeenCalledWith([
            'G21',
            'G90',
            'G54',
            'G10 L2 P1 X-345.801 Y-213.302 Z-57.665',
            '$#',
        ]);
    });

    it('detects a leftover G92, clears it only after approval, then restores', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:1.000,0.000,0.000]'))
            .mockImplementationOnce(() =>
                okResponse(matchingG54Line(-345.801, -213.302, -57.665)),
            );
        (deps.confirmClearG92 as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const result = await restoreOrigin(USUAL_FRONT_LEFT, readyGuard, deps);

        expect(result.outcome).toBe('ORIGIN_SET');
        expect(deps.confirmClearG92).toHaveBeenCalledTimes(1);
        const sendGcodeMock = deps.sendGcode as ReturnType<typeof vi.fn>;
        expect(sendGcodeMock).toHaveBeenCalledTimes(2);
        expect(sendGcodeMock.mock.calls[0]).toEqual([['G92.1']]);
        expect(sendGcodeMock.mock.calls[1][0]).toContain(
            'G10 L2 P1 X-345.801 Y-213.302 Z-57.665',
        );
    });

    it('cancels without sending any restore gcode when G92 clear is declined', async () => {
        (deps.query as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
            okResponse('[G92:1.000,0.000,0.000]'),
        );
        (deps.confirmClearG92 as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await restoreOrigin(USUAL_FRONT_LEFT, readyGuard, deps);

        expect(result).toEqual({
            outcome: 'CANCELLED',
            reason: 'G92のクリアが承認されませんでした。',
        });
        expect(deps.sendGcode).not.toHaveBeenCalled();
    });

    it('reports ORIGIN_MISMATCH when the post-restore G54 does not match', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:0.000,0.000,0.000]'))
            .mockImplementationOnce(() => okResponse(matchingG54Line(0, 0, 0)));

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

    it('restores a Z-only slot with the material thickness added, leaving X/Y alone', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:0.000,0.000,0.000]'))
            .mockImplementationOnce(() =>
                okResponse(matchingG54Line(-345.801, -213.302, -87.418)),
            );

        const result = await restoreOrigin(NC_BOTTOM, readyGuard, deps);

        expect(deps.sendGcode).toHaveBeenCalledWith([
            'G21',
            'G90',
            'G54',
            'G10 L2 P1 Z-87.418',
            '$#',
        ]);
        expect(result.outcome).toBe('ORIGIN_SET');
    });

    it('matches a Z-only restore on Z alone, ignoring X/Y drift', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:0.000,0.000,0.000]'))
            .mockImplementationOnce(() =>
                // X/Y are whatever they happened to be before — not the slot's concern
                okResponse(matchingG54Line(12.345, 67.89, -87.418)),
            );

        const result = await restoreOrigin(NC_BOTTOM, readyGuard, deps);

        expect(result.outcome).toBe('ORIGIN_SET');
    });
});
