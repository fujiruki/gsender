import { describe, expect, it } from 'vitest';

import { describeProbeFailure, isProbeFailureAlarm } from '../probeFailure';

describe('isProbeFailureAlarm', () => {
    it('recognizes ALARM:4 and ALARM:5 as probe failures', () => {
        expect(isProbeFailureAlarm(4)).toBe(true);
        expect(isProbeFailureAlarm(5)).toBe(true);
    });

    it('does not treat unrelated alarm codes as probe failures', () => {
        expect(isProbeFailureAlarm(1)).toBe(false);
        expect(isProbeFailureAlarm(8)).toBe(false);
    });
});

describe('describeProbeFailure', () => {
    it('explains ALARM:4 (probe already triggered) and mentions recovery', () => {
        const message = describeProbeFailure(4);
        expect(message).toContain('4');
        expect(message).toContain('ロック解除');
    });

    it('explains ALARM:5 (probe never triggered) and mentions recovery', () => {
        const message = describeProbeFailure(5);
        expect(message).toContain('5');
        expect(message).toContain('ロック解除');
    });

    it('falls back to a generic message for anything else', () => {
        expect(describeProbeFailure(9)).toContain('9');
    });
});
