import type {
    MachineSnapshot,
    OriginSlot,
    ParameterOffset,
    WorkflowAux,
    WorkflowDerivation,
} from './types';

const G54_MATCH_TOLERANCE_MM = 0.01;

const toNumber = (value: string): number => Number.parseFloat(value) || 0;

const isOffsetNonZero = (offset: ParameterOffset): boolean =>
    toNumber(offset.x) !== 0 ||
    toNumber(offset.y) !== 0 ||
    toNumber(offset.z) !== 0;

const matchesSlot = (offset: ParameterOffset, slot: OriginSlot): boolean =>
    Math.abs(toNumber(offset.x) - slot.x) <= G54_MATCH_TOLERANCE_MM &&
    Math.abs(toNumber(offset.y) - slot.y) <= G54_MATCH_TOLERANCE_MM &&
    Math.abs(toNumber(offset.z) - slot.z) <= G54_MATCH_TOLERANCE_MM;

/**
 * Re-derives the operator workflow state from the live machine on every call.
 * Never trust a cached state name (see spec/07 "ステートマシン設計"): a
 * restart or reconnect must reconstruct this from `snapshot` alone.
 */
export const deriveWorkflowState = (
    snapshot: MachineSnapshot,
    aux: WorkflowAux,
): WorkflowDerivation => {
    if (!snapshot.connection.isConnected) {
        return { state: 'DISCONNECTED', reason: 'Machine is not connected.' };
    }

    const { activeState } = snapshot.controller.state.status;
    if (activeState === 'Alarm') {
        return { state: 'ALARM', reason: 'Controller is in an alarm state.' };
    }

    const { state: workflowRunState } = snapshot.controller.workflow;
    if (workflowRunState === 'running') {
        return { state: 'RUNNING', reason: 'A job is currently running.' };
    }
    if (workflowRunState === 'paused') {
        return { state: 'PAUSED', reason: 'The running job is paused.' };
    }

    if (activeState === 'Home') {
        return { state: 'HOMING', reason: 'A homing cycle is in progress.' };
    }
    if (!snapshot.controller.hasHomed) {
        return {
            state: 'CONNECTED_UNHOMED',
            reason: 'Connected, but the machine has not been homed yet.',
        };
    }

    if (snapshot.pluginState.busy) {
        return {
            state: 'PROBING',
            reason: 'An operation started by this plugin is still in progress.',
        };
    }

    const { G54, G92 } = snapshot.controller.settings.parameters;
    if (isOffsetNonZero(G92)) {
        return {
            state: 'G92_PRESENT',
            reason: 'A G92 offset is present and must be cleared before continuing.',
        };
    }

    const matchedSlot = aux.originSlots.find((slot) => matchesSlot(G54, slot));
    if (!matchedSlot) {
        return {
            state: 'HOMED_UNVERIFIED',
            reason: 'G54 does not match any saved origin slot.',
        };
    }

    // ORIGIN_SET only holds while nothing is loaded yet; once a file is
    // loaded it refines further into FILE_LOADED/READY, mirroring the
    // ORIGIN_SET -> FILE_LOADED -> READY chain in spec/07's transition diagram.
    if (!snapshot.fileInfo.fileLoaded) {
        return {
            state: 'ORIGIN_SET',
            reason: `G54 matches saved origin slot "${matchedSlot.name}".`,
        };
    }

    if (activeState === 'Idle') {
        return {
            state: 'READY',
            reason: `Origin matches "${matchedSlot.name}", a file is loaded, and the machine is idle.`,
        };
    }

    return {
        state: 'FILE_LOADED',
        reason: `Origin matches "${matchedSlot.name}" and a file is loaded.`,
    };
};
