import { machine } from '@sienci/gsender-plugin-sdk';
import { useEffect, useState } from 'react';

import { useConfirmDialog } from '../components/useConfirmDialog';
import { canRestoreOrigin } from './canRestoreOrigin';
import {
    listOriginSlots,
    listZOriginSlots,
    saveOriginSlot,
} from './originSlotsStorage';
import { restoreOrigin } from './restoreOrigin';
import { saveCurrentPositionAsOriginSlot } from './saveCurrentPosition';
import type { OriginSlot, RestoreDeps, RestoreResult, ZOriginSlot } from './types';
import { useRestoreGuardState } from './useRestoreGuardState';

const MAX_MATERIAL_THICKNESS_MM = 200;

const makeRestoreDeps = (
    confirmClearG92: RestoreDeps['confirmClearG92'],
): RestoreDeps => ({
    query: (cmd) => machine.query(cmd),
    sendGcode: (lines) => machine.command('gcode', lines),
    confirmClearG92,
});

const formatResult = (result: RestoreResult): string => {
    switch (result.outcome) {
        case 'ORIGIN_SET':
            return `Origin set: X${result.g54.x} Y${result.g54.y} Z${result.g54.z}`;
        case 'ORIGIN_MISMATCH':
            return `Mismatch after restore: got X${result.g54.x} Y${result.g54.y} Z${result.g54.z}, expected ${JSON.stringify(result.expected)}. Treat this as a human judgement call, not an auto-retry.`;
        case 'CANCELLED':
        case 'BLOCKED':
            return result.reason;
    }
};

/**
 * T3: origin slot restore/save UI. Role enforcement (Admin-only "save
 * current position") is T7 scope — the control is simply labelled as such
 * for now.
 */
const OriginPanel = () => {
    const guard = useRestoreGuardState();
    const guardResult = canRestoreOrigin(guard);
    const { requestConfirm, dialog } = useConfirmDialog();

    const [slots, setSlots] = useState<OriginSlot[]>([]);
    const [zSlots, setZSlots] = useState<ZOriginSlot[]>([]);
    const [thicknessInput, setThicknessInput] = useState('0');
    const [busySlotId, setBusySlotId] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<RestoreResult | null>(null);
    const [newSlotName, setNewSlotName] = useState('');
    const [savingSlot, setSavingSlot] = useState(false);

    useEffect(() => {
        void listOriginSlots().then(setSlots);
        void listZOriginSlots().then(setZSlots);
    }, []);

    const confirmClearG92: RestoreDeps['confirmClearG92'] = () =>
        requestConfirm({
            title: 'Clear leftover G92 offset?',
            message:
                'A temporary G92 offset is present and must be cleared before the origin can be restored or verified. Clear it now (G92.1)?',
            confirmLabel: 'Clear G92',
            cancelLabel: 'Cancel',
        });

    const runRestore = async (
        slotId: string,
        target: Parameters<typeof restoreOrigin>[0],
    ) => {
        setBusySlotId(slotId);
        setLastResult(null);
        try {
            const result = await restoreOrigin(
                target,
                guard,
                makeRestoreDeps(confirmClearG92),
            );
            setLastResult(result);
        } finally {
            setBusySlotId(null);
        }
    };

    const handleRestoreXyz = (slot: OriginSlot) =>
        runRestore(slot.id, { kind: 'xyz', slot });

    const handleRestoreZ = (slot: ZOriginSlot) => {
        const materialThicknessMm = Number.parseFloat(thicknessInput);
        if (
            !Number.isFinite(materialThicknessMm) ||
            materialThicknessMm < 0 ||
            materialThicknessMm > MAX_MATERIAL_THICKNESS_MM
        ) {
            setLastResult({
                outcome: 'BLOCKED',
                reason: `Material thickness must be between 0 and ${MAX_MATERIAL_THICKNESS_MM}mm.`,
            });
            return;
        }
        return runRestore(slot.id, { kind: 'z', slot, materialThicknessMm });
    };

    const handleSaveCurrentPosition = async () => {
        const name = newSlotName.trim();
        if (!name) {
            return;
        }
        setSavingSlot(true);
        try {
            const slot = await saveCurrentPositionAsOriginSlot(name, {
                query: (cmd) => machine.query(cmd),
                sendGcode: (lines) => machine.command('gcode', lines),
            });
            await saveOriginSlot(slot);
            setSlots(await listOriginSlots());
            setNewSlotName('');
        } finally {
            setSavingSlot(false);
        }
    };

    return (
        <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
            <h2 className="mb-2 font-medium">Origin slots</h2>
            {!guardResult.allowed && (
                <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">
                    Restore disabled: {guardResult.reason}
                </p>
            )}

            <ul className="flex flex-col gap-2">
                {slots.map((slot) => (
                    <li
                        key={slot.id}
                        className="flex items-center justify-between gap-2 rounded border border-gray-200 p-2 text-sm dark:border-gray-800"
                    >
                        <div>
                            <p className="font-medium">{slot.name}</p>
                            <p className="text-gray-500 dark:text-gray-400">
                                X{slot.x} Y{slot.y} Z{slot.z}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRestoreXyz(slot)}
                            disabled={
                                !guardResult.allowed || busySlotId === slot.id
                            }
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                        >
                            {busySlotId === slot.id
                                ? 'Restoring…'
                                : 'Restore'}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex items-end gap-2 border-t border-gray-200 pt-3 text-sm dark:border-gray-800">
                <label className="flex flex-col gap-1">
                    <span>New slot name (admin)</span>
                    <input
                        type="text"
                        value={newSlotName}
                        onChange={(event) =>
                            setNewSlotName(event.target.value)
                        }
                        placeholder="e.g. Jig B front-left"
                        className="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                    />
                </label>
                <button
                    type="button"
                    onClick={handleSaveCurrentPosition}
                    disabled={
                        !guardResult.allowed ||
                        savingSlot ||
                        !newSlotName.trim()
                    }
                    className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-50 dark:border-gray-700"
                >
                    {savingSlot ? 'Saving…' : 'Save current position'}
                </button>
            </div>

            {zSlots.map((slot) => (
                <div
                    key={slot.id}
                    className="mt-4 flex items-end gap-2 border-t border-gray-200 pt-3 text-sm dark:border-gray-800"
                >
                    <div>
                        <p className="font-medium">{slot.name}</p>
                        <p className="text-gray-500 dark:text-gray-400">
                            Z{slot.z}
                        </p>
                    </div>
                    <label className="flex flex-col gap-1">
                        <span>Material thickness (mm)</span>
                        <input
                            type="number"
                            min={0}
                            max={MAX_MATERIAL_THICKNESS_MM}
                            step={0.01}
                            value={thicknessInput}
                            onChange={(event) =>
                                setThicknessInput(event.target.value)
                            }
                            className="w-28 rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={() => handleRestoreZ(slot)}
                        disabled={
                            !guardResult.allowed || busySlotId === slot.id
                        }
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                    >
                        {busySlotId === slot.id ? 'Applying…' : 'Apply Z'}
                    </button>
                </div>
            ))}

            {lastResult && (
                <p
                    className={`mt-3 text-sm ${
                        lastResult.outcome === 'ORIGIN_SET'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                    }`}
                >
                    {formatResult(lastResult)}
                </p>
            )}

            {dialog}
        </section>
    );
};

export default OriginPanel;
