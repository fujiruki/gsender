import { StepActionButton } from 'app/components/Wizard/StepActionButton.tsx';
import type { StepProps } from 'app/components/Wizard/types';
import controller from 'app/lib/controller.ts';
import store from 'app/store';
import { t } from 'app/i18n';
import { useState } from 'react';

export function ControllerConfiguration({ onComplete }: StepProps) {
    const [error, _setError] = useState<string>('');
    const [isComplete, setIsComplete] = useState<boolean>(false);

    const applySettings = async () => {
        // Also setup gSender settings :)
        // Enable ATCI tab, enable spindle tab, set TC strategy to ignore
        store.set('workspace.atcEnabled', true);
        store.set('workspace.toolChangeOption', 'Ignore');
        store.set('workspace.spindleFunctions', true);
        store.set('workspace.toolChange.passthrough', true);
        // Use macro for controller settings
        controller.command('gcode', 'G65 P999');
        setTimeout(() => {
            setIsComplete(true);
            onComplete();
        }, 2000);
    };

    return (
        <div className="flex flex-col gap-5 justify-start">
            <p className="dark:text-content-primary">
                {t(
                    'The following controller settings are being updated to ensure compatibility with the ATC.',
                )}
            </p>
            <ul
                className="list-disc list-inside text-gray-900 dark:text-content-primary"
                style={{ fontSize: '1.1rem' }}
            >
                <li>{t('Homing direction')}</li>
                <li>{t('Tool number persistence')}</li>
                <li>{t('Input and output pin settings')}</li>
                <li>{t('Startup g-code')}</li>
            </ul>

            <p className="dark:text-content-primary">
                {t('Select')} <b>“{t('Apply')}”</b> {t('to apply these changes.')}
            </p>
            <StepActionButton
                label={t('Apply')}
                runningLabel={t('Applying...')}
                onApply={applySettings}
                isComplete={isComplete}
                error={error}
                data-testid="atc-apply-controller-config"
            />
        </div>
    );
}
