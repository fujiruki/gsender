import { type ReactNode, useCallback, useState } from 'react';

import ConfirmDialog from './ConfirmDialog';

type ConfirmOptions = {
    title: string;
    message: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
};

type PendingConfirm = ConfirmOptions & {
    resolve: (approved: boolean) => void;
};

/**
 * Bridges an imperative `confirm(): Promise<boolean>` call (what
 * `restoreOrigin`'s `confirmClearG92` dependency expects) to a declaratively
 * rendered dialog.
 */
export const useConfirmDialog = () => {
    const [pending, setPending] = useState<PendingConfirm | null>(null);

    const requestConfirm = useCallback(
        (options: ConfirmOptions): Promise<boolean> =>
            new Promise((resolve) => {
                setPending({ ...options, resolve });
            }),
        [],
    );

    const handleConfirm = () => {
        pending?.resolve(true);
        setPending(null);
    };

    const handleCancel = () => {
        pending?.resolve(false);
        setPending(null);
    };

    const dialog = pending ? (
        <ConfirmDialog
            title={pending.title}
            message={pending.message}
            confirmLabel={pending.confirmLabel}
            cancelLabel={pending.cancelLabel}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
        />
    ) : null;

    return { requestConfirm, dialog };
};
