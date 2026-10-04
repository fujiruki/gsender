import { describe, expect, it } from 'vitest';

import {
    Z_ONLY_PROBE_DEFAULTS,
    generateZOnlyProbeGcode,
} from '../generateZOnlyProbeGcode';

describe('generateZOnlyProbeGcode (macro 4 migration)', () => {
    it('matches macro 4 with P0 -> P1 and an explicit G21 G54 lead-in', () => {
        const lines = generateZOnlyProbeGcode(Z_ONLY_PROBE_DEFAULTS);

        expect(lines).toEqual([
            'G21 G54',
            'G91',
            'G38.2 Z-10 F70',
            'G0 Z1',
            'G38.2 Z-10 F30',
            'G4 P0.1',
            'G10 L20 P1 Z5.01',
            'G4 P0.1',
            'G0 Z10',
            'G90',
        ]);
    });

    it('never generates a G92 line', () => {
        const lines = generateZOnlyProbeGcode(Z_ONLY_PROBE_DEFAULTS);
        expect(lines.some((line) => line.includes('G92'))).toBe(false);
    });
});
