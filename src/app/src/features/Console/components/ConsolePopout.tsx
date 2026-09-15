import { FaExternalLinkAlt } from 'react-icons/fa';
import isElectron from 'is-electron';

import Tooltip from 'app/components/Tooltip';
import { toast } from 'app/lib/toaster';

import { usePostHog } from 'posthog-js/react';
import { t } from 'app/i18n';

export function ConsolePopout() {
    const posthog = usePostHog();

    function openWindow() {
        const route = `/console`;
        if (isElectron()) {
            window.ipcRenderer.send('open-new-window', route);
            posthog.capture('console_popout_opened');
        } else {
            toast.info(t('This functionality is not available on web view.'), {
                position: 'bottom-right',
            });
        }
    }

    return (
        <Tooltip content={t('Open console in new window')}>
            <button
                className="absolute top-3 right-3 text-white text-2xl"
                onClick={() => openWindow()}
                aria-label={t('Open console in new window')}
            >
                <FaExternalLinkAlt />
            </button>
        </Tooltip>
    );
}
