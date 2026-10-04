import { machine } from '@sienci/gsender-plugin-sdk';
import { useTypedSelector } from '@sienci/gsender-plugin-sdk/react';
import { useEffect, useState } from 'react';

import { useAdminRole } from '../admin/AdminRoleContext';
import { useConfirmDialog } from '../components/useConfirmDialog';
import LongPressButton from '../routine/LongPressButton';
import {
    checklistKindToShow,
    createRoutineState,
    incrementCycle,
    shouldAutoDeactivateRoutine,
} from '../routine/routineLogic';
import {
    deactivateRoutine,
    getRoutineState,
    setRoutineState,
} from '../routine/routineStorage';
import { DEFAULT_ROUTINE_STATE, type RoutineState } from '../routine/types';
import type { WorkflowRunState } from '../workflow/types';
import { useWorkflowState } from '../workflow/useWorkflowState';
import { canExecuteJob } from './canExecuteJob';
import ChecklistImage from './ChecklistImage';
import { recordChecklistCompletion } from './checklistHistoryStorage';
import {
    CHECKLIST_ITEMS,
    emptyChecklistState,
    isChecklistComplete,
} from './checklistItems';
import { deriveJobPhase } from './jobPhase';
import {
    SHORT_CHECKLIST_ITEMS,
    emptyShortChecklistState,
    isShortChecklistComplete,
} from './shortChecklist';
import type { ChecklistItemId, ChecklistState } from './types';
import type { ShortChecklistItemId, ShortChecklistState } from './shortChecklist';

type RootState = {
    file?: { name?: string | null };
};

/**
 * T6/T7: the safety checklist, job execution/pause/resume controls, and
 * Routine mode (repeat-the-same-job-with-a-material-swap).
 *
 * Checklist completion (full or short) is intentionally NOT part of T2's
 * deriveWorkflowState -- it's operator-confirmed, session-local, ephemeral
 * UI state, not something a live machine snapshot could ever tell you.
 * `useState` (never storage) is what gives us "reload always re-requires
 * the checklist" for free. Routine's mode/fileName/cycleCount, by contrast,
 * DO live in storage (T7): they must survive a plugin iframe remount during
 * an ALARM-recovery detour through the host's own UI. No change was needed
 * to T2's deriveWorkflowState or T5's startup flow for ALARM recovery to
 * resume a routine correctly -- once homing/origin-restore bring the
 * machine back to READY, checklistKindToShow() reads the still-persisted
 * cycleCount and picks the short checklist exactly as it would mid-routine
 * without any alarm having happened.
 */
const ChecklistPanel = () => {
    const workflow = useWorkflowState();
    const fileName = useTypedSelector<string | null | undefined, RootState>(
        (state) => state.file?.name,
    );
    const { requirePin } = useAdminRole();
    const { requestConfirm, dialog } = useConfirmDialog();

    const [checklist, setChecklist] = useState<ChecklistState>(
        emptyChecklistState,
    );
    const [shortChecklist, setShortChecklist] = useState<ShortChecklistState>(
        emptyShortChecklistState,
    );
    const [routine, setRoutine] = useState<RoutineState>(DEFAULT_ROUTINE_STATE);
    const [workflowRunState, setWorkflowRunState] =
        useState<WorkflowRunState>('idle');
    const [wasRunningOrPaused, setWasRunningOrPaused] = useState(false);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        void getRoutineState().then(setRoutine);
    }, []);

    useEffect(() => {
        return machine.addListener('workflow:state', (...args: unknown[]) => {
            const [state] = args as [WorkflowRunState];
            setWorkflowRunState(state);
            if (state === 'running' || state === 'paused') {
                setWasRunningOrPaused(true);
            }
        });
    }, []);

    // Guards against running a routine against a swapped-in file: once the
    // loaded file no longer matches what was recorded, drop out of Routine
    // mode automatically.
    useEffect(() => {
        if (fileName === undefined) {
            return;
        }
        if (shouldAutoDeactivateRoutine(routine, fileName ?? null)) {
            void deactivateRoutine().then(() => setRoutine(DEFAULT_ROUTINE_STATE));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileName, routine.active, routine.fileName]);

    const jobPhase = deriveJobPhase(workflowRunState, wasRunningOrPaused);
    const checklistKind = checklistKindToShow(routine.active, routine.cycleCount);
    const complete =
        checklistKind === 'full'
            ? isChecklistComplete(checklist)
            : isShortChecklistComplete(shortChecklist);
    const canExecute = canExecuteJob(workflow.state, complete);

    const toggleItem = (id: ChecklistItemId) =>
        setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
    const toggleShortItem = (id: ShortChecklistItemId) =>
        setShortChecklist((prev) => ({ ...prev, [id]: !prev[id] }));

    const handleExecute = async () => {
        setStarting(true);
        try {
            await machine.command('gcode:start');
            const itemIds =
                checklistKind === 'full'
                    ? CHECKLIST_ITEMS.map((item) => item.id)
                    : SHORT_CHECKLIST_ITEMS.map((item) => item.id);
            await recordChecklistCompletion(itemIds);
            if (routine.active) {
                const next = incrementCycle(routine);
                await setRoutineState(next);
                setRoutine(next);
            }
        } finally {
            setStarting(false);
        }
    };

    const handleAcknowledgeDone = () => {
        setWasRunningOrPaused(false);
        setChecklist(emptyChecklistState());
        setShortChecklist(emptyShortChecklistState());
    };

    const handleStartRoutine = async () => {
        if (!fileName) {
            return;
        }
        const next = createRoutineState(fileName);
        await setRoutineState(next);
        setRoutine(next);
    };

    const handleExitRoutine = async () => {
        const confirmed = await requestConfirm({
            title: 'Exit routine mode?',
            message: `This ends the routine at cycle ${routine.cycleCount}. The full checklist will be required again next time.`,
            confirmLabel: 'Exit routine',
            cancelLabel: 'Stay in routine',
        });
        if (!confirmed) {
            return;
        }
        const pinOk = await requirePin(
            'Enter the admin PIN to exit routine mode.',
        );
        if (!pinOk) {
            return;
        }
        await deactivateRoutine();
        setRoutine(DEFAULT_ROUTINE_STATE);
    };

    return (
        <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium">
                    {checklistKind === 'full'
                        ? 'Safety checklist'
                        : 'Material swap checklist'}
                </h2>
                {routine.active && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-mono text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        ROUTINE -- cycle {routine.cycleCount}
                    </span>
                )}
            </div>

            {workflow.state === 'ALARM' && routine.active && (
                <p className="mb-3 rounded border border-red-300 p-2 text-sm text-red-600 dark:border-red-800 dark:text-red-400">
                    Stopped during routine mode (cycle {routine.cycleCount}).
                    Confirm safety and recover (Unlock / re-home / restore
                    origin) to continue the routine.
                </p>
            )}

            {jobPhase === 'idle' && (
                <>
                    <ul className="flex flex-col gap-3">
                        {checklistKind === 'full'
                            ? CHECKLIST_ITEMS.map((item) => (
                                  <li
                                      key={item.id}
                                      className="flex gap-3 text-sm"
                                  >
                                      <ChecklistImage
                                          src={item.imageSrc}
                                          label={item.label}
                                      />
                                      <div className="flex-1">
                                          <label className="flex items-center gap-2 font-medium">
                                              <input
                                                  type="checkbox"
                                                  checked={checklist[item.id]}
                                                  onChange={() =>
                                                      toggleItem(item.id)
                                                  }
                                              />
                                              {item.label}
                                          </label>
                                          <p className="text-gray-500 dark:text-gray-400">
                                              {item.description}
                                          </p>
                                      </div>
                                  </li>
                              ))
                            : SHORT_CHECKLIST_ITEMS.map((item) => (
                                  <li
                                      key={item.id}
                                      className="flex gap-3 text-sm"
                                  >
                                      <ChecklistImage
                                          src={item.imageSrc}
                                          label={item.label}
                                      />
                                      <div className="flex-1">
                                          <label className="flex items-center gap-2 font-medium">
                                              <input
                                                  type="checkbox"
                                                  checked={
                                                      shortChecklist[
                                                          item.id as ShortChecklistItemId
                                                      ]
                                                  }
                                                  onChange={() =>
                                                      toggleShortItem(
                                                          item.id as ShortChecklistItemId,
                                                      )
                                                  }
                                              />
                                              {item.label}
                                          </label>
                                          <p className="text-gray-500 dark:text-gray-400">
                                              {item.description}
                                          </p>
                                      </div>
                                  </li>
                              ))}
                    </ul>

                    <button
                        type="button"
                        onClick={handleExecute}
                        disabled={!canExecute || starting}
                        className="mt-4 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                    >
                        {starting ? 'Starting…' : 'Execute'}
                    </button>
                    {!canExecute && workflow.state !== 'READY' && (
                        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                            Not ready yet: {workflow.reason}
                        </p>
                    )}
                    {!canExecute && workflow.state === 'READY' && !complete && (
                        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                            Check every item above before executing.
                        </p>
                    )}

                    {!routine.active && workflow.state === 'READY' && (
                        <button
                            type="button"
                            onClick={handleStartRoutine}
                            disabled={!fileName}
                            className="mt-3 block rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-700"
                        >
                            Start routine mode (repeat this file)
                        </button>
                    )}
                    {routine.active && (
                        <LongPressButton
                            onComplete={() => void handleExitRoutine()}
                            className="mt-3 block rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-800 dark:text-red-400"
                        >
                            Hold to exit routine mode
                        </LongPressButton>
                    )}
                </>
            )}

            {(jobPhase === 'running' || jobPhase === 'paused') && (
                <div className="flex items-center gap-3 text-sm">
                    <p className="font-mono">{jobPhase.toUpperCase()}</p>
                    {jobPhase === 'running' ? (
                        <button
                            type="button"
                            onClick={() => machine.command('gcode:pause')}
                            className="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-700"
                        >
                            Pause
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => machine.command('gcode:resume')}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-white"
                        >
                            Resume
                        </button>
                    )}
                </div>
            )}

            {jobPhase === 'done' && (
                <div className="text-sm">
                    <p className="font-medium text-green-600 dark:text-green-400">
                        Job done.
                    </p>
                    <button
                        type="button"
                        onClick={handleAcknowledgeDone}
                        className="mt-2 rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-700"
                    >
                        {routine.active
                            ? 'Next cycle (material swap check required)'
                            : 'Start next job (re-check required)'}
                    </button>
                </div>
            )}

            {dialog}
        </section>
    );
};

export default ChecklistPanel;
