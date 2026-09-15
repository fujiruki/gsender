import { useMemo } from 'react';
import { useTypedSelector } from 'app/hooks/useTypedSelector.ts';
import { RootState } from 'app/store/redux';
import { firmwareSemver } from 'app/lib/firmwareSemver.ts';
import { ATCI_SUPPORTED_VERSION } from 'app/features/ATC/utils/ATCiConstants.ts';
import {GRBL, GRBLHAL} from "app/constants";
import { t } from 'app/i18n';

export function useValidations() {
    const isConnected = useTypedSelector(
        (state: RootState) => state.connection.isConnected,
    );
    const hasHomed = useTypedSelector(
        (state: RootState) => state.controller.hasHomed,
    );
    const reportedFirmwareSemver = useTypedSelector(
        (state: RootState) => state.controller.settings.version?.semver,
    );

    const currentFirmware = firmwareSemver(
        Number(reportedFirmwareSemver) || 0,
        ATCI_SUPPORTED_VERSION,
    );

    const firmwareType = useTypedSelector((state: RootState) => state.controller.type);

    const connectionValidation = useMemo(
        () => () => ({
            success: isConnected,
            reason: t(
                'Your controller is not connected.  Connect to your CNC to configure this accessory.',
            ),
        }),
        [isConnected],
    );
    const homingValidation = useMemo(
        () => () => ({
            success: hasHomed,
            reason: t(
                'Machine not homed. Please home your machine before proceeding with accessory configuration.',
            ),
        }),
        [hasHomed],
    );
    const coreFirmwareValidation = useMemo(
        () => () => ({
            success: currentFirmware,
            reason: <p>{t('This setup wizard requires a newer firmware version, please update your firmware before proceeding.')} <a target="_blank" className="text-blue-500 underline" href="https://resources.sienci.com/view/slb-firmware-flashing/">{t('Learn More')}</a></p>,
        }),
        [currentFirmware],
    );

    const grblHAlValidator = useMemo(
        () => () => ({
            success: firmwareType === GRBLHAL,
            reason: t(
                'You must be connected to a grblHAL device to use this wizard.',
            ),
        }),
        [firmwareType],
    );

    const grblValidator = useMemo(
        () => () => ({
            success: firmwareType === GRBL,
            reason: t(
                'You must be connected to a grbl device to use this wizard.',
            ),
        }),
        [firmwareType],
    );

    return {
        connectionValidation,
        homingValidation,
        coreFirmwareValidation,
        grblHAlValidator,
        grblValidator
    };
}
