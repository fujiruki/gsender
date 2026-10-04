import { describe, expect, it } from 'vitest';

import { deriveWorkflowState } from '../deriveWorkflowState';
import type {
    MachineSnapshot,
    OriginSlot,
    WorkflowAux,
    WorkflowState,
} from '../types';

const HOME_SLOT: OriginSlot = {
    id: 'usual-front-left',
    name: 'Usual front-left',
    x: -345.801,
    y: -213.302,
    z: -57.665,
};

const ZERO_OFFSET = { x: '0.000', y: '0.000', z: '0.000' };

const baseSnapshot = (): MachineSnapshot => ({
    connection: { isConnected: true },
    controller: {
        hasHomed: true,
        state: { status: { activeState: 'Idle' } },
        workflow: { state: 'idle' },
        settings: {
            parameters: {
                G54: {
                    x: String(HOME_SLOT.x),
                    y: String(HOME_SLOT.y),
                    z: String(HOME_SLOT.z),
                },
                G92: ZERO_OFFSET,
            },
        },
    },
    fileInfo: { fileLoaded: false, fileName: null },
    pluginState: { busy: false },
});

const baseAux = (): WorkflowAux => ({
    originSlots: [HOME_SLOT],
    checklistHistory: [],
    routine: { active: false, fileName: null },
    pluginSettings: {},
});

type Case = {
    name: string;
    snapshot?: (snapshot: MachineSnapshot) => MachineSnapshot;
    aux?: (aux: WorkflowAux) => WorkflowAux;
    expected: WorkflowState;
};

const cases: Case[] = [
    {
        name: 'not connected -> DISCONNECTED',
        snapshot: (s) => ({ ...s, connection: { isConnected: false } }),
        expected: 'DISCONNECTED',
    },
    {
        name: 'disconnected outranks alarm/unhomed (priority order)',
        snapshot: (s) => ({
            ...s,
            connection: { isConnected: false },
            controller: {
                ...s.controller,
                hasHomed: false,
                state: { status: { activeState: 'Alarm' } },
            },
        }),
        expected: 'DISCONNECTED',
    },
    {
        name: 'alarm -> ALARM',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                state: { status: { activeState: 'Alarm' } },
            },
        }),
        expected: 'ALARM',
    },
    {
        name: 'alarm outranks a running job (priority order)',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                state: { status: { activeState: 'Alarm' } },
                workflow: { state: 'running' },
            },
        }),
        expected: 'ALARM',
    },
    {
        name: 'workflow running -> RUNNING',
        snapshot: (s) => ({
            ...s,
            controller: { ...s.controller, workflow: { state: 'running' } },
        }),
        expected: 'RUNNING',
    },
    {
        name: 'workflow paused -> PAUSED',
        snapshot: (s) => ({
            ...s,
            controller: { ...s.controller, workflow: { state: 'paused' } },
        }),
        expected: 'PAUSED',
    },
    {
        name: 'running outranks not-yet-homed (priority order)',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                hasHomed: false,
                workflow: { state: 'running' },
            },
        }),
        expected: 'RUNNING',
    },
    {
        name: 'homing cycle in progress -> HOMING',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                hasHomed: false,
                state: { status: { activeState: 'Home' } },
            },
        }),
        expected: 'HOMING',
    },
    {
        name: 'connected but never homed -> CONNECTED_UNHOMED',
        snapshot: (s) => ({
            ...s,
            controller: { ...s.controller, hasHomed: false },
        }),
        expected: 'CONNECTED_UNHOMED',
    },
    {
        name: 'not-yet-homed outranks plugin busy (priority order)',
        snapshot: (s) => ({
            ...s,
            controller: { ...s.controller, hasHomed: false },
            pluginState: { busy: true },
        }),
        expected: 'CONNECTED_UNHOMED',
    },
    {
        name: 'plugin-driven operation in progress -> PROBING',
        snapshot: (s) => ({ ...s, pluginState: { busy: true } }),
        expected: 'PROBING',
    },
    {
        name: 'plugin busy outranks a stale G92 offset (priority order)',
        snapshot: (s) => ({
            ...s,
            pluginState: { busy: true },
            controller: {
                ...s.controller,
                settings: {
                    parameters: {
                        G54: s.controller.settings.parameters.G54,
                        G92: { x: '1.000', y: '0.000', z: '0.000' },
                    },
                },
            },
        }),
        expected: 'PROBING',
    },
    {
        name: 'leftover G92 offset -> G92_PRESENT',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                settings: {
                    parameters: {
                        G54: s.controller.settings.parameters.G54,
                        G92: { x: '0.000', y: '0.000', z: '0.001' },
                    },
                },
            },
        }),
        expected: 'G92_PRESENT',
    },
    {
        name: 'G92 outranks an origin mismatch (priority order)',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                settings: {
                    parameters: {
                        G54: { x: '0.000', y: '0.000', z: '0.000' },
                        G92: { x: '0.000', y: '0.000', z: '5.000' },
                    },
                },
            },
        }),
        expected: 'G92_PRESENT',
    },
    {
        name: 'G54 within tolerance of a saved slot (boundary: exactly 0.01mm) -> ORIGIN_SET',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                settings: {
                    parameters: {
                        G54: {
                            x: String(HOME_SLOT.x + 0.01),
                            y: String(HOME_SLOT.y),
                            z: String(HOME_SLOT.z),
                        },
                        G92: ZERO_OFFSET,
                    },
                },
            },
        }),
        expected: 'ORIGIN_SET',
    },
    {
        name: 'G54 just outside tolerance (boundary: 0.011mm) -> HOMED_UNVERIFIED',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                settings: {
                    parameters: {
                        G54: {
                            x: String(HOME_SLOT.x + 0.011),
                            y: String(HOME_SLOT.y),
                            z: String(HOME_SLOT.z),
                        },
                        G92: ZERO_OFFSET,
                    },
                },
            },
        }),
        expected: 'HOMED_UNVERIFIED',
    },
    {
        name: 'G54 matches none of several saved slots -> HOMED_UNVERIFIED',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                settings: {
                    parameters: {
                        G54: { x: '10.000', y: '10.000', z: '10.000' },
                        G92: ZERO_OFFSET,
                    },
                },
            },
        }),
        aux: (a) => ({
            ...a,
            originSlots: [
                HOME_SLOT,
                { id: 'nc-bottom', name: 'NC bottom Z0', x: 0, y: 0, z: -100.118 },
            ],
        }),
        expected: 'HOMED_UNVERIFIED',
    },
    {
        name: 'G54 matches the second of several saved slots -> ORIGIN_SET',
        snapshot: (s) => ({
            ...s,
            controller: {
                ...s.controller,
                settings: {
                    parameters: {
                        G54: { x: '0.000', y: '0.000', z: '-100.118' },
                        G92: ZERO_OFFSET,
                    },
                },
            },
        }),
        aux: (a) => ({
            ...a,
            originSlots: [
                HOME_SLOT,
                { id: 'nc-bottom', name: 'NC bottom Z0', x: 0, y: 0, z: -100.118 },
            ],
        }),
        expected: 'ORIGIN_SET',
    },
    {
        name: 'no saved origin slots at all -> HOMED_UNVERIFIED',
        aux: (a) => ({ ...a, originSlots: [] }),
        expected: 'HOMED_UNVERIFIED',
    },
    {
        name: 'origin matches, file loaded, machine idle -> READY',
        snapshot: (s) => ({ ...s, fileInfo: { fileLoaded: true } }),
        expected: 'READY',
    },
    {
        name: 'origin matches, file loaded, machine not idle -> FILE_LOADED',
        snapshot: (s) => ({
            ...s,
            fileInfo: { fileLoaded: true },
            controller: {
                ...s.controller,
                state: { status: { activeState: 'Hold' } },
            },
        }),
        expected: 'FILE_LOADED',
    },
    {
        name: 'origin matches, no file loaded -> ORIGIN_SET',
        expected: 'ORIGIN_SET',
    },
];

describe('deriveWorkflowState', () => {
    it.each(cases)('$name', ({ snapshot, aux, expected }) => {
        const result = deriveWorkflowState(
            snapshot ? snapshot(baseSnapshot()) : baseSnapshot(),
            aux ? aux(baseAux()) : baseAux(),
        );

        expect(result.state).toBe(expected);
        expect(result.reason).toBeTruthy();
    });

    it('names the matched slot in the ORIGIN_SET reason', () => {
        const result = deriveWorkflowState(baseSnapshot(), baseAux());
        expect(result.reason).toContain('Usual front-left');
    });

    it('does not silently fall through: every reachable branch returns before the function body ends', () => {
        // the full priority order, run back-to-back against progressively
        // "healthier" snapshots, should visit every state exactly once
        const order: WorkflowState[] = [
            'DISCONNECTED',
            'ALARM',
            'RUNNING',
            'HOMING',
            'CONNECTED_UNHOMED',
            'PROBING',
            'G92_PRESENT',
            'HOMED_UNVERIFIED',
            'ORIGIN_SET',
            'READY',
        ];
        const seen = new Set(
            cases.map((c) => deriveWorkflowState(
                c.snapshot ? c.snapshot(baseSnapshot()) : baseSnapshot(),
                c.aux ? c.aux(baseAux()) : baseAux(),
            ).state),
        );
        for (const state of order) {
            expect(seen.has(state)).toBe(true);
        }
    });
});
