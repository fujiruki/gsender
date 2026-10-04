import { describe, expect, it, vi } from 'vitest';

import { saveCurrentPositionAsOriginSlot } from '../saveCurrentPosition';
import type { RestoreDeps } from '../types';

describe('saveCurrentPositionAsOriginSlot', () => {
    const okResponse = (...lines: string[]) =>
        Promise.resolve({ lines: [...lines, 'ok'] });

    it('zeroes the current position into G54, then reads back the resulting absolute offset', async () => {
        const deps: Pick<RestoreDeps, 'query' | 'sendGcode'> = {
            sendGcode: vi.fn().mockResolvedValue(undefined),
            query: vi
                .fn()
                .mockResolvedValueOnce(
                    okResponse('[G54:-500.000,-300.000,-60.000]'),
                ),
        };

        const slot = await saveCurrentPositionAsOriginSlot(
            'Jig B front-left',
            deps,
        );

        expect(deps.sendGcode).toHaveBeenCalledWith([
            'G10 L20 P1 X0 Y0 Z0',
            '$#',
        ]);
        expect(slot).toEqual({
            id: expect.any(String),
            name: 'Jig B front-left',
            x: -500,
            y: -300,
            z: -60,
        });
    });

    it('throws rather than saving a bogus slot when the $# response has no G54 line', async () => {
        const deps: Pick<RestoreDeps, 'query' | 'sendGcode'> = {
            sendGcode: vi.fn().mockResolvedValue(undefined),
            query: vi.fn().mockResolvedValueOnce(okResponse()),
        };

        await expect(
            saveCurrentPositionAsOriginSlot('Nameless', deps),
        ).rejects.toThrow(/G54/);
    });
});
