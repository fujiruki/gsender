import { useTypedSelector } from '@sienci/gsender-plugin-sdk/react';

import type { RestoreGuardState } from './types';

type RootState = {
    connection?: { isConnected?: boolean };
    controller?: {
        hasHomed?: boolean;
        state?: { status?: { activeState?: string } };
        workflow?: { state?: string };
    };
    pluginState?: { busy?: boolean };
};

const DISCONNECTED_GUARD: RestoreGuardState = {
    isConnected: false,
    activeState: 'Idle',
    workflowState: 'idle',
    hasHomed: false,
    pluginBusy: false,
};

const buildGuardState = (state: RootState): RestoreGuardState => ({
    isConnected: state.connection?.isConnected ?? false,
    activeState: state.controller?.state?.status?.activeState ?? 'Idle',
    workflowState: state.controller?.workflow?.state ?? 'idle',
    hasHomed: state.controller?.hasHomed ?? false,
    pluginBusy: state.pluginState?.busy ?? false,
});

export const useRestoreGuardState = (): RestoreGuardState =>
    useTypedSelector<RestoreGuardState, RootState>(buildGuardState) ??
    DISCONNECTED_GUARD;
