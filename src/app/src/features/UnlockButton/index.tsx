import Tooltip from 'app/components/Tooltip';
import { Confirm } from 'app/components/ConfirmationDialog/ConfirmationDialogLib';
import { GRBL_ACTIVE_STATE_ALARM, GRBL_ACTIVE_STATE_HOLD } from 'app/constants';
import type { GRBL_ACTIVE_STATES_T } from 'app/definitions/general';
import { useTypedSelector } from 'app/hooks/useTypedSelector';
import controller from 'app/lib/controller';
import { t } from 'app/i18n';
import type { RootState } from 'app/store/redux';
import cx from 'classnames';
import get from 'lodash/get';
import { IoLockClosedOutline, IoLockOpenOutline } from 'react-icons/io5';

// ALARM:6-9 all mean the homing cycle itself failed (GRBL_ALARMS in
// src/server/controllers/Grbl/constants.js). Unlocking ($X) without
// re-homing lets jogging continue with an unknown machine position, which
// caused a real limit-switch crash. See docs/spec/02_機能仕様.md F-05.
const HOMING_FAILURE_ALARM_CODES = [6, 7, 8, 9];

export function isHomingFailureAlarm(code: string | number): boolean {
    return HOMING_FAILURE_ALARM_CODES.includes(code as number);
}

export function confirmUnlockAfterHomingFailure(
    code: string | number,
    onUnlock: () => void,
) {
    if (!isHomingFailureAlarm(code)) {
        onUnlock();
        return;
    }
    Confirm({
        title: t('Homing Not Complete'),
        content: t(
            'The last homing cycle failed, so the machine position is unknown. Continuing without re-homing may let jogging or a job run past the limit switches. Unlock anyway?',
        ),
        confirmLabel: t('Unlock Anyway'),
        cancelLabel: t('Cancel'),
        onConfirm: onUnlock,
    });
}

export function unlockFirmware(
    state: GRBL_ACTIVE_STATES_T,
    code: string | number,
) {
    if (state === GRBL_ACTIVE_STATE_ALARM) {
        if (code === 17 || code === 10) {
            controller.command('reset:limit');
        } else {
            confirmUnlockAfterHomingFailure(code, () =>
                controller.command('unlock'),
            );
        }

        if (code === 11 || code === 'Homing') {
            controller.command('populateConfig');
        }
        return;
    }
    controller.command('cyclestart');
}

export function UnlockButton() {
    const status = useTypedSelector(
        (state: RootState) => state.controller.state.status,
    );
    const activeState = get(status, 'activeState', 'Idle');
    const alarmCode = get(status, 'alarmCode', 0);

    const isHold = activeState === GRBL_ACTIVE_STATE_HOLD;
    const isAlarm = activeState === GRBL_ACTIVE_STATE_ALARM;
    const activateUnlockButton = isHold || isAlarm;

    const ariaLabel = activateUnlockButton
        ? t('Machine is {{state}}. Click to unlock machine.', {
              state: isAlarm ? t('locked in alarm') : t('held'),
          })
        : t('Machine is unlocked.');

    return (
        <div className="text-4xl absolute top-3 max-xl:top-2 left-72 max-sm:left-56">
            <Tooltip content={t('Unlock Machine')}>
                <button
                    className={cx('group text-gray-400', {
                        'text-yellow-600 bg-orange-200 bg-opacity-10 rounded':
                            activateUnlockButton,
                    })}
                    onClick={() => unlockFirmware(activeState, alarmCode)}
                    aria-label={ariaLabel}
                    role="button"
                >
                    <IoLockOpenOutline
                        className={cx('hidden group-hover:block', {
                            'animate-pulse': activateUnlockButton,
                        })}
                    />
                    <IoLockClosedOutline
                        className={cx('group-hover:hidden', {
                            'animate-pulse': activateUnlockButton,
                        })}
                    />
                </button>
            </Tooltip>
        </div>
    );
}
