import { machine, storage } from '@sienci/gsender-plugin-sdk';
import { useTypedSelector } from '@sienci/gsender-plugin-sdk/react';
import { useEffect, useRef, useState } from 'react';

import { deriveWorkflowState } from './deriveWorkflowState';
import type {
    ActiveState,
    MachineSnapshot,
    OriginSlot,
    ParameterOffset,
    WorkflowAux,
    WorkflowDerivation,
    WorkflowRunState,
} from './types';

type RootState = {
    connection?: { isConnected?: boolean };
    controller?: {
        hasHomed?: boolean;
        state?: { status?: { activeState?: string } };
        workflow?: { state?: string };
        settings?: { parameters?: Record<string, ParameterOffset> };
    };
    file?: { fileLoaded?: boolean; name?: string | null };
    pluginState?: { busy?: boolean };
};

const ZERO_OFFSET: ParameterOffset = { x: '0', y: '0', z: '0' };

const buildSnapshot = (state: RootState): MachineSnapshot => ({
    connection: { isConnected: state.connection?.isConnected ?? false },
    controller: {
        hasHomed: state.controller?.hasHomed ?? false,
        state: {
            status: {
                activeState:
                    (state.controller?.state?.status
                        ?.activeState as ActiveState) ?? 'Idle',
            },
        },
        workflow: {
            state:
                (state.controller?.workflow?.state as WorkflowRunState) ??
                'idle',
        },
        settings: {
            parameters: {
                G54: state.controller?.settings?.parameters?.G54 ?? ZERO_OFFSET,
                G92: state.controller?.settings?.parameters?.G92 ?? ZERO_OFFSET,
            },
        },
    },
    fileInfo: {
        fileLoaded: state.file?.fileLoaded ?? false,
        fileName: state.file?.name ?? null,
    },
    pluginState: { busy: state.pluginState?.busy ?? false },
});

const ORIGIN_SLOTS_STORAGE_KEY = 'originSlots';

/**
 * Derives the operator workflow state from live redux state, re-querying
 * `$#` whenever the host's cached G54/G92 parameters might be stale (on
 * mount, and on every disconnected -> connected transition) — see spec/07:
 * `controller.settings.parameters` only updates when `$#` is issued.
 */
export const useWorkflowState = (): WorkflowDerivation => {
    const snapshot = useTypedSelector<MachineSnapshot, RootState>(
        buildSnapshot,
    );
    const wasConnected = useRef(false);
    const [originSlots, setOriginSlots] = useState<OriginSlot[]>([]);

    useEffect(() => {
        storage.get<OriginSlot[]>(ORIGIN_SLOTS_STORAGE_KEY, []).then((slots) => {
            setOriginSlots(slots ?? []);
        });
    }, []);

    useEffect(() => {
        void machine.query('$#').catch(() => {});
    }, []);

    useEffect(() => {
        const isConnected = snapshot?.connection.isConnected ?? false;
        if (isConnected && !wasConnected.current) {
            void machine.query('$#').catch(() => {});
        }
        wasConnected.current = isConnected;
    }, [snapshot?.connection.isConnected]);

    const aux: WorkflowAux = {
        originSlots,
        checklistHistory: [],
        routine: { active: false, fileName: null },
        pluginSettings: {},
    };

    if (!snapshot) {
        return { state: 'DISCONNECTED', reason: 'Waiting for machine state…' };
    }

    return deriveWorkflowState(snapshot, aux);
};
