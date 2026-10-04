import { CHECKLIST_ITEMS } from './checklistItems';
import type { ChecklistItem } from './types';

export type ShortChecklistItemId = 'workpiece-secured' | 'clamp-tightness';

export type ShortChecklistState = Record<ShortChecklistItemId, boolean>;

const SHORT_CHECKLIST_ITEM_IDS: ShortChecklistItemId[] = [
    'workpiece-secured',
    'clamp-tightness',
];

// Client-confirmed (2026-10-04): of the full 6, only these two change on
// every material swap -- tool, dust collection, clearance, and e-stop
// position don't change between repeated cycles of the same routine job.
// Reuses the full items' own label/description rather than re-stating them.
export const SHORT_CHECKLIST_ITEMS: ChecklistItem[] = SHORT_CHECKLIST_ITEM_IDS.map(
    (id) => {
        const item = CHECKLIST_ITEMS.find((candidate) => candidate.id === id);
        if (!item) {
            throw new Error(`Short checklist item "${id}" not found in CHECKLIST_ITEMS`);
        }
        return item;
    },
);

export const emptyShortChecklistState = (): ShortChecklistState => ({
    'workpiece-secured': false,
    'clamp-tightness': false,
});

export const isShortChecklistComplete = (state: ShortChecklistState): boolean =>
    state['workpiece-secured'] && state['clamp-tightness'];
