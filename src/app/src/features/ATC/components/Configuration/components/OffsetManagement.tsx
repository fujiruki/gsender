import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'app/components/shadcn/Select';
import { t } from 'app/i18n';
import { useState } from 'react';

interface OffsetManagementWidgetProps {
    value?: number;
    onChange?: (value: number) => void;
    defaultValue?: number;
    disabled?: boolean;
}

export default function OffsetManagementWidget({
    value = 0,
    onChange,
    defaultValue = 0,
    disabled = false,
}: OffsetManagementWidgetProps) {
    const [internalValue, setInternalValue] = useState(value);

    const currentValue = onChange ? value : internalValue;
    const isDefault = currentValue === defaultValue;

    const handleOffsetModeChange = (nextValue: string) => {
        const parsedValue = parseInt(nextValue, 10) || 0;
        if (onChange) {
            onChange(parsedValue);
        } else {
            setInternalValue(parsedValue);
        }
    };

    return (
        <div className="w-72">
            <div
                className={`transition-colors ${
                    isDefault ? '' : 'bg-yellow-50 dark:bg-yellow-900/20'
                }`}
            >
                <Select
                    value={String(currentValue)}
                    onValueChange={handleOffsetModeChange}
                    disabled={disabled}
                >
                    <SelectTrigger
                        className="h-8 text-xs dark:border-outline dark:bg-surface-sunken dark:text-content-primary"
                        disabled={disabled}
                    >
                        <SelectValue placeholder={t('Select mode')} />
                    </SelectTrigger>
                    <SelectContent className="z-[10001] bg-white dark:bg-surface-elevated dark:text-content-primary">
                        <SelectItem value="0">
                            {t('Probe new offset after loading')}
                        </SelectItem>
                        <SelectItem value="1">
                            {t('Use Tool Table without verification')}
                        </SelectItem>
                        <SelectItem value="2">
                            {t('Use Tool Table and probe to verify')}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
