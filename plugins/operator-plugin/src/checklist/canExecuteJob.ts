import type { WorkflowState } from '../workflow/types';

/**
 * Deliberately NOT folded into T2's deriveWorkflowState: checklist
 * completion is operator-confirmed, local, ephemeral UI state, not
 * something derivable from the live machine snapshot that function is
 * scoped to. Combining the two concerns here keeps deriveWorkflowState a
 * pure function of machine state only.
 */
export const canExecuteJob = (
    workflowState: WorkflowState,
    checklistComplete: boolean,
): boolean => workflowState === 'READY' && checklistComplete;
