import { Jogging } from 'app/features/Jogging';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from 'app/components/shadcn/Popover';
import Button from 'app/components/Button';
import { t } from 'app/i18n';

const ShowJogControls = () => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">{t('Show Jog Controls')}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 bg-white">
                <div className="w-full">
                    <Jogging />
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ShowJogControls;
