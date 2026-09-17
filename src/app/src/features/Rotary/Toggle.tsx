import { usePostHog } from '@posthog/react';
import { Switch } from 'app/components/shadcn/Switch';
import Tooltip from 'app/components/Tooltip';
import { WORKSPACE_MODE } from 'app/constants';
import { useTypedSelector } from 'app/hooks/useTypedSelector';
import { useWorkspaceState } from 'app/hooks/useWorkspaceState';
import { t } from 'app/i18n';
import { updateWorkspaceMode } from 'app/lib/rotary';

const Toggle = () => {
    const { mode } = useWorkspaceState();
    const { type: controllerType } = useTypedSelector(
        (state) => state.controller,
    );
    const connected = useTypedSelector((state) => state.connection.isConnected);
    const posthog = usePostHog();

    const handleToggle = (checked: boolean) => {
        const newMode = checked
            ? WORKSPACE_MODE.ROTARY
            : WORKSPACE_MODE.DEFAULT;

        updateWorkspaceMode(newMode);

        posthog?.capture('rotary_mode_toggled', { mode: newMode });
    };

    const tooltipContent =
        controllerType === 'grblHAL'
            ? t('Enable 4-axis or Rotary mode')
            : t('Toggle Rotary mode');

    return (
        <div className="flex items-center gap-2 dark:text-content-primary">
            {controllerType === 'grblHAL' && <span>{t('4-Axis')}</span>}
            <Tooltip content={tooltipContent}>
                <div>
                    <Switch
                        checked={mode === WORKSPACE_MODE.ROTARY}
                        onChange={handleToggle}
                        disabled={!connected}
                        aria-label={t('Toggle Rotary mode')}
                    />
                </div>
            </Tooltip>
            <span>{t('Rotary')}</span>
        </div>
    );
};

export default Toggle;
