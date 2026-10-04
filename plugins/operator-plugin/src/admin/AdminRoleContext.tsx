import {
    type ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import { isPinAccepted } from './pinGate';
import { clearAdminPin, getAdminPinHash, setAdminPin } from './pinStorage';
import { usePinPrompt } from './usePinPrompt';

export type Role = 'OPERATOR' | 'ADMIN';

type AdminRoleContextValue = {
    role: Role;
    hasPinSet: boolean;
    /** Switches to ADMIN, prompting for the PIN first if one is set.
     * Resolves to whether the switch succeeded. */
    requestAdminMode: () => Promise<boolean>;
    exitAdminMode: () => void;
    setPin: (pin: string) => Promise<void>;
    clearPin: () => Promise<void>;
    /** Shared PIN gate for actions outside this context (e.g. exiting
     * Routine mode), prompting for the PIN first if one is set. */
    requirePin: (promptMessage: string) => Promise<boolean>;
};

const AdminRoleContext = createContext<AdminRoleContextValue | null>(null);

/**
 * `role` is session-only by design (never written to storage): a Plugin
 * reload always comes back up as OPERATOR, the same safe-by-default
 * principle T2/T6 already use for workflow state and the checklist.
 */
export const AdminRoleProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<Role>('OPERATOR');
    const [pinHash, setPinHash] = useState<string | undefined>(undefined);
    const { requestPin, dialog } = usePinPrompt();

    useEffect(() => {
        void getAdminPinHash().then(setPinHash);
    }, []);

    const requirePin = async (promptMessage: string): Promise<boolean> => {
        if (!pinHash) {
            return true;
        }
        const entered = await requestPin({
            title: 'Enter admin PIN',
            message: promptMessage,
        });
        return isPinAccepted(entered, pinHash);
    };

    const requestAdminMode = async (): Promise<boolean> => {
        const accepted = await requirePin(
            'Enter the admin PIN to switch to Admin mode.',
        );
        if (accepted) {
            setRole('ADMIN');
        }
        return accepted;
    };

    const exitAdminMode = () => setRole('OPERATOR');

    const handleSetPin = async (pin: string) => {
        await setAdminPin(pin);
        setPinHash(await getAdminPinHash());
    };

    const handleClearPin = async () => {
        await clearAdminPin();
        setPinHash(undefined);
    };

    return (
        <AdminRoleContext.Provider
            value={{
                role,
                hasPinSet: pinHash !== undefined,
                requestAdminMode,
                exitAdminMode,
                setPin: handleSetPin,
                clearPin: handleClearPin,
                requirePin,
            }}
        >
            {children}
            {dialog}
        </AdminRoleContext.Provider>
    );
};

export const useAdminRole = (): AdminRoleContextValue => {
    const value = useContext(AdminRoleContext);
    if (!value) {
        throw new Error('useAdminRole must be used within an AdminRoleProvider');
    }
    return value;
};
