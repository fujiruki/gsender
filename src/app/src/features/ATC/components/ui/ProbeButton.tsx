import { Button } from 'app/components/Button/';
import cn from 'classnames';
import { t } from 'app/i18n';
import { Settings } from 'lucide-react';

export const ProbeButton = ({
    onProbe,
    className,
}: {
    onProbe?: () => void;
    className?: string;
}) => {
    return (
        <Button
            variant="primary"
            size="sm"
            className={cn('w-[100px] justify-center gap-2 px-2', className)}
            onClick={onProbe}
        >
            <Settings size={14} />
            {t('Probe Tool')}
        </Button>
    );
};
