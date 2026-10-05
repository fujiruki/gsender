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
        return 'ALARM:4 -- 移動開始前からプローブが既に反応していました(スイッチの固着、またはプレートに既に接触している可能性)。プローブの配線・プレートを確認し、ロック解除してから再試行してください。';
    }
    if (code === 5) {
        return 'ALARM:5 -- 設定した移動範囲内でプローブが接触しませんでした(スイッチの配線不良・未反応、またはプレートが想定より遠い可能性)。プローブの配線・プレート位置を確認し、ロック解除してから再試行してください。';
    }
    return `プローブ中に予期しないアラーム${code}が発生しました。ロック解除してマシンを確認してから再試行してください。`;
};
