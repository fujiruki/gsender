import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RestoreGuardState, RestoreTarget } from '../../origin/types';
import { runStartupSequence } from '../runStartupSequence';
import type { StartupSequenceDeps } from '../types';

const homedGuard: RestoreGuardState = {
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

const okResponse = (...lines: string[]) =>
    Promise.resolve({ lines: [...lines, 'ok'] });

const matchingG54Line = (x: number, y: number, z: number) =>
    `[G54:${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}]`;

describe('runStartupSequence', () => {
    let deps: StartupSequenceDeps;

    beforeEach(() => {
        deps = {
            confirmSafety: vi.fn().mockResolvedValue(true),
            sendHomingCommand: vi.fn().mockResolvedValue(undefined),
            waitForHomed: vi.fn().mockResolvedValue(true),
            getGuard: vi.fn().mockReturnValue(homedGuard),
            restoreDeps: {
                query: vi
                    .fn()
                    .mockImplementationOnce(() =>
                        okResponse('[G92:0.000,0.000,0.000]'),
                    )
                    .mockImplementationOnce(() =>
                        okResponse(
                            matchingG54Line(-345.801, -213.302, -57.665),
                        ),
                    ),
                sendGcode: vi.fn().mockResolvedValue(undefined),
                confirmClearG92: vi.fn(),
            },
        };
    });

    it('cancels before touching the machine when the safety check is declined', async () => {
        (deps.confirmSafety as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await runStartupSequence(USUAL_FRONT_LEFT, deps);

        expect(result).toEqual({
            outcome: 'CANCELLED',
            reason: 'Safety check was not confirmed.',
        });
        expect(deps.sendHomingCommand).not.toHaveBeenCalled();
    });

    it('reports HOMING_TIMEOUT and never attempts the restore when homing never settles', async () => {
        (deps.waitForHomed as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await runStartupSequence(USUAL_FRONT_LEFT, deps);

        expect(result).toEqual({ outcome: 'HOMING_TIMEOUT' });
        expect(deps.restoreDeps.sendGcode).not.toHaveBeenCalled();
    });

    it('runs safety confirm -> homing -> restoreOrigin end to end and returns its ORIGIN_SET result', async () => {
        const result = await runStartupSequence(USUAL_FRONT_LEFT, deps);

        expect(deps.confirmSafety).toHaveBeenCalledTimes(1);
        expect(deps.sendHomingCommand).toHaveBeenCalledTimes(1);
        expect(deps.getGuard).toHaveBeenCalled();
        expect(result.outcome).toBe('ORIGIN_SET');
        expect(deps.restoreDeps.sendGcode).toHaveBeenCalledWith([
            'G21',
            'G90',
            'G54',
            'G10 L2 P1 X-345.801 Y-213.302 Z-57.665',
            '$#',
        ]);
    });

    it('reads the guard AFTER homing completes, not before (hasHomed only becomes true post-homing)', async () => {
        const guardSequence: RestoreGuardState[] = [];
        (deps.getGuard as ReturnType<typeof vi.fn>).mockImplementation(() => {
            guardSequence.push(homedGuard);
            return homedGuard;
        });
        (deps.waitForHomed as ReturnType<typeof vi.fn>).mockImplementation(
            async () => {
                // by the time waitForHomed resolves, getGuard must not have
                // been called yet -- it's only read for the restore step
                expect(deps.getGuard).not.toHaveBeenCalled();
                return true;
            },
        );

        await runStartupSequence(USUAL_FRONT_LEFT, deps);

        expect(guardSequence.length).toBeGreaterThan(0);
    });
});
