import { storage } from '@sienci/gsender-plugin-sdk';

import type { OriginSlot, ZOriginSlot } from './types';

export const ORIGIN_SLOTS_STORAGE_KEY = 'originSlots';
export const Z_ORIGIN_SLOTS_STORAGE_KEY = 'zOriginSlots';

// Macro 3 "Homing + usual front-left XY0" constants — see
// docs/spec/reference/cncjs-probe-macros-source.md. Name matches spec/07's
// own Japanese naming for this slot.
export const DEFAULT_ORIGIN_SLOTS: OriginSlot[] = [
    {
        id: 'usual-front-left',
        name: 'いつもの左前XY0',
        x: -345.801,
        y: -213.302,
        z: -57.665,
    },
];

// Macro 5 "NC bottom = Z0, then offset by material thickness".
export const DEFAULT_Z_ORIGIN_SLOTS: ZOriginSlot[] = [
    { id: 'nc-bottom-z0', name: 'NC底面Z0', z: -100.118 },
];

export const upsertSlot = <T extends { id: string }>(
    slots: T[],
    slot: T,
): T[] => {
    const index = slots.findIndex((existing) => existing.id === slot.id);
    if (index === -1) {
        return [...slots, slot];
    }
    const next = [...slots];
    next[index] = slot;
    return next;
};

export const removeSlot = <T extends { id: string }>(
    slots: T[],
    id: string,
): T[] => slots.filter((slot) => slot.id !== id);

export const listOriginSlots = async (): Promise<OriginSlot[]> =>
    (await storage.get<OriginSlot[]>(
        ORIGIN_SLOTS_STORAGE_KEY,
        DEFAULT_ORIGIN_SLOTS,
    )) ?? DEFAULT_ORIGIN_SLOTS;

export const saveOriginSlot = async (
    slot: OriginSlot,
): Promise<OriginSlot[]> => {
    const next = upsertSlot(await listOriginSlots(), slot);
    await storage.set(ORIGIN_SLOTS_STORAGE_KEY, next);
    return next;
};

export const deleteOriginSlot = async (id: string): Promise<OriginSlot[]> => {
    const next = removeSlot(await listOriginSlots(), id);
    await storage.set(ORIGIN_SLOTS_STORAGE_KEY, next);
    return next;
};

export const listZOriginSlots = async (): Promise<ZOriginSlot[]> =>
    (await storage.get<ZOriginSlot[]>(
        Z_ORIGIN_SLOTS_STORAGE_KEY,
        DEFAULT_Z_ORIGIN_SLOTS,
    )) ?? DEFAULT_Z_ORIGIN_SLOTS;

export const saveZOriginSlot = async (
    slot: ZOriginSlot,
): Promise<ZOriginSlot[]> => {
    const next = upsertSlot(await listZOriginSlots(), slot);
    await storage.set(Z_ORIGIN_SLOTS_STORAGE_KEY, next);
    return next;
};

export const deleteZOriginSlot = async (id: string): Promise<ZOriginSlot[]> => {
    const next = removeSlot(await listZOriginSlots(), id);
    await storage.set(Z_ORIGIN_SLOTS_STORAGE_KEY, next);
    return next;
};
