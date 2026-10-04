export type ChecklistItemId =
    | 'tool-change'
    | 'dust-collection'
    | 'clearance'
    | 'workpiece-secured'
    | 'clamp-tightness'
    | 'estop-reachable';

export type ChecklistItem = {
    id: ChecklistItemId;
    label: string;
    description: string;
    /** Left unset until real illustrations exist; the UI falls back to a
     * generic placeholder box when this is undefined. Fill in later without
     * touching any component code. */
    imageSrc?: string;
};

export type ChecklistState = Record<ChecklistItemId, boolean>;

export type ChecklistHistoryEntry = {
    completedAt: string;
    itemIds: ChecklistItemId[];
};

export type JobPhase = 'idle' | 'running' | 'paused' | 'done';
