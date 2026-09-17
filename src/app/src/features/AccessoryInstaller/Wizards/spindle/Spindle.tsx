import { useValidations } from 'app/components/Wizard/hooks/UseValidations.tsx';
import type { Wizard } from 'app/components/Wizard/types';
import SpindlePlaceholder from 'app/features/AccessoryInstaller/Wizards/spindle/assets/spindle_image.png';
import { SpindleCompletion } from 'app/features/AccessoryInstaller/Wizards/spindle/components/Completion.tsx';
import { ModbusConfig } from 'app/features/AccessoryInstaller/Wizards/spindle/components/ModbusConfig.tsx';
import { SpindleConfig } from 'app/features/AccessoryInstaller/Wizards/spindle/components/SpindleConfig.tsx';
import { SpindleGcodePreview } from 'app/features/AccessoryInstaller/Wizards/spindle/components/SpindleGcodePreview.tsx';
import { t } from 'app/i18n';
import { useMemo } from 'react';

export function useSienciSpindle() {
    const { connectionValidation, grblHAlValidator } = useValidations();

    const validations = useMemo(
        () => [connectionValidation, grblHAlValidator],
        [connectionValidation, grblHAlValidator],
    );
    return useMemo<Wizard>(
        () => ({
            id: 'sienci-spindle',
            title: t('Sienci Spindle'),
            image: SpindlePlaceholder,
            validations: [...validations],
            subWizards: [
                {
                    id: 'spindle-config',
                    title: t('Sienci Spindle Config'),
                    description: t(
                        'Configure your Sienci Spindle for first time use',
                    ),
                    estimatedTime: t('5 - 30 minutes'),
                    configVersion: '1.0',
                    completionPage: SpindleCompletion,
                    steps: [
                        {
                            id: 'spindle-config',
                            title: t('Spindle Config'),
                            component: SpindleConfig,
                            secondaryContent: [
                                {
                                    type: 'component',
                                    content: SpindleGcodePreview,
                                    title: t('Commands to be sent'),
                                    fill: true,
                                },
                            ],
                        },
                        {
                            id: 'modbus-config',
                            title: t('Modbus Configuration'),
                            component: ModbusConfig,
                            secondaryContent: [],
                        },
                    ],
                },
            ],
        }),
        [validations],
    );
}
