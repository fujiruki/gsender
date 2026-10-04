import { verifyPin } from './pinHash';

/**
 * Shared gate used for both switching to Admin mode and exiting Routine
 * mode: free to pass when no PIN was ever set, otherwise the entered PIN
 * must match.
 */
export const isPinAccepted = async (
    enteredPin: string | null,
    storedHash: string | undefined,
): Promise<boolean> => {
    if (!storedHash) {
        return true;
    }
    if (!enteredPin) {
        return false;
    }
    return verifyPin(enteredPin, storedHash);
};
