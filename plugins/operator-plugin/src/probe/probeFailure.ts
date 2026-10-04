const PROBE_FAILURE_ALARM_CODES = [4, 5];

export const isProbeFailureAlarm = (code: number): boolean =>
    PROBE_FAILURE_ALARM_CODES.includes(code);

/**
 * Grbl 1.1 limits probe failures to these two codes (see spec/07's
 * "プローブ完了判定・安全設計"). Recovery is always the same: `unlock`
 * (`machine.command('unlock')` -> feeder.reset() + $X).
 */
export const describeProbeFailure = (code: number): string => {
    if (code === 4) {
        return 'ALARM:4 -- the probe was already triggered before the move started (stuck switch, or already touching the plate). Check the probe wiring/plate, then Unlock and try again.';
    }
    if (code === 5) {
        return 'ALARM:5 -- the probe never made contact within the programmed travel (switch not wired/triggering, or the plate is further away than expected). Check the probe wiring/plate position, then Unlock and try again.';
    }
    return `Unexpected alarm ${code} during probing. Unlock and check the machine before retrying.`;
};
