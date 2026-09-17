import { t } from 'app/i18n';
import type { ATCUnavailablePayload } from '../definitions';

export const getATCUnavailablePayload = ({
    isConnected,
    isATCAvailable,
    isHomed,
}: {
    isConnected: boolean;
    isATCAvailable: boolean;
    isHomed: boolean;
}): ATCUnavailablePayload => {
    if (!isConnected) {
        return {
            reason: 'machine_not_connected',
            title: t('Machine Not Connected'),
            message: t(
                'You must be connected to a device with ATC support to use this feature.',
            ),
        };
    }
    if (!isATCAvailable) {
        return {
            reason: 'firmware_not_compiled',
            title: t('No ATC Flag'),
            message: t('Firmware did not report ATC=1 on startup.'),
            additionalInfo: t(
                'Ensure the SD card is installed and mounted correctly, a TC.macro file exists, and the firmware has ATC support compiled in.',
            ),
        };
    }
    /*if (!isHomed) {
        return {
            reason: 'machine_not_homed',
            title: 'Machine Not Homed',
            message: 'You must home the machine before using ATC.',
        };
    }*/

    return null;
};
