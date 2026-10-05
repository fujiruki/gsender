import type { WorkflowState } from '../workflow/types';

const SLOT_NAME_PATTERN = /"([^"]+)"/;

// Fixed-text reasons: deriveWorkflowState.ts returns the exact same English
// sentence for these states every time (no interpolation), so a lookup by
// state alone is enough -- the `reason` argument isn't even consulted.
const FIXED_REASONS: Partial<Record<WorkflowState, string>> = {
    DISCONNECTED: 'マシンが接続されていません。',
    ALARM: 'コントローラーがアラーム状態です。',
    RUNNING: 'ジョブを実行中です。',
    PAUSED: '実行中のジョブが一時停止しています。',
    HOMING: '原点復帰サイクルが進行中です。',
    CONNECTED_UNHOMED: '接続済みですが、まだ原点復帰していません。',
    PROBING: 'このPluginが開始した処理が進行中です。',
    G92_PRESENT: '一時オフセット(G92)が残っています。続行する前にクリアしてください。',
    HOMED_UNVERIFIED: 'G54が保存済みの原点スロットと一致しません。',
};

// For ORIGIN_SET/READY/FILE_LOADED, deriveWorkflowState.ts interpolates the
// matched slot's name into its English sentence. Re-building the Japanese
// sentence around that same (already-Japanese, since slot names are stored
// in Japanese) name avoids touching deriveWorkflowState.ts itself.
const SLOT_NAME_TEMPLATES: Partial<Record<WorkflowState, (name: string) => string>> =
    {
        // spec/07: READY requires fileLoaded in addition to ORIGIN_SET, but
        // the startup stepper has no step of its own for "load a file" --
        // without this hint ORIGIN_SET looks identical to a stuck/broken
        // step 5 (see T8's real-machine report).
        ORIGIN_SET: (name) =>
            `原点が「${name}」と一致しています。続けるにはG-codeファイルを読み込んでください。`,
        READY: (name) =>
            `原点が「${name}」と一致し、ファイルが読み込まれ、マシンは待機中です。`,
        FILE_LOADED: (name) =>
            `原点が「${name}」と一致し、ファイルが読み込まれています。`,
    };

export const translateWorkflowReason = (
    state: WorkflowState,
    reason: string,
): string => {
    const fixed = FIXED_REASONS[state];
    if (fixed) {
        return fixed;
    }

    const template = SLOT_NAME_TEMPLATES[state];
    if (template) {
        const match = reason.match(SLOT_NAME_PATTERN);
        if (match) {
            return template(match[1]);
        }
    }

    return reason;
};
