import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock, setMock } = vi.hoisted(() => ({
    getMock: vi.fn(),
    setMock: vi.fn(),
}));

vi.mock('@sienci/gsender-plugin-sdk', () => ({
    storage: { get: getMock, set: setMock },
}));

import {
    DEFAULT_ORIGIN_SLOTS,
    DEFAULT_Z_ORIGIN_SLOTS,
    deleteOriginSlot,
    listOriginSlots,
    removeSlot,
    saveOriginSlot,
    upsertSlot,
} from '../originSlotsStorage';
import type { OriginSlot } from '../types';

describe('upsertSlot (pure)', () => {
    it('appends a slot with a new id', () => {
        const slots: OriginSlot[] = [
            { id: 'a', name: 'A', x: 0, y: 0, z: 0 },
        ];
        const result = upsertSlot(slots, { id: 'b', name: 'B', x: 1, y: 1, z: 1 });
        expect(result.map((s) => s.id)).toEqual(['a', 'b']);
    });

    it('replaces the slot in place when the id already exists', () => {
        const slots: OriginSlot[] = [
            { id: 'a', name: 'A', x: 0, y: 0, z: 0 },
            { id: 'b', name: 'B', x: 1, y: 1, z: 1 },
        ];
        const result = upsertSlot(slots, { id: 'a', name: 'A renamed', x: 9, y: 9, z: 9 });
        expect(result).toEqual([
            { id: 'a', name: 'A renamed', x: 9, y: 9, z: 9 },
            { id: 'b', name: 'B', x: 1, y: 1, z: 1 },
        ]);
    });
});

describe('removeSlot (pure)', () => {
    it('removes only the matching id', () => {
        const slots: OriginSlot[] = [
            { id: 'a', name: 'A', x: 0, y: 0, z: 0 },
            { id: 'b', name: 'B', x: 1, y: 1, z: 1 },
        ];
        expect(removeSlot(slots, 'a').map((s) => s.id)).toEqual(['b']);
    });

    it('is a no-op when the id is not found', () => {
        const slots: OriginSlot[] = [{ id: 'a', name: 'A', x: 0, y: 0, z: 0 }];
        expect(removeSlot(slots, 'missing')).toEqual(slots);
    });
});

describe('listOriginSlots', () => {
    beforeEach(() => {
        getMock.mockReset();
        setMock.mockReset();
    });

    it('seeds with the macro-3 "usual front-left" default on first read', async () => {
        getMock.mockImplementation((_key, defaultValue) =>
            Promise.resolve(defaultValue),
        );

        const slots = await listOriginSlots();

        expect(slots).toEqual(DEFAULT_ORIGIN_SLOTS);
        expect(DEFAULT_ORIGIN_SLOTS[0]).toEqual({
            id: 'usual-front-left',
            name: 'いつもの左前XY0',
            x: -345.801,
            y: -213.302,
            z: -57.665,
        });
    });
});

describe('saveOriginSlot / deleteOriginSlot', () => {
    beforeEach(() => {
        getMock.mockReset();
        setMock.mockReset();
    });

    it('reads the current list, upserts, and writes the result back', async () => {
        getMock.mockResolvedValue(DEFAULT_ORIGIN_SLOTS);

        const newSlot: OriginSlot = { id: 'bay-2', name: 'Bay 2', x: 1, y: 2, z: 3 };
        await saveOriginSlot(newSlot);

        expect(setMock).toHaveBeenCalledWith('originSlots', [
            ...DEFAULT_ORIGIN_SLOTS,
            newSlot,
        ]);
    });

    it('removes a slot by id and writes the result back', async () => {
        getMock.mockResolvedValue(DEFAULT_ORIGIN_SLOTS);

        await deleteOriginSlot('usual-front-left');

        expect(setMock).toHaveBeenCalledWith('originSlots', []);
    });
});

describe('DEFAULT_Z_ORIGIN_SLOTS', () => {
    it('matches macro 5 ("NC bottom Z0")', () => {
        expect(DEFAULT_Z_ORIGIN_SLOTS).toEqual([
            { id: 'nc-bottom-z0', name: 'NC底面Z0', z: -100.118 },
        ]);
    });
});
