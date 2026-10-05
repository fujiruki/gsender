import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RestoreGuardState } from '../../origin/types';
import { runProbe } from '../runProbe';
import type { RunProbeDeps } from '../types';

const readyGuard: RestoreGuardState = {
    isConnected: true,
    activeState: 'Idle',
    workflowState: 'idle',
    hasHomed: true,
    pluginBusy: false,
};

const okResponse = (...lines: string[]) =>
    Promise.resolve({ lines: [...lines, 'ok'] });

const PROBE_LINES = ['G21 G90 G54', '$#'];

describe('runProbe', () => {
    let deps: RunProbeDeps;

    beforeEach(() => {
        deps = {
            query: vi.fn(),
            sendGcode: vi.fn().mockResolvedValue(undefined),
            confirmClearG92: vi.fn(),
            setBusy: vi.fn().mockResolvedValue(undefined),
            waitForSettle: vi.fn().mockResolvedValue(true),
        };
    });

    it('refuses without touching the machine when the guard blocks', async () => {
        const result = await runProbe(
            PROBE_LINES,
            { ...readyGuard, hasHomed: false },
            deps,
        );

        expect(result).toEqual({
            outcome: 'BLOCKED',
            reason: 'まだ原点復帰していません。',
        });
        expect(deps.query).not.toHaveBeenCalled();
        expect(deps.setBusy).not.toHaveBeenCalled();
    });

    it('runs to completion: busy flag set/cleared, settles, reads back G54', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:0.000,0.000,0.000]'))
            .mockImplementationOnce(() =>
                okResponse('[G54:1.000,2.000,3.000]'),
            );

        const result = await runProbe(PROBE_LINES, readyGuard, deps);

        expect(result).toEqual({
            outcome: 'DONE',
            g54: { x: '1.000', y: '2.000', z: '3.000' },
        });
        expect(deps.confirmClearG92).not.toHaveBeenCalled();
        expect(deps.sendGcode).toHaveBeenCalledWith(PROBE_LINES);
        const setBusyMock = deps.setBusy as ReturnType<typeof vi.fn>;
        expect(setBusyMock.mock.calls[0]).toEqual([true, 'プローブ中']);
        expect(setBusyMock.mock.calls[1]).toEqual([false]);
    });

    it('detects a leftover G92, clears it only after approval, then probes', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:1.000,0.000,0.000]'))
            .mockImplementationOnce(() =>
                okResponse('[G54:1.000,2.000,3.000]'),
            );
        (deps.confirmClearG92 as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const result = await runProbe(PROBE_LINES, readyGuard, deps);

        expect(result.outcome).toBe('DONE');
        const sendGcodeMock = deps.sendGcode as ReturnType<typeof vi.fn>;
        expect(sendGcodeMock.mock.calls[0]).toEqual([['G92.1']]);
        expect(sendGcodeMock.mock.calls[1]).toEqual([PROBE_LINES]);
    });

    it('cancels without probing or setting busy when G92 clear is declined', async () => {
        (deps.query as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
            okResponse('[G92:1.000,0.000,0.000]'),
        );
        (deps.confirmClearG92 as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await runProbe(PROBE_LINES, readyGuard, deps);

        expect(result).toEqual({
            outcome: 'CANCELLED',
            reason: 'G92のクリアが承認されませんでした。',
        });
        expect(deps.sendGcode).not.toHaveBeenCalled();
        expect(deps.setBusy).not.toHaveBeenCalled();
    });

    it('reports TIMEOUT and still clears busy when the machine never settles', async () => {
        (deps.query as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
            okResponse('[G92:0.000,0.000,0.000]'),
        );
        (deps.waitForSettle as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await runProbe(PROBE_LINES, readyGuard, deps);

        expect(result).toEqual({ outcome: 'TIMEOUT' });
        const setBusyMock = deps.setBusy as ReturnType<typeof vi.fn>;
        expect(setBusyMock.mock.calls[1]).toEqual([false]);
    });
});
