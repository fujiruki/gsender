import { PiMaskHappyBold } from 'react-icons/pi';
import { t } from 'app/i18n';

export function EmptyAlarmList() {
    return (
        <div className="w-full min-h-40 items-center justify-center flex flex-col gap-2">
            <span className="text-4xl text-gray-600 animate-attention dark:text-white">
                <PiMaskHappyBold />
            </span>
            <p className="text-gray-600 dark:text-white">
                {t('No Alarms or Errors recorded. Hooray!')}
            </p>
        </div>
    );
}
