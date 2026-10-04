import { describe, expect, it } from 'vitest';

import {
    PROBE_PARAM_DEFAULTS,
    generateProbeGcode,
} from '../generateProbeGcode';
import type { StartPosition, XyzProbeParams } from '../types';

// Golden tests: given macro 1/2's own constants (see
// docs/spec/reference/cncjs-probe-macros-source.md), every line must match
// what those macros compute -- except the G92 setup line and the two
// absolute moves that depended on it, which spec/07's G92-free redesign
// replaces with G53 (machine-coordinate) moves relative to the probe's
// starting position `start`.
const START: StartPosition = { x: 100, y: 200 };

const MACRO_1_PARAMS: XyzProbeParams = {
    ...PROBE_PARAM_DEFAULTS,
    endmillDiameterMm: 3.2,
    jigVariant: 'right-rear',
};

const MACRO_2_PARAMS: XyzProbeParams = {
    ...PROBE_PARAM_DEFAULTS,
    endmillDiameterMm: 3.16,
    jigVariant: 'left-rear',
};

describe('generateProbeGcode (XYZ, includeZ=true)', () => {
    it('matches macro 1 ("XYZ Probe right-rear", phi3.20) line for line, G92-free', () => {
        const lines = generateProbeGcode(MACRO_1_PARAMS, START, {
            includeZ: true,
        });

        expect(lines).toEqual([
            'G21 G90 G54',
            'G4 P0.5',
            'G91 G0 Z10',
            'G91 G0 X-13 Y-13',
            'G38.2 Z-10 F70',
            'G0 Z1',
            'G38.2 Z-10 F30',
            'G4 P0.1',
            'G10 L20 P1 Z5.01',
            'G4 P0.1',
            'G0 Z10',
            'G0 X33',
            'G0 Z-13',
            'G38.2 X-13 F70',
            'G0 X1',
            'G38.2 X-13 F30',
            'G4 P0.1',
            'G10 L20 P1 X11.6',
            'G4 P0.1',
            'G0 X6.5',
            'G0 Z10',
            'G90',
            'G53 G0 X87 Y220',
            'G91',
            'G91 G0 Z-13',
            'G38.2 Y-13 F70',
            'G0 Y1',
            'G38.2 Y-13 F30',
            'G4 P0.1',
            'G10 L20 P1 Y11.63',
            'G4 P0.1',
            'G0 Y10',
            'G0 Z20',
            'G90 G0 X0 Y0',
            '$#',
        ]);
    });

    it('matches macro 2 ("XYZ Probe left-rear", phi3.16) line for line, G92-free', () => {
        const lines = generateProbeGcode(MACRO_2_PARAMS, START, {
            includeZ: true,
        });

        expect(lines).toEqual([
            'G21 G90 G54',
            'G4 P0.5',
            'G91 G0 Z10',
            'G91 G0 X13 Y-13',
            'G38.2 Z-10 F70',
            'G0 Z1',
            'G38.2 Z-10 F30',
            'G4 P0.1',
            'G10 L20 P1 Z5.01',
            'G4 P0.1',
            'G0 Z10',
            'G0 X-33',
            'G0 Z-13',
            'G38.2 X13 F70',
            'G0 X-1',
            'G38.2 X13 F30',
            'G4 P0.1',
            'G10 L20 P1 X-11.58',
            'G4 P0.1',
            'G0 X-6.5',
            'G0 Z10',
            'G90',
            'G53 G0 X113 Y220',
            'G91',
            'G91 G0 Z-13',
            'G38.2 Y-13 F70',
            'G0 Y1',
            'G38.2 Y-13 F30',
            'G4 P0.1',
            'G10 L20 P1 Y11.61',
            'G4 P0.1',
            'G0 Y10',
            'G0 Z20',
            'G90 G0 X0 Y0',
            '$#',
        ]);
    });

    it('never generates a G92 line', () => {
        for (const params of [MACRO_1_PARAMS, MACRO_2_PARAMS]) {
            const lines = generateProbeGcode(params, START, {
                includeZ: true,
            });
            expect(lines.some((line) => line.includes('G92'))).toBe(false);
        }
    });
});

describe('generateProbeGcode (XY-only, includeZ=false)', () => {
    it('skips the Z-probe contact block, uses -10 (not -13) for the side-probe depth, but keeps every other step', () => {
        const lines = generateProbeGcode(MACRO_1_PARAMS, START, {
            includeZ: false,
        });

        expect(lines).toEqual([
            'G21 G90 G54',
            'G4 P0.5',
            'G91 G0 Z10',
            'G0 X33',
            'G0 Z-10',
            'G38.2 X-13 F70',
            'G0 X1',
            'G38.2 X-13 F30',
            'G4 P0.1',
            'G10 L20 P1 X11.6',
            'G4 P0.1',
            'G0 X6.5',
            'G0 Z10',
            'G90',
            'G53 G0 X87 Y220',
            'G91',
            'G91 G0 Z-10',
            'G38.2 Y-13 F70',
            'G0 Y1',
            'G38.2 Y-13 F30',
            'G4 P0.1',
            'G10 L20 P1 Y11.63',
            'G4 P0.1',
            'G0 Y10',
            'G0 Z20',
            'G90 G0 X0 Y0',
            '$#',
        ]);
    });

    it('never touches Z with G38.2 or G10 L20', () => {
        const lines = generateProbeGcode(MACRO_1_PARAMS, START, {
            includeZ: false,
        });
        expect(lines.some((line) => /G38\.2 Z/.test(line))).toBe(false);
        expect(lines.some((line) => /G10 L20 P1 Z/.test(line))).toBe(false);
    });
});
