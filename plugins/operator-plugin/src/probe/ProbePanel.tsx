import { machine } from '@sienci/gsender-plugin-sdk';
import { useTypedSelector } from '@sienci/gsender-plugin-sdk/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConfirmDialog } from '../components/useConfirmDialog';
import { canRestoreOrigin } from '../origin/canRestoreOrigin';
import { saveOriginSlot } from '../origin/originSlotsStorage';
import type { RestoreDeps } from '../origin/types';
import { useRestoreGuardState } from '../origin/useRestoreGuardState';
import {
    ENDMILL_DIAMETER_PRESETS_MM,
    PROBE_PARAM_DEFAULTS,
    generateProbeGcode,
} from './generateProbeGcode';
import {
    Z_ONLY_PROBE_DEFAULTS,
    generateZOnlyProbeGcode,
} from './generateZOnlyProbeGcode';
import { isProbeSettled } from './probeCompletion';
import { describeProbeFailure, isProbeFailureAlarm } from './probeFailure';
import { runProbe } from './runProbe';
import type { JigVariant, ProbeKind, RunProbeResult } from './types';

type RootState = {
    controller?: {
        state?: { status?: { activeState?: string } };
        modal?: { distance?: string };
        mpos?: { x?: number | string; y?: number | string; z?: number | string };
    };
};

const POLL_INTERVAL_MS = 250;
const SETTLE_TIMEOUT_MS = 60_000;

const makeProbeDeps = (
    confirmClearG92: RestoreDeps['confirmClearG92'],
    waitForSettle: (timeoutMs: number) => Promise<boolean>,
) => ({
    query: (cmd: string) => machine.query(cmd),
    sendGcode: (lines: string[]) => machine.command('gcode', lines),
    confirmClearG92,
    setBusy: (busy: boolean, label?: string) => machine.setBusy(busy, label),
    waitForSettle,
});

const formatResult = (kind: ProbeKind, result: RunProbeResult): string => {
    switch (result.outcome) {
        case 'DONE':
            return result.g54
                ? `${kind.toUpperCase()}プローブ完了: G54 X${result.g54.x} Y${result.g54.y} Z${result.g54.z}`
                : `${kind.toUpperCase()}プローブは完了しましたが、検証の$#応答にG54の行がありませんでした。`;
        case 'TIMEOUT':
            return 'マシンの静定(Idle + G90)待ちでタイムアウトしました。再試行する前にコンソールを確認してください。';
        case 'CANCELLED':
        case 'BLOCKED':
            return result.reason;
    }
};

/**
 * T4: XYZ/XY/Z probe UI. Parameters are entered once per session; nothing is
 * persisted here (origin RESULTS can optionally be saved as a slot, reusing
 * T3's storage, but probe parameters themselves are not yet, by design --
 * they're rarely changed and persisting them is not in spec/07's scope).
 */
const ProbePanel = () => {
    const guard = useRestoreGuardState();
    const guardResult = canRestoreOrigin(guard);
    const { requestConfirm, dialog } = useConfirmDialog();

    const [endmillDiameterMm, setEndmillDiameterMm] = useState<number>(
        ENDMILL_DIAMETER_PRESETS_MM['phi3.20'],
    );
    const [jigVariant, setJigVariant] = useState<JigVariant>('right-rear');
    const [running, setRunning] = useState<ProbeKind | null>(null);
    const [lastResult, setLastResult] = useState<{
        kind: ProbeKind;
        result: RunProbeResult;
    } | null>(null);
    const [failureMessage, setFailureMessage] = useState<string | null>(null);
    const [contactCount, setContactCount] = useState(0);
    const [newSlotName, setNewSlotName] = useState('');

    const activeState = useTypedSelector<string | undefined, RootState>(
        (state) => state.controller?.state?.status?.activeState,
    );
    const distanceMode = useTypedSelector<string | undefined, RootState>(
        (state) => state.controller?.modal?.distance,
    );
    const mposZ = useTypedSelector<number | undefined, RootState>((state) =>
        Number(state.controller?.mpos?.z ?? 0),
    );
    const mposX = useTypedSelector<number | undefined, RootState>((state) =>
        Number(state.controller?.mpos?.x ?? 0),
    );
    const mposY = useTypedSelector<number | undefined, RootState>((state) =>
        Number(state.controller?.mpos?.y ?? 0),
    );

    const settleStateRef = useRef({ activeState: 'Idle', distanceMode: 'G90' });
    useEffect(() => {
        settleStateRef.current = {
            activeState: activeState ?? 'Idle',
            distanceMode: distanceMode ?? 'G90',
        };
    }, [activeState, distanceMode]);

    const probingRef = useRef(false);

    useEffect(() => {
        return machine.addListener(
            'error',
            (...args: unknown[]) => {
                const [error] = args as [
                    { type?: string; code?: number } | undefined,
                ];
                if (
                    probingRef.current &&
                    error?.type === 'ALARM' &&
                    typeof error.code === 'number' &&
                    isProbeFailureAlarm(error.code)
                ) {
                    setFailureMessage(describeProbeFailure(error.code));
                }
            },
        );
    }, []);

    useEffect(() => {
        return machine.onParsed('probe', () => {
            setContactCount((count) => count + 1);
        });
    }, []);

    const waitForSettle = useCallback(
        (timeoutMs: number): Promise<boolean> =>
            new Promise((resolve) => {
                const deadline = Date.now() + timeoutMs;
                const poll = () => {
                    if (isProbeSettled(settleStateRef.current)) {
                        resolve(true);
                        return;
                    }
                    if (Date.now() >= deadline) {
                        resolve(false);
                        return;
                    }
                    setTimeout(poll, POLL_INTERVAL_MS);
                };
                setTimeout(poll, POLL_INTERVAL_MS);
            }),
        [],
    );

    const confirmClearG92: RestoreDeps['confirmClearG92'] = () =>
        requestConfirm({
            title: '一時オフセット(G92)をクリアしますか?',
            message:
                '一時オフセット(G92)が残っています。プローブの前にクリアする必要があります。今すぐクリアしますか(G92.1)?',
            confirmLabel: 'G92をクリア',
            cancelLabel: 'キャンセル',
        });

    const runAndReport = async (kind: ProbeKind, lines: string[]) => {
        setRunning(kind);
        setLastResult(null);
        setFailureMessage(null);
        setContactCount(0);
        probingRef.current = true;
        try {
            const result = await runProbe(
                lines,
                guard,
                makeProbeDeps(confirmClearG92, waitForSettle),
                SETTLE_TIMEOUT_MS,
            );
            setLastResult({ kind, result });
        } finally {
            probingRef.current = false;
            setRunning(null);
        }
    };

    const handleRunXyz = () =>
        runAndReport(
            'xyz',
            generateProbeGcode(
                {
                    ...PROBE_PARAM_DEFAULTS,
                    endmillDiameterMm,
                    jigVariant,
                },
                { x: mposX ?? 0, y: mposY ?? 0 },
                { includeZ: true },
            ),
        );

    const handleRunXy = () => {
        if (mposZ === undefined || mposZ + 10 > 0) {
            setLastResult({
                kind: 'xy',
                result: {
                    outcome: 'BLOCKED',
                    reason: 'Zが可動範囲上限に近すぎるため、-10mmの側面探査降下が安全に行えません(mpos.z + 10 は0以下である必要があります)。',
                },
            });
            return;
        }
        return runAndReport(
            'xy',
            generateProbeGcode(
                {
                    ...PROBE_PARAM_DEFAULTS,
                    endmillDiameterMm,
                    jigVariant,
                },
                { x: mposX ?? 0, y: mposY ?? 0 },
                { includeZ: false },
            ),
        );
    };

    const handleRunZ = () =>
        runAndReport('z', generateZOnlyProbeGcode(Z_ONLY_PROBE_DEFAULTS));

    const handleSaveResultAsSlot = async () => {
        const name = newSlotName.trim();
        if (!name || lastResult?.result.outcome !== 'DONE' || !lastResult.result.g54) {
            return;
        }
        const { g54 } = lastResult.result;
        await saveOriginSlot({
            id: `slot-${Date.now().toString(36)}`,
            name,
            x: Number.parseFloat(g54.x) || 0,
            y: Number.parseFloat(g54.y) || 0,
            z: Number.parseFloat(g54.z) || 0,
        });
        setNewSlotName('');
    };

    return (
        <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
            <h2 className="mb-2 font-medium">プローブ</h2>
            {!guardResult.allowed && (
                <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">
                    プローブを無効化しています: {guardResult.reason}
                </p>
            )}

            <div className="flex flex-wrap items-end gap-3 text-sm">
                <label className="flex flex-col gap-1">
                    <span>エンドミル径(mm)</span>
                    <select
                        value={endmillDiameterMm}
                        onChange={(event) =>
                            setEndmillDiameterMm(Number(event.target.value))
                        }
                        className="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                    >
                        <option value={ENDMILL_DIAMETER_PRESETS_MM['phi3.20']}>
                            φ3.20
                        </option>
                        <option value={ENDMILL_DIAMETER_PRESETS_MM['phi3.16']}>
                            φ3.16
                        </option>
                    </select>
                </label>
                <label className="flex flex-col gap-1">
                    <span>治具バリアント</span>
                    <select
                        value={jigVariant}
                        onChange={(event) =>
                            setJigVariant(event.target.value as JigVariant)
                        }
                        className="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                    >
                        <option value="right-rear">右奥</option>
                        <option value="left-rear">左奥</option>
                    </select>
                </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={handleRunXyz}
                    disabled={!guardResult.allowed || running !== null}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                >
                    {running === 'xyz' ? 'XYZプローブ中…' : 'XYZ一括プローブ実行'}
                </button>
                <button
                    type="button"
                    onClick={handleRunXy}
                    disabled={!guardResult.allowed || running !== null}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                >
                    {running === 'xy' ? 'XYプローブ中…' : 'XYのみプローブ実行'}
                </button>
                <button
                    type="button"
                    onClick={handleRunZ}
                    disabled={!guardResult.allowed || running !== null}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                >
                    {running === 'z' ? 'Zプローブ中…' : 'Zのみプローブ実行'}
                </button>
            </div>

            {running && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    接触回数: {contactCount}
                </p>
            )}

            {failureMessage && (
                <div className="mt-3 flex items-center justify-between gap-2 rounded border border-red-300 p-2 text-sm text-red-600 dark:border-red-800 dark:text-red-400">
                    <span>{failureMessage}</span>
                    <button
                        type="button"
                        onClick={() => machine.command('unlock')}
                        className="rounded-md border border-red-300 px-2 py-1 dark:border-red-800"
                    >
                        ロック解除
                    </button>
                </div>
            )}

            {lastResult && (
                <div className="mt-3 text-sm">
                    <p
                        className={
                            lastResult.result.outcome === 'DONE'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                        }
                    >
                        {formatResult(lastResult.kind, lastResult.result)}
                    </p>
                    {lastResult.result.outcome === 'DONE' && (
                        <div className="mt-2 flex items-end gap-2">
                            <label className="flex flex-col gap-1">
                                <span>新規原点スロットとして保存</span>
                                <input
                                    type="text"
                                    value={newSlotName}
                                    onChange={(event) =>
                                        setNewSlotName(event.target.value)
                                    }
                                    placeholder="例: 治具コーナープローブ"
                                    className="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={handleSaveResultAsSlot}
                                disabled={!newSlotName.trim()}
                                className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-50 dark:border-gray-700"
                            >
                                保存
                            </button>
                        </div>
                    )}
                </div>
            )}

            {dialog}
        </section>
    );
};

export default ProbePanel;
