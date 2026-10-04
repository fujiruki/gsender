import { canRestoreOrigin } from './canRestoreOrigin';
import { parseParameterLines } from './parseParameterLines';
import type {
    ParameterOffset,
    RestoreDeps,
    RestoreGuardState,
    RestoreResult,
    RestoreTarget,
} from './types';

const G54_MATCH_TOLERANCE_MM = 0.01;

const toNumber = (value: string): number => Number.parseFloat(value) || 0;

const isOffsetNonZero = (offset: ParameterOffset): boolean =>
    toNumber(offset.x) !== 0 ||
    toNumber(offset.y) !== 0 ||
    toNumber(offset.z) !== 0;

const formatNumber = (value: number): string => value.toFixed(3);

const buildRestoreGcode = (target: RestoreTarget): string[] => {
    if (target.kind === 'xyz') {
        const { x, y, z } = target.slot;
        return [
            'G21',
            'G90',
            'G54',
            `G10 L2 P1 X${formatNumber(x)} Y${formatNumber(y)} Z${formatNumber(z)}`,
            '$#',
        ];
    }

    const z = target.slot.z + target.materialThicknessMm;
    return ['G21', 'G90', 'G54', `G10 L2 P1 Z${formatNumber(z)}`, '$#'];
};

const expectedOffset = (target: RestoreTarget): Partial<ParameterOffset> =>
    target.kind === 'xyz'
        ? {
              x: formatNumber(target.slot.x),
              y: formatNumber(target.slot.y),
              z: formatNumber(target.slot.z),
          }
        : { z: formatNumber(target.slot.z + target.materialThicknessMm) };

const matchesTarget = (g54: ParameterOffset, target: RestoreTarget): boolean => {
    if (target.kind === 'xyz') {
        return (
            Math.abs(toNumber(g54.x) - target.slot.x) <= G54_MATCH_TOLERANCE_MM &&
            Math.abs(toNumber(g54.y) - target.slot.y) <= G54_MATCH_TOLERANCE_MM &&
            Math.abs(toNumber(g54.z) - target.slot.z) <= G54_MATCH_TOLERANCE_MM
        );
    }

    const expectedZ = target.slot.z + target.materialThicknessMm;
    return Math.abs(toNumber(g54.z) - expectedZ) <= G54_MATCH_TOLERANCE_MM;
};

/**
 * Implements spec/07's restore flow verbatim: guard -> detect/clear a
 * leftover G92 (only after human approval, never unconditionally) -> send
 * the G10 L2 restore -> re-query and verify. Never generates G92 itself.
 */
export const restoreOrigin = async (
    target: RestoreTarget,
    guard: RestoreGuardState,
    deps: RestoreDeps,
): Promise<RestoreResult> => {
    const guardResult = canRestoreOrigin(guard);
    if (!guardResult.allowed) {
        return { outcome: 'BLOCKED', reason: guardResult.reason };
    }

    const before = await deps.query('$#');
    const beforeParams = parseParameterLines(before.lines);

    if (beforeParams.G92 && isOffsetNonZero(beforeParams.G92)) {
        const approved = await deps.confirmClearG92();
        if (!approved) {
            return { outcome: 'CANCELLED', reason: 'G92 clear was not approved.' };
        }
        await deps.sendGcode(['G92.1']);
    }

    await deps.sendGcode(buildRestoreGcode(target));

    const after = await deps.query('$#');
    const afterParams = parseParameterLines(after.lines);
    const g54 = afterParams.G54 ?? { x: '0', y: '0', z: '0' };

    if (!afterParams.G54 || !matchesTarget(g54, target)) {
        return { outcome: 'ORIGIN_MISMATCH', g54, expected: expectedOffset(target) };
    }

    return { outcome: 'ORIGIN_SET', g54 };
};
