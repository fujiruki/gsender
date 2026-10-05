import { machine } from '@sienci/gsender-plugin-sdk';
import { useTypedSelector } from '@sienci/gsender-plugin-sdk/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConfirmDialog } from '../components/useConfirmDialog';
import { translateWorkflowReason } from '../i18n/translateWorkflowReason';
import { workflowStateLabel } from '../i18n/workflowStateLabel';
import { listOriginSlots } from '../origin/originSlotsStorage';
import type { OriginSlot, RestoreDeps, RestoreGuardState } from '../origin/types';
import { useRestoreGuardState } from '../origin/useRestoreGuardState';
import { useWorkflowState } from '../workflow/useWorkflowState';
import { isHomingComplete } from './homing';
import { runStartupSequence } from './runStartupSequence';
import { STARTUP_STEPS, startupStepIndex } from './startupStep';
import type { StartupSequenceResult } from './types';

type RootState = {
    controller?: {
        hasHomed?: boolean;
        state?: { status?: { activeState?: string } };
    };
};

const POLL_INTERVAL_MS = 250;
const HOMING_TIMEOUT_MS = 60_000;

const formatResult = (result: StartupSequenceResult): string => {
    switch (result.outcome) {
        case 'ORIGIN_SET':
            return `準備完了: 原点をG54 X${result.g54.x} Y${result.g54.y} Z${result.g54.z}に復元しました。`;
        case 'ORIGIN_MISMATCH':
            return `原点復帰しましたが、復元後の検証で原点が一致しませんでした(実測値 X${result.g54.x} Y${result.g54.y} Z${result.g54.z})。自動再試行はせず、人による判断が必要です。`;
        case 'HOMING_TIMEOUT':
            return '原点復帰が60秒以内に完了しませんでした。アラームと同様に扱い、リミットスイッチと配線を確認してロック解除後に再試行してください。';
        case 'BLOCKED':
        case 'CANCELLED':
            return result.reason;
    }
};

/**
 * T5: the "接続確認→安全確認→ホーミング→加工原点復元→READY" sequence from
 * macro 3, with `$H` split out as the homing step (runStartupSequence) and
 * `G10 L2 ...` delegated to T3's restoreOrigin unchanged. The plugin never
 * drives the connect step itself -- only tells the operator to use the
 * host's own Connect control when disconnected.
 */
const StartupPanel = () => {
    const workflow = useWorkflowState();
    const guard = useRestoreGuardState();
    const guardRef = useRef<RestoreGuardState>(guard);
    useEffect(() => {
        guardRef.current = guard;
    }, [guard]);

    const hasHomed = useTypedSelector<boolean | undefined, RootState>(
        (state) => state.controller?.hasHomed,
    );
    const activeState = useTypedSelector<string | undefined, RootState>(
        (state) => state.controller?.state?.status?.activeState,
    );
    const homingStateRef = useRef({ hasHomed: false, activeState: 'Idle' });
    useEffect(() => {
        homingStateRef.current = {
            hasHomed: hasHomed ?? false,
            activeState: activeState ?? 'Idle',
        };
    }, [hasHomed, activeState]);

    const { requestConfirm, dialog } = useConfirmDialog();

    const [slots, setSlots] = useState<OriginSlot[]>([]);
    const [selectedSlotId, setSelectedSlotId] = useState<string>(
        'usual-front-left',
    );
    const [running, setRunning] = useState(false);
    const [lastResult, setLastResult] = useState<StartupSequenceResult | null>(
        null,
    );

    useEffect(() => {
        void listOriginSlots().then((loaded) => {
            setSlots(loaded);
            if (
                loaded.length > 0 &&
                !loaded.some((slot) => slot.id === selectedSlotId)
            ) {
                setSelectedSlotId(loaded[0].id);
            }
        });
        // selectedSlotId intentionally excluded: this only seeds the initial
        // selection once, it shouldn't re-run every time the user picks one.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const waitForHomed = useCallback(
        (timeoutMs: number): Promise<boolean> =>
            new Promise((resolve) => {
                const deadline = Date.now() + timeoutMs;
                const poll = () => {
                    if (isHomingComplete(homingStateRef.current)) {
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
                '一時オフセット(G92)が残っています。原点の復元の前にクリアする必要があります。今すぐクリアしますか(G92.1)?',
            confirmLabel: 'G92をクリア',
            cancelLabel: 'キャンセル',
        });

    const confirmSafety = () =>
        requestConfirm({
            title: '安全確認',
            message:
                '原点復帰の前に、作業エリアに障害物がないこと、マシンが全軸で自由に動けることを確認してください。',
            confirmLabel: '確認しました。原点復帰を開始',
            cancelLabel: 'キャンセル',
        });

    const handleStart = async () => {
        const slot = slots.find((candidate) => candidate.id === selectedSlotId);
        if (!slot) {
            return;
        }
        setRunning(true);
        setLastResult(null);
        try {
            const result = await runStartupSequence(
                { kind: 'xyz', slot },
                {
                    confirmSafety,
                    sendHomingCommand: () => machine.command('homing'),
                    waitForHomed,
                    getGuard: () => guardRef.current,
                    restoreDeps: {
                        query: (cmd) => machine.query(cmd),
                        confirmClearG92,
                    },
                },
                HOMING_TIMEOUT_MS,
            );
            setLastResult(result);
        } finally {
            setRunning(false);
        }
    };

    const currentStep = startupStepIndex(workflow.state);
    const isConnected = workflow.state !== 'DISCONNECTED';

    return (
        <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
            <h2 className="mb-2 font-medium">朝の起動</h2>

            <ol className="mb-4 flex flex-wrap gap-2 text-xs">
                {STARTUP_STEPS.map((label, index) => (
                    <li
                        key={label}
                        className={`rounded-full px-3 py-1 ${
                            index === currentStep
                                ? 'bg-blue-600 text-white'
                                : index < currentStep
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                    >
                        {index + 1}. {label}
                    </li>
                ))}
            </ol>

            {!isConnected && (
                <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">
                    未接続です。本体側のConnect(接続)操作でマシンに接続してください
                    -- このPluginからは接続操作を行いません。
                </p>
            )}

            <label className="mb-3 flex flex-col gap-1 text-sm">
                <span>原点復帰後に復元する原点スロット</span>
                <select
                    value={selectedSlotId}
                    onChange={(event) => setSelectedSlotId(event.target.value)}
                    disabled={slots.length === 0}
                    className="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                >
                    {slots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                            {slot.name}
                        </option>
                    ))}
                </select>
            </label>

            <button
                type="button"
                onClick={handleStart}
                disabled={!isConnected || running || slots.length === 0}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
                {running ? '起動処理中…' : '朝の起動シーケンスを開始'}
            </button>

            {lastResult && (
                <p
                    className={`mt-3 text-sm ${
                        lastResult.outcome === 'ORIGIN_SET'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                    }`}
                >
                    {formatResult(lastResult)}
                </p>
            )}

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                現在の状態:{' '}
                <span className="font-mono">
                    {workflowStateLabel(workflow.state)}
                </span>{' '}
                -- {translateWorkflowReason(workflow.state, workflow.reason)}
            </p>

            {dialog}
        </section>
    );
};

export default StartupPanel;
