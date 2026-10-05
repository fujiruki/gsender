import { describe, expect, it } from 'vitest';

import { activeStateLabel } from '../activeStateLabel';
import type { ActiveState } from '../../workflow/types';

describe('activeStateLabel', () => {
    it('has a Japanese label for every ActiveState value, matching the host app i18n terms', () => {
        const states: ActiveState[] = [
            'Idle',
            'Run',
            'Hold',
            'Jog',
            'Alarm',
            'Door',
            'Check',
            'Home',
            'Sleep',
        ];
        for (const state of states) {
            expect(activeStateLabel(state).length).toBeGreaterThan(0);
        }
    });

    it('matches the host app (src/app/src/i18n/locales/ja.json) terms for consistency', () => {
        expect(activeStateLabel('Idle')).toBe('アイドル');
        expect(activeStateLabel('Alarm')).toBe('アラーム');
        expect(activeStateLabel('Home')).toBe('原点復帰');
    });

    it('falls back to the raw value for an unrecognized string (RestoreGuardState.activeState is typed as plain string)', () => {
        expect(activeStateLabel('SomethingUnexpected')).toBe(
            'SomethingUnexpected',
        );
    });
});
