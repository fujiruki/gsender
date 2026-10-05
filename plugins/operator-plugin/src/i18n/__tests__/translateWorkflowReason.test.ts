import { describe, expect, it } from 'vitest';

import { translateWorkflowReason } from '../translateWorkflowReason';

describe('translateWorkflowReason', () => {
    it('translates the fixed-text reason for each non-interpolated state', () => {
        expect(
            translateWorkflowReason('DISCONNECTED', 'Machine is not connected.'),
        ).toBe('マシンが接続されていません。');
        expect(
            translateWorkflowReason('ALARM', 'Controller is in an alarm state.'),
        ).toBe('コントローラーがアラーム状態です。');
        expect(
            translateWorkflowReason(
                'CONNECTED_UNHOMED',
                'Connected, but the machine has not been homed yet.',
            ),
        ).toBe('接続済みですが、まだ原点復帰していません。');
    });

    it('extracts and re-embeds the slot name for ORIGIN_SET/READY/FILE_LOADED', () => {
        expect(
            translateWorkflowReason(
                'ORIGIN_SET',
                'G54 matches saved origin slot "いつもの左前XY0".',
            ),
        ).toBe('原点が「いつもの左前XY0」と一致しています。');
        expect(
            translateWorkflowReason(
                'READY',
                'Origin matches "いつもの左前XY0", a file is loaded, and the machine is idle.',
            ),
        ).toBe(
            '原点が「いつもの左前XY0」と一致し、ファイルが読み込まれ、マシンは待機中です。',
        );
        expect(
            translateWorkflowReason(
                'FILE_LOADED',
                'Origin matches "いつもの左前XY0" and a file is loaded.',
            ),
        ).toBe('原点が「いつもの左前XY0」と一致し、ファイルが読み込まれています。');
    });

    it('falls back to the raw reason text if the shape is ever unexpected (defensive, should not happen in practice)', () => {
        expect(translateWorkflowReason('ORIGIN_SET', 'something weird')).toBe(
            'something weird',
        );
    });
});
