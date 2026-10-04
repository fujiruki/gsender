import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isHomingComplete, runHoming } from '../homing';
import type { HomingDeps } from '../types';

describe('isHomingComplete', () => {
    it('requires both hasHomed and Idle', () => {
        expect(
            isHomingComplete({ hasHomed: true, activeState: 'Idle' }),
        ).toBe(true);
        expect(
            isHomingComplete({ hasHomed: false, activeState: 'Idle' }),
        ).toBe(false);
        expect(
            isHomingComplete({ hasHomed: true, activeState: 'Home' }),
        ).toBe(false);
    });
});

describe('runHoming', () => {
    let deps: HomingDeps;

    beforeEach(() => {
        deps = {
            sendHomingCommand: vi.fn().mockResolvedValue(undefined),
            waitForHomed: vi.fn(),
        };
    });

    it('sends the homing command, then reports HOMED once settled', async () => {
        (deps.waitForHomed as ReturnType<typeof vi.fn>).mockResolvedValue(
            true,
        );

        const result = await runHoming(deps, 60_000);

        expect(deps.sendHomingCommand).toHaveBeenCalledTimes(1);
        expect(deps.waitForHomed).toHaveBeenCalledWith(60_000);
        expect(result).toEqual({ outcome: 'HOMED' });
    });

    it('reports TIMEOUT when the machine never settles within the deadline', async () => {
        (deps.waitForHomed as ReturnType<typeof vi.fn>).mockResolvedValue(
            false,
        );

        const result = await runHoming(deps, 60_000);

        expect(result).toEqual({ outcome: 'TIMEOUT' });
    });
});
