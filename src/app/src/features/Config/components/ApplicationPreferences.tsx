import { useRef } from 'react';
import { PiDownloadSimple, PiUploadSimple } from 'react-icons/pi';
import { GrPowerReset } from 'react-icons/gr';
import {
    exportSettings,
    handleRestoreDefaultClick,
    importSettings,
} from 'app/features/Config/utils/Settings.ts';
import { ActionButton } from 'app/features/Config/components/ActionButton.tsx';
import { t } from 'app/i18n';

export function ApplicationPreferences() {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <fieldset className="max-sm:hidden flex flex-row gap-x-2 mr-4 mb-1 border rounded border-gray-200 px-4 pb-2 dark:border-gray-700 dark:text-white">
            <legend className="text-slate-600 dark:text-white">
                {t('gSender Preferences')}
            </legend>
            <div className="-mx-4 grid grid-cols-3 divide-x">
                <ActionButton
                    label={t('Reset')}
                    icon={<GrPowerReset />}
                    onClick={handleRestoreDefaultClick}
                    testId="gsender-settings-reset-button"
                />
                <ActionButton
                    label={t('Import')}
                    icon={<PiDownloadSimple />}
                    onClick={() => {
                        inputRef.current.click();
                    }}
                    testId="gsender-settings-import-button"
                />
                <ActionButton
                    label={t('Export')}
                    icon={<PiUploadSimple />}
                    onClick={exportSettings}
                    testId="gsender-settings-export-button"
                />
                <input
                    type="file"
                    onChange={importSettings}
                    onClick={(e) => {
                        (e.target as HTMLInputElement).value = '';
                    }}
                    accept=".json"
                    className="hidden"
                    ref={inputRef}
                />
            </div>
        </fieldset>
    );
}
