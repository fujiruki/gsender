import { Switch } from 'app/components/shadcn/Switch';
import { useSettings } from 'app/features/Config/utils/SettingsContext.tsx';
import { t } from 'app/i18n';

export function FilterDefaultToggle() {
    const { filterNonDefault, toggleFilterNonDefault } = useSettings();

    return (
        <div className="ml-8 flex flex-row gap-4 items-center max-xl:text-xs flex-grow max-sm:ml-0">
            <p className="text-gray-500 max-xl:hidden">{t('View Modified')}</p>
            <p className="text-gray-500 hidden max-xl:block">{t('Modified')}</p>
            <Switch
                onChange={toggleFilterNonDefault}
                checked={filterNonDefault}
                aria-label="View only modified settings"
            />
        </div>
    );
}
