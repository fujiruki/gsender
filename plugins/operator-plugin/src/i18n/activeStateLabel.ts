import type { ActiveState } from '../workflow/types';

// Matches the host app's own translations (src/app/src/i18n/locales/ja.json)
// for these same Grbl active-state words, for consistency across the UI.
const LABELS: Record<ActiveState, string> = {
    Idle: 'アイドル',
    Run: '実行',
    Hold: '保留',
    Jog: 'ジョグ中',
    Alarm: 'アラーム',
    Door: 'ドア',
    Check: 'チェック',
    Home: '原点復帰',
    Sleep: 'スリープ',
};

// Accepts a plain string too: canRestoreOrigin's RestoreGuardState.activeState
// is typed loosely as `string` (it comes straight off redux), not the
// narrower ActiveState union. Falls back to the raw value for anything
// unrecognized rather than throwing.
export const activeStateLabel = (state: ActiveState | string): string =>
    LABELS[state as ActiveState] ?? state;
