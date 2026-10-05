import { useState } from 'react';

type PinPromptDialogProps = {
    title: string;
    message: string;
    onSubmit: (pin: string) => void;
    onCancel: () => void;
};

/**
 * Not window.prompt(): same reasoning as ConfirmDialog -- the plugin
 * iframe's sandbox has no allow-modals, so native dialogs are a no-op.
 */
const PinPromptDialog = ({
    title,
    message,
    onSubmit,
    onCancel,
}: PinPromptDialogProps) => {
    const [pin, setPin] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit(pin);
                }}
                className="w-full max-w-sm rounded-md bg-white p-4 shadow-lg dark:bg-gray-900"
            >
                <h2 className="mb-2 font-semibold">{title}</h2>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                    {message}
                </p>
                <input
                    type="password"
                    inputMode="numeric"
                    autoFocus
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    className="mb-4 w-full rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                />
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white"
                    >
                        OK
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PinPromptDialog;
