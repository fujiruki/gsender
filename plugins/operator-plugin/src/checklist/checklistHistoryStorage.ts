import { storage } from '@sienci/gsender-plugin-sdk';

import type { ChecklistHistoryEntry, ChecklistItemId } from './types';

export const CHECKLIST_HISTORY_STORAGE_KEY = 'checklistHistory';

export const appendChecklistHistoryEntry = (
    history: ChecklistHistoryEntry[],
    entry: ChecklistHistoryEntry,
): ChecklistHistoryEntry[] => [...history, entry];

/**
 * Audit log only -- never read back to decide whether the checklist is
 * "already done" (that would defeat the safe-by-default re-check-on-reload
 * rule). `now` is injectable for deterministic tests.
 */
export const recordChecklistCompletion = async (
    itemIds: ChecklistItemId[],
    now: () => string = () => new Date().toISOString(),
): Promise<void> => {
    const history =
        (await storage.get<ChecklistHistoryEntry[]>(
            CHECKLIST_HISTORY_STORAGE_KEY,
            [],
        )) ?? [];
    const next = appendChecklistHistoryEntry(history, {
        completedAt: now(),
        itemIds,
    });
    await storage.set(CHECKLIST_HISTORY_STORAGE_KEY, next);
};
