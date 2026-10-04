import type { ChecklistItem, ChecklistState } from './types';

// Verbatim from the client's own interview notes (2026-10-03), not reworded.
// `imageSrc` is intentionally left unset on every item: no real illustration
// assets exist yet (separate task). Setting `imageSrc` later on any item is
// the entire integration -- no component change needed.
export const CHECKLIST_ITEMS: ChecklistItem[] = [
    {
        id: 'tool-change',
        label: 'Tool change',
        description: 'Confirm the correct tool/endmill is installed and tightened.',
    },
    {
        id: 'dust-collection',
        label: 'Dust collection',
        description: 'Confirm the dust collector is running.',
    },
    {
        id: 'clearance',
        label: 'Clearance',
        description:
            'Confirm no metal clamps or other fixtures sit inside the travel range.',
    },
    {
        id: 'workpiece-secured',
        label: 'Workpiece secured',
        description: 'Confirm the workpiece itself is secured to the table.',
    },
    {
        id: 'clamp-tightness',
        label: 'Clamp tightness',
        description: 'Confirm clamps/fixtures are tightened.',
    },
    {
        id: 'estop-reachable',
        label: 'E-stop reachable',
        description:
            'Confirm the pause/emergency-stop button can be reached immediately.',
    },
];

export const emptyChecklistState = (): ChecklistState =>
    Object.fromEntries(
        CHECKLIST_ITEMS.map((item) => [item.id, false]),
    ) as ChecklistState;

export const isChecklistComplete = (state: ChecklistState): boolean =>
    CHECKLIST_ITEMS.every((item) => state[item.id]);
