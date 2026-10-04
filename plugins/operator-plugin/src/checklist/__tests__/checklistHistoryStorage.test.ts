import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock, setMock } = vi.hoisted(() => ({
    getMock: vi.fn(),
    setMock: vi.fn(),
}));

vi.mock('@sienci/gsender-plugin-sdk', () => ({
    storage: { get: getMock, set: setMock },
}));

import {
    appendChecklistHistoryEntry,
    recordChecklistCompletion,
} from '../checklistHistoryStorage';
import type { ChecklistHistoryEntry } from '../types';

describe('appendChecklistHistoryEntry (pure)', () => {
    it('adds the new entry to the end, keeping prior entries', () => {
        const existing: ChecklistHistoryEntry[] = [
            { completedAt: '2026-10-01T00:00:00.000Z', itemIds: ['tool-change'] },
        ];
        const next: ChecklistHistoryEntry = {
            completedAt: '2026-10-04T00:00:00.000Z',
            itemIds: ['tool-change', 'dust-collection'],
        };

        expect(appendChecklistHistoryEntry(existing, next)).toEqual([
            ...existing,
            next,
        ]);
    });

    it('does not mutate the input array', () => {
        const existing: ChecklistHistoryEntry[] = [];
        const result = appendChecklistHistoryEntry(existing, {
            completedAt: '2026-10-04T00:00:00.000Z',
            itemIds: [],
        });
        expect(existing).toHaveLength(0);
        expect(result).toHaveLength(1);
    });
});

describe('recordChecklistCompletion', () => {
    beforeEach(() => {
        getMock.mockReset();
        setMock.mockReset();
    });

    it('reads the existing history, appends, and writes it back', async () => {
        getMock.mockResolvedValue([]);

        await recordChecklistCompletion(
            ['tool-change', 'dust-collection'],
            () => '2026-10-04T12:00:00.000Z',
        );

        expect(setMock).toHaveBeenCalledWith('checklistHistory', [
            {
                completedAt: '2026-10-04T12:00:00.000Z',
                itemIds: ['tool-change', 'dust-collection'],
            },
        ]);
    });
});
