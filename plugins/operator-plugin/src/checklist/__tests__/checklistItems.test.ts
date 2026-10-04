import { describe, expect, it } from 'vitest';

import {
    CHECKLIST_ITEMS,
    emptyChecklistState,
    isChecklistComplete,
} from '../checklistItems';

describe('CHECKLIST_ITEMS', () => {
    it('has exactly the 6 items from the client interview (2026-10-03)', () => {
        expect(CHECKLIST_ITEMS).toHaveLength(6);
        expect(CHECKLIST_ITEMS.map((item) => item.id)).toEqual([
            'tool-change',
            'dust-collection',
            'clearance',
            'workpiece-secured',
            'clamp-tightness',
            'estop-reachable',
        ]);
    });

    it('every item has a label and a description', () => {
        for (const item of CHECKLIST_ITEMS) {
            expect(item.label.length).toBeGreaterThan(0);
            expect(item.description.length).toBeGreaterThan(0);
        }
    });
});

describe('emptyChecklistState', () => {
    it('starts every item unchecked', () => {
        const state = emptyChecklistState();
        expect(Object.values(state).every((checked) => checked === false)).toBe(
            true,
        );
        expect(Object.keys(state)).toHaveLength(6);
    });
});

describe('isChecklistComplete', () => {
    it('is false until every item is checked', () => {
        const state = emptyChecklistState();
        expect(isChecklistComplete(state)).toBe(false);

        state['tool-change'] = true;
        expect(isChecklistComplete(state)).toBe(false);
    });

    it('is true once all 6 items are checked', () => {
        const state = emptyChecklistState();
        for (const item of CHECKLIST_ITEMS) {
            state[item.id] = true;
        }
        expect(isChecklistComplete(state)).toBe(true);
    });
});
