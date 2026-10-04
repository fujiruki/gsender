import { machine } from '@sienci/gsender-plugin-sdk';
import { useTypedSelector } from '@sienci/gsender-plugin-sdk/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useConfirmDialog } from '../components/useConfirmDialog';
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
            return `Ready: origin restored to G54 X${result.g54.x} Y${result.g54.y} Z${result.g54.z}.`;
        case 'ORIGIN_MISMATCH':
            return `Homed, but the restored origin does not match after verification (got X${result.g54.x} Y${result.g54.y} Z${result.g54.z}). Treat as a human judgement call, not an auto-retry.`;
        case 'HOMING_TIMEOUT':
            return 'Homing did not complete within 60 seconds. Treat this like an alarm: check limit switches and wiring, Unlock, then retry.';
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
            title: 'Clear leftover G92 offset?',
            message:
                'A temporary G92 offset is present and must be cleared before the origin can be restored. Clear it now (G92.1)?',
            confirmLabel: 'Clear G92',
            cancelLabel: 'Cancel',
        });

    const confirmSafety = () =>
        requestConfirm({
            title: 'Safety check',
            message:
                'Confirm the work area is clear of obstacles and the machine is free to move on all axes before homing.',
            confirmLabel: 'Confirmed, start homing',
            cancelLabel: 'Cancel',
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
                        sendGcode: (lines) => machine.command('gcode', lines),
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
            <h2 className="mb-2 font-medium">Morning startup</h2>

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
                    Not connected. Connect to the machine from the host's own
                    Connect control first -- this plugin does not drive the
                    connection itself.
                </p>
            )}

            <label className="mb-3 flex flex-col gap-1 text-sm">
                <span>Origin slot to restore after homing</span>
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
                {running ? 'Running startup…' : 'Start morning sequence'}
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
                Current state: <span className="font-mono">{workflow.state}</span>{' '}
                -- {workflow.reason}
            </p>

            {dialog}
        </section>
    );
};

export default StartupPanel;
