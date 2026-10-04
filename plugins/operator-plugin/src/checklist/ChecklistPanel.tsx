import { machine } from '@sienci/gsender-plugin-sdk';
import { useEffect, useState } from 'react';

import type { WorkflowRunState } from '../workflow/types';
import { useWorkflowState } from '../workflow/useWorkflowState';
import { canExecuteJob } from './canExecuteJob';
import ChecklistImage from './ChecklistImage';
import { CHECKLIST_ITEMS, emptyChecklistState, isChecklistComplete } from './checklistItems';
import { recordChecklistCompletion } from './checklistHistoryStorage';
import { deriveJobPhase } from './jobPhase';
import type { ChecklistItemId, ChecklistState } from './types';

/**
 * T6: the safety checklist and job execution/pause/resume controls.
 *
 * Checklist completion is intentionally NOT part of T2's deriveWorkflowState
 * -- it's operator-confirmed, session-local, ephemeral UI state, not
 * something a live machine snapshot could ever tell you. `useState` (never
 * storage) is what gives us "reload always re-requires the checklist" for
 * free, matching T2's own "never trust a cached state name" principle.
 */
const ChecklistPanel = () => {
    const workflow = useWorkflowState();
    const [checklist, setChecklist] = useState<ChecklistState>(
        emptyChecklistState,
    );
    const [workflowRunState, setWorkflowRunState] =
        useState<WorkflowRunState>('idle');
    const [wasRunningOrPaused, setWasRunningOrPaused] = useState(false);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        return machine.addListener('workflow:state', (...args: unknown[]) => {
            const [state] = args as [WorkflowRunState];
            setWorkflowRunState(state);
            if (state === 'running' || state === 'paused') {
                setWasRunningOrPaused(true);
            }
        });
    }, []);

    const jobPhase = deriveJobPhase(workflowRunState, wasRunningOrPaused);
    const complete = isChecklistComplete(checklist);
    const canExecute = canExecuteJob(workflow.state, complete);

    const toggleItem = (id: ChecklistItemId) =>
        setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));

    const handleExecute = async () => {
        setStarting(true);
        try {
            await machine.command('gcode:start');
            await recordChecklistCompletion(
                CHECKLIST_ITEMS.map((item) => item.id),
            );
        } finally {
            setStarting(false);
        }
    };

    const handleAcknowledgeDone = () => {
        setWasRunningOrPaused(false);
        setChecklist(emptyChecklistState());
    };

    return (
        <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
            <h2 className="mb-2 font-medium">Safety checklist</h2>

            {jobPhase === 'idle' && (
                <>
                    <ul className="flex flex-col gap-3">
                        {CHECKLIST_ITEMS.map((item) => (
                            <li key={item.id} className="flex gap-3 text-sm">
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
                        Start next job (re-check required)
                    </button>
                </div>
            )}
        </section>
    );
};

export default ChecklistPanel;
