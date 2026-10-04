import { useState } from 'react';

import { useAdminRole } from './AdminRoleContext';

const AdminControls = () => {
    const { role, hasPinSet, requestAdminMode, exitAdminMode, setPin, clearPin } =
        useAdminRole();
    const [newPin, setNewPin] = useState('');
    const [switching, setSwitching] = useState(false);

    const handleToggleRole = async () => {
        if (role === 'ADMIN') {
            exitAdminMode();
            return;
        }
        setSwitching(true);
        try {
            await requestAdminMode();
        } finally {
            setSwitching(false);
        }
    };

    const handleSetPin = async () => {
        if (!newPin.trim()) {
            return;
        }
        await setPin(newPin.trim());
        setNewPin('');
    };

    return (
        <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
            <h2 className="mb-2 font-medium">Role</h2>
            <div className="flex items-center gap-3 text-sm">
                <span
                    className={`rounded-full px-3 py-1 font-mono ${
                        role === 'ADMIN'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                >
                    {role}
                </span>
                <button
                    type="button"
                    onClick={handleToggleRole}
                    disabled={switching}
                    className="rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-50 dark:border-gray-700"
                >
                    {role === 'ADMIN' ? 'Exit admin mode' : 'Enter admin mode'}
                </button>
            </div>

            {role === 'ADMIN' && (
                <div className="mt-3 flex items-end gap-2 border-t border-gray-200 pt-3 text-sm dark:border-gray-800">
                    <label className="flex flex-col gap-1">
                        <span>
                            {hasPinSet ? 'Change admin PIN' : 'Set admin PIN (optional)'}
                        </span>
                        <input
                            type="password"
                            inputMode="numeric"
                            value={newPin}
                            onChange={(event) => setNewPin(event.target.value)}
                            className="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={handleSetPin}
                        disabled={!newPin.trim()}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                    >
                        Save
                    </button>
                    {hasPinSet && (
                        <button
                            type="button"
                            onClick={() => void clearPin()}
                            className="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-700"
                        >
                            Clear PIN
                        </button>
                    )}
                </div>
            )}
        </section>
    );
};

export default AdminControls;
