import { storage } from '@sienci/gsender-plugin-sdk';

import { hashPin } from './pinHash';

export const ADMIN_PIN_HASH_STORAGE_KEY = 'adminPinHash';

export const getAdminPinHash = (): Promise<string | undefined> =>
    storage.get<string>(ADMIN_PIN_HASH_STORAGE_KEY);

export const setAdminPin = async (pin: string): Promise<void> => {
    await storage.set(ADMIN_PIN_HASH_STORAGE_KEY, await hashPin(pin));
};

export const clearAdminPin = (): Promise<void> =>
    storage.delete(ADMIN_PIN_HASH_STORAGE_KEY);
