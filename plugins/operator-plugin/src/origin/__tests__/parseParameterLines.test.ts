import { describe, expect, it } from 'vitest';

import { parseParameterLines } from '../parseParameterLines';

describe('parseParameterLines', () => {
    it('parses G54 from a typical $# response', () => {
        const lines = [
            '[G54:-345.801,-213.302,-57.665]',
            '[G55:0.000,0.000,0.000]',
            '[G92:0.000,0.000,0.000]',
            'ok',
        ];

        const result = parseParameterLines(lines);

        expect(result.G54).toEqual({
            x: '-345.801',
            y: '-213.302',
            z: '-57.665',
        });
        expect(result.G92).toEqual({ x: '0.000', y: '0.000', z: '0.000' });
    });

    it('parses all of G54-G59', () => {
        const lines = [
            '[G54:1.000,2.000,3.000]',
            '[G55:4.000,5.000,6.000]',
            '[G56:7.000,8.000,9.000]',
            '[G57:10.000,11.000,12.000]',
            '[G58:13.000,14.000,15.000]',
            '[G59:16.000,17.000,18.000]',
        ];

        const result = parseParameterLines(lines);

        expect(result.G54).toEqual({ x: '1.000', y: '2.000', z: '3.000' });
        expect(result.G59).toEqual({ x: '16.000', y: '17.000', z: '18.000' });
    });

    it('parses a successful PRB line', () => {
        const lines = ['[PRB:1.500,2.500,-3.500:1]'];

        const result = parseParameterLines(lines);

        expect(result.PRB).toEqual({
            x: '1.500',
            y: '2.500',
            z: '-3.500',
            ok: true,
        });
    });

    it('parses a failed PRB line (trailing :0)', () => {
        const lines = ['[PRB:0.000,0.000,0.000:0]'];

        const result = parseParameterLines(lines);

        expect(result.PRB?.ok).toBe(false);
    });

    it('tolerates grblHAL-style PRB lines with extra trailing axes', () => {
        const lines = ['[PRB:1.000,2.000,3.000,0.000,0.000,0.000:1]'];

        const result = parseParameterLines(lines);

        expect(result.PRB).toEqual({
            x: '1.000',
            y: '2.000',
            z: '3.000',
            ok: true,
        });
    });

    it('ignores unrelated lines (ok, ALARM, ad-hoc messages)', () => {
        const lines = [
            'ok',
            '[MSG:some message]',
            'ALARM:1',
            '[G54:1.000,2.000,3.000]',
        ];

        const result = parseParameterLines(lines);

        expect(result.G54).toEqual({ x: '1.000', y: '2.000', z: '3.000' });
        expect(Object.keys(result)).toEqual(['G54']);
    });

    it('returns an empty object for an empty response', () => {
        expect(parseParameterLines([])).toEqual({});
    });
});
