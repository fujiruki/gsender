import type { WorkflowRunState } from '../workflow/types';
import type { JobPhase } from './types';

/**
 * `workflow:state` alone can't distinguish "never started" from "just
 * finished" -- both read idle. `wasRunningOrPaused` is session-local state
 * the caller flips true the moment running/paused is first observed, so
 * idle-after-that reads as `done` instead of a silent return to `idle`.
 */
export const deriveJobPhase = (
    workflowState: WorkflowRunState,
    wasRunningOrPaused: boolean,
): JobPhase => {
    if (workflowState === 'running') {
        return 'running';
    }
    if (workflowState === 'paused') {
        return 'paused';
    }
    return wasRunningOrPaused ? 'done' : 'idle';
};
