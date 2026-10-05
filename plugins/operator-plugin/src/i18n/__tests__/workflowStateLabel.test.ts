import { describe, expect, it } from 'vitest';

import { workflowStateLabel } from '../workflowStateLabel';
import type { WorkflowState } from '../../workflow/types';

describe('workflowStateLabel', () => {
    it('has a Japanese label for every WorkflowState value, without touching the enum itself', () => {
        const states: WorkflowState[] = [
            'DISCONNECTED',
            'ALARM',
            'RUNNING',
            'PAUSED',
            'HOMING',
            'CONNECTED_UNHOMED',
            'PROBING',
            'G92_PRESENT',
            'ORIGIN_SET',
            'HOMED_UNVERIFIED',
            'FILE_LOADED',
            'READY',
        ];
        for (const state of states) {
            const label = workflowStateLabel(state);
            expect(label.length).toBeGreaterThan(0);
            // every label must actually be translated, not an echo of the enum
            expect(label).not.toBe(state);
        }
    });

    it('maps a few specific values as expected', () => {
        expect(workflowStateLabel('DISCONNECTED')).toBe('未接続');
        expect(workflowStateLabel('READY')).toBe('準備完了');
        expect(workflowStateLabel('CONNECTED_UNHOMED')).toBe('原点復帰待ち');
    });
});
