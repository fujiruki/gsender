import type { ChecklistItem, ChecklistState } from './types';

// Descriptions are verbatim from the client's own interview notes
// (2026-10-03, see task.md), not reworded. `imageSrc` is intentionally left
// unset on every item: no real illustration assets exist yet (separate
// task). Setting `imageSrc` later on any item is the entire integration --
// no component change needed.
export const CHECKLIST_ITEMS: ChecklistItem[] = [
    {
        id: 'tool-change',
        label: '刃物交換',
        description: '刃物交換が正しく行われているか',
    },
    {
        id: 'dust-collection',
        label: '集塵機',
        description: '集塵機が動いているか',
    },
    {
        id: 'clearance',
        label: '干渉物',
        description: '移動範囲に金属製の固定具等の干渉物がないか',
    },
    {
        id: 'workpiece-secured',
        label: 'ワーク固定',
        description: 'ワークが固定されているか',
    },
    {
        id: 'clamp-tightness',
        label: '固定具の締め具合',
        description: '固定具の締め具合は確認したか',
    },
    {
        id: 'estop-reachable',
        label: '非常停止・一時停止',
        description: '一時停止・緊急停止ボタンがすぐ押せる体制か',
    },
];

export const emptyChecklistState = (): ChecklistState =>
    Object.fromEntries(
        CHECKLIST_ITEMS.map((item) => [item.id, false]),
    ) as ChecklistState;

export const isChecklistComplete = (state: ChecklistState): boolean =>
    CHECKLIST_ITEMS.every((item) => state[item.id]);
