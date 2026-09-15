import { useEffect, useState } from 'react';
import controller from 'app/lib/controller.ts';
import { useTypedSelector } from 'app/hooks/useTypedSelector.ts';
import { RootState } from 'app/store/redux';
import { StepActionButton } from 'app/features/AccessoryInstaller/components/wizard/StepActionButton.tsx';
import { StepProps } from 'app/features/AccessoryInstaller/types';
import {GRBL_ACTIVE_STATE_ALARM} from "app/constants";
import { t } from 'app/i18n';

export function RestartAndRehome({ onComplete, onUncomplete }: StepProps) {
    const [rehomed, setRehomed] = useState<boolean>(false);
    const [clickedRehome, setClickedRehome] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const hasHomed = useTypedSelector(
        (state: RootState) => state.controller.hasHomed,
    );

    const isConnected = useTypedSelector(
        (state: RootState) => state.connection.isConnected,
    );

    const activeState= useTypedSelector((state: RootState) => state.controller.state.status?.activeState);
    const alarmCode = Number(useTypedSelector((state: RootState) => state.controller.state.status?.alarmCode));

    useEffect(() => {
        if (clickedRehome && hasHomed) {
            setRehomed(true)
            onComplete(); // onComplete when we have clicked and rehoming is done
        }
    }, [hasHomed, clickedRehome]);

    useEffect(() => {
        if (activeState === GRBL_ACTIVE_STATE_ALARM && alarmCode === 9) {
            setError(t('Homing failed.'));
            setTimeout(() => {
                setError(null);
            }, 2500)
        }
    }, [activeState, alarmCode]);

    const handleRehome = () => {
        setClickedRehome(true);
        controller.command('homing');
    };

    const canRehome = isConnected;

    return (
        <div className="flex flex-col gap-5 justify-start">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('Rehome')}
            </label>
            <p className="dark:text-white">
                {t(
                    'Homing movements have been updated and require the machine to be rehomed.',
                )}
            </p>
            <p className="dark:text-white">
                {t('Select')} <b>"{t('Re-home')}"</b> {t('to continue.')}
            </p>

            <StepActionButton
                label={t('Re-home')}
                runningLabel={t('Homing...')}
                onApply={handleRehome}
                isComplete={rehomed}
                error={error}
                disabled={!canRehome}
            />
        </div>
    );
}
