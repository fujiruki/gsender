import { describe, expect, it } from 'vitest';

import {
    SHORT_CHECKLIST_ITEMS,
    emptyShortChecklistState,
    isShortChecklistComplete,
} from '../shortChecklist';

describe('SHORT_CHECKLIST_ITEMS', () => {
    it('has exactly the 2 items confirmed by the client (2026-10-04): workpiece-secured and clamp-tightness', () => {
        expect(SHORT_CHECKLIST_ITEMS.map((item) => item.id)).toEqual([
            'workpiece-secured',
            'clamp-tightness',
        ]);
    });

    it('reuses the full checklist items verbatim (same label/description), not a re-stated copy', () => {
        for (const item of SHORT_CHECKLIST_ITEMS) {
            expect(item.label.length).toBeGreaterThan(0);
            expect(item.description.length).toBeGreaterThan(0);
        }
    });
});

describe('emptyShortChecklistState', () => {
    it('starts both items unchecked', () => {
        expect(emptyShortChecklistState()).toEqual({
            'workpiece-secured': false,
            'clamp-tightness': false,
        });
    });
});

describe('isShortChecklistComplete', () => {
    it('requires both items checked', () => {
        expect(
            isShortChecklistComplete({
                'workpiece-secured': false,
                'clamp-tightness': false,
            }),
        ).toBe(false);
        expect(
            isShortChecklistComplete({
                'workpiece-secured': true,
                'clamp-tightness': false,
            }),
        ).toBe(false);
        expect(
            isShortChecklistComplete({
                'workpiece-secured': true,
                'clamp-tightness': true,
            }),
        ).toBe(true);
    });
});
