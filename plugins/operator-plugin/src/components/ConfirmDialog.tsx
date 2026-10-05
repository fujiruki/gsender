import type { ReactNode } from 'react';

type ConfirmDialogProps = {
    title: string;
    message: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

/**
 * Plain in-page modal, not window.confirm(): the plugin iframe's sandbox
 * (`allow-scripts allow-forms allow-same-origin`, no `allow-modals`) blocks
 * native browser dialogs.
 */
const ConfirmDialog = ({
    title,
    message,
    confirmLabel = 'OK',
    cancelLabel = 'キャンセル',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm rounded-md bg-white p-4 shadow-lg dark:bg-gray-900">
            <h2 className="mb-2 font-semibold">{title}</h2>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                {message}
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
                >
                    {cancelLabel}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white"
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    </div>
);

export default ConfirmDialog;
