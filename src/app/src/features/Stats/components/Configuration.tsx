import type { MachineProfile } from 'app/definitions/firmware';
import { truncatePort } from 'app/features/Stats/utils/statUtils.ts';
import { t } from 'app/i18n';
import { homingString } from 'app/lib/eeprom.ts';
import { isIPv4 } from 'app/lib/utils';
import store from 'app/store';
import type { RootState } from 'app/store/redux';
import get from 'lodash/get';
import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';

export function ConfigRow({
    label,
    children,
    connected = false,
}: {
    label: string;
    children: ReactNode;
    connected: boolean;
}) {
    return (
        <div className="relative flex flex-row justify-between w-full items-center leading-7 border-dotted border-b-gray-300 border-b-2 overflow-visible h-[3px] mt-3 mb-3 dark:text-content-primary dark:bg-surface-raised">
            <div className="text-gray-700 bg-white pr-2 dark:text-content-primary dark:bg-surface-raised">
                {label}
            </div>
            <div className="pl-2 bg-white dark:text-content-primary dark:bg-surface-raised">
                {connected ? children : <b>-</b>}
            </div>
        </div>
    );
}

export function Configuration() {
    const machineProfile: MachineProfile = store.get(
        'workspace.machineProfile',
        {},
    );
    const baudrate = useSelector(
        (state: RootState) => state.connection.baudrate,
    );
    const connectionPort = useSelector(
        (state: RootState) => state.connection.port,
    );
    const connected = useSelector(
        (state: RootState) => state.connection.isConnected,
    );

    const controllerState = useSelector(
        (state: RootState) => state.controller.state,
    ); // axes.axes
    const axesList = get(controllerState, 'axes.axes', ['X', 'Y', 'Z']);

    // 20, 13, 23
    const settings = useSelector(
        (state: RootState) => state.controller.settings.settings,
    );

    const { $20, $13, $22, $23 } = settings;

    const reportInchesString = $13 === '1' ? t('Enabled') : t('Disabled');
    const softLimitsString = $20 === '1' ? t('Enabled') : t('Disabled');
    const homingEnabledString = Number($22) > 0 ? t('Enabled') : t('Disabled');

    const looksLikeIP = isIPv4(connectionPort);

    return (
        <div className="flex flex-col gap-1">
            <div className="font-bold mb-2 dark:text-content-primary">
                {machineProfile.company + ' ' + machineProfile.name + ' '}
                <span className="font-normal">{machineProfile.type}</span>
            </div>
            <ConfigRow connected={connected} label={t('Connection')}>
                {looksLikeIP ? (
                    <b>{connectionPort}</b>
                ) : (
                    <span>
                        <b>{truncatePort(connectionPort)}</b>{' '}
                        {t('at {{baudrate}} baud', { baudrate })}
                    </span>
                )}
            </ConfigRow>
            <ConfigRow connected={connected} label={t('Axes')}>
                <b>{axesList.join(', ')}</b>
            </ConfigRow>
            <ConfigRow connected={connected} label={t('Soft limits')}>
                <b>{softLimitsString}</b>
            </ConfigRow>
            <ConfigRow connected={connected} label={t('Homing')}>
                <b>{homingEnabledString}</b>
            </ConfigRow>
            <ConfigRow connected={connected} label={t('Home location')}>
                <b>{homingString($23)}</b>
            </ConfigRow>
            <ConfigRow connected={connected} label={t('Report inches')}>
                <b>{reportInchesString}</b>
            </ConfigRow>
        </div>
    );
}
