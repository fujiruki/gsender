import type { WorkflowState } from '../workflow/types';

// Display-only mapping. T2's deriveWorkflowState keeps returning the
// English enum value (its own tests assert on that literal) -- this is
// purely how the UI renders it, nothing upstream changes.
const LABELS: Record<WorkflowState, string> = {
    DISCONNECTED: '未接続',
    ALARM: 'アラーム',
    RUNNING: '実行中',
    PAUSED: '一時停止中',
    HOMING: '原点復帰中',
    CONNECTED_UNHOMED: '原点復帰待ち',
    PROBING: 'プローブ中',
    G92_PRESENT: '一時オフセット残留',
    ORIGIN_SET: '原点設定済み',
    HOMED_UNVERIFIED: '原点未確認',
    FILE_LOADED: 'ファイル読込済み',
    READY: '準備完了',
};

export const workflowStateLabel = (state: WorkflowState): string =>
    LABELS[state];
