import { useCallback, useState } from 'react';

import PinPromptDialog from './PinPromptDialog';

type PinPromptOptions = {
    title: string;
    message: string;
};

type PendingPrompt = PinPromptOptions & {
    resolve: (pin: string | null) => void;
};

/** Mirrors useConfirmDialog's bridge pattern, for a PIN text entry instead
 * of a yes/no choice. Resolves `null` on cancel. */
export const usePinPrompt = () => {
    const [pending, setPending] = useState<PendingPrompt | null>(null);

    const requestPin = useCallback(
        (options: PinPromptOptions): Promise<string | null> =>
            new Promise((resolve) => {
                setPending({ ...options, resolve });
            }),
        [],
    );

    const handleSubmit = (pin: string) => {
        pending?.resolve(pin);
        setPending(null);
    };

    const handleCancel = () => {
        pending?.resolve(null);
        setPending(null);
    };

    const dialog = pending ? (
        <PinPromptDialog
            title={pending.title}
            message={pending.message}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    ) : null;

    return { requestPin, dialog };
};
