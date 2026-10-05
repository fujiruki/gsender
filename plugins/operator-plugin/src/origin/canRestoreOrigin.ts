import { activeStateLabel } from '../i18n/activeStateLabel';
import type { RestoreGuardResult, RestoreGuardState } from './types';

/**
 * Safety gate for any origin restore/save action: spec/07's guard condition,
 * verbatim. Used both to disable the UI controls and, defense-in-depth,
 * inside `restoreOrigin` itself in case UI state went stale between render
 * and click.
 */
export const canRestoreOrigin = (
    guard: RestoreGuardState,
): RestoreGuardResult => {
    if (!guard.isConnected) {
        return { allowed: false, reason: 'マシンが接続されていません。' };
    }
    if (guard.workflowState !== 'idle') {
        return { allowed: false, reason: 'ジョブが実行中または一時停止中です。' };
    }
    if (guard.activeState !== 'Idle') {
        return {
            allowed: false,
            reason: `マシンが待機状態ではありません(現在の状態: ${activeStateLabel(guard.activeState)})。`,
        };
    }
    if (!guard.hasHomed) {
        return { allowed: false, reason: 'まだ原点復帰していません。' };
    }
    if (guard.pluginBusy) {
        return {
            allowed: false,
            reason: '別の処理が進行中です。',
        };
    }
    return { allowed: true };
};
