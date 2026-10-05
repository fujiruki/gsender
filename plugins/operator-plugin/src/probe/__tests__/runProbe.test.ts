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

const PROBE_LINES = ['G21 G90 G54', 'G38.2 Z-10 F70', '$#'];

describe('runProbe', () => {
    let deps: RunProbeDeps;

    beforeEach(() => {
        deps = {
            query: vi.fn(),
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

    it('sends each probe line as its own awaited query, in order, never batched through the feeder', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:0.000,0.000,0.000]')) // leading G92 check
            .mockImplementationOnce(() => okResponse()) // G21 G90 G54
            .mockImplementationOnce(() => okResponse()) // G38.2 (contact)
            .mockImplementationOnce(() => okResponse('[G54:1.000,2.000,3.000]')) // in-batch '$#'
            .mockImplementationOnce(() =>
                okResponse('[G54:1.000,2.000,3.000]'),
            ); // runProbe's own final verify '$#'

        const result = await runProbe(PROBE_LINES, readyGuard, deps);

        expect(result).toEqual({
            outcome: 'DONE',
            g54: { x: '1.000', y: '2.000', z: '3.000' },
        });
        expect(deps.confirmClearG92).not.toHaveBeenCalled();

        const queryMock = deps.query as ReturnType<typeof vi.fn>;
        expect(queryMock.mock.calls.map((call) => call[0])).toEqual([
            '$#',
            'G21 G90 G54',
            'G38.2 Z-10 F70',
            '$#',
            '$#',
        ]);
        const setBusyMock = deps.setBusy as ReturnType<typeof vi.fn>;
        expect(setBusyMock.mock.calls[0]).toEqual([true, 'プローブ中']);
        expect(setBusyMock.mock.calls[1]).toEqual([false]);
    });

    it('detects a leftover G92, clears it only after approval (via query, not a separate sendGcode), then probes', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:1.000,0.000,0.000]'))
            .mockImplementationOnce(() => okResponse()) // G92.1
            .mockImplementationOnce(() => okResponse())
            .mockImplementationOnce(() => okResponse())
            .mockImplementationOnce(() => okResponse())
            .mockImplementationOnce(() =>
                okResponse('[G54:1.000,2.000,3.000]'),
            );
        (deps.confirmClearG92 as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const result = await runProbe(PROBE_LINES, readyGuard, deps);

        expect(result.outcome).toBe('DONE');
        const queryMock = deps.query as ReturnType<typeof vi.fn>;
        expect(queryMock.mock.calls.map((call) => call[0])).toEqual([
            '$#',
            'G92.1',
            'G21 G90 G54',
            'G38.2 Z-10 F70',
            '$#',
            '$#',
        ]);
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
        expect(deps.setBusy).not.toHaveBeenCalled();
    });

    it('reports TIMEOUT and still clears busy when the machine never settles', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:0.000,0.000,0.000]'))
            .mockImplementationOnce(() => okResponse())
            .mockImplementationOnce(() => okResponse())
            .mockImplementationOnce(() => okResponse());
        (deps.waitForSettle as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await runProbe(PROBE_LINES, readyGuard, deps);

        expect(result).toEqual({ outcome: 'TIMEOUT' });
        const setBusyMock = deps.setBusy as ReturnType<typeof vi.fn>;
        expect(setBusyMock.mock.calls[1]).toEqual([false]);
    });

    it('stops immediately and reports ALARM (not a crash, not a silent DONE) when a probe line responds with ALARM instead of ok -- regression for real-hardware "$#応答にG54の行がありませんでした"', async () => {
        (deps.query as ReturnType<typeof vi.fn>)
            .mockImplementationOnce(() => okResponse('[G92:0.000,0.000,0.000]'))
            .mockImplementationOnce(() => okResponse()) // G21 G90 G54
            .mockImplementationOnce(() =>
                Promise.resolve({ lines: ['ALARM:5'] }),
            ); // G38.2 never contacts

        const result = await runProbe(PROBE_LINES, readyGuard, deps);

        expect(result).toEqual({ outcome: 'ALARM', code: 5 });
        const queryMock = deps.query as ReturnType<typeof vi.fn>;
        // the trailing in-batch '$#' and runProbe's own final verify must
        // never be sent once a line has already alarmed
        expect(queryMock.mock.calls.map((call) => call[0])).toEqual([
            '$#',
            'G21 G90 G54',
            'G38.2 Z-10 F70',
        ]);
        expect(deps.waitForSettle).not.toHaveBeenCalled();
        const setBusyMock = deps.setBusy as ReturnType<typeof vi.fn>;
        expect(setBusyMock.mock.calls[1]).toEqual([false]);
    });
});
