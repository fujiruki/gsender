export type ActiveState =
    | 'Idle'
    | 'Run'
    | 'Hold'
    | 'Jog'
    | 'Alarm'
    | 'Door'
    | 'Check'
    | 'Home'
    | 'Sleep';

export type WorkflowRunState = 'idle' | 'running' | 'paused';

/** Axis values arrive as strings off the wire (see
 * GrblLineParserResultParameters on the server), not numbers. */
export type ParameterOffset = {
    x: string;
    y: string;
    z: string;
};

export type MachineSnapshot = {
    connection: {
        isConnected: boolean;
    };
    controller: {
        hasHomed: boolean;
        state: {
            status: {
                activeState: ActiveState;
            };
        };
        workflow: {
            state: WorkflowRunState;
        };
        settings: {
            parameters: {
                G54: ParameterOffset;
                G92: ParameterOffset;
            };
        };
    };
    fileInfo: {
        fileLoaded: boolean;
        fileName?: string | null;
    };
    pluginState: {
        busy: boolean;
    };
};

export type OriginSlot = {
    id: string;
    name: string;
    x: number;
    y: number;
    z: number;
};

/**
 * Storage-backed data only — never a saved state NAME. spec/07's state
 * machine design is explicit that the workflow state itself is always
 * re-derived from the live machine on every read, never restored from a
 * cached label.
 */
export type WorkflowAux = {
    originSlots: OriginSlot[];
    checklistHistory: unknown[];
    routine: {
        active: boolean;
        fileName?: string | null;
    };
    adminPinHash?: string;
    pluginSettings: Record<string, unknown>;
};

export type WorkflowState =
    | 'DISCONNECTED'
    | 'ALARM'
    | 'RUNNING'
    | 'PAUSED'
    | 'HOMING'
    | 'CONNECTED_UNHOMED'
    | 'PROBING'
    | 'G92_PRESENT'
    | 'ORIGIN_SET'
    | 'HOMED_UNVERIFIED'
    | 'FILE_LOADED'
    | 'READY';

export type WorkflowDerivation = {
    state: WorkflowState;
    reason: string;
};
