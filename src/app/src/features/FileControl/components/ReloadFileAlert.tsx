import { Button } from 'app/components/Button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from 'app/components/shadcn/AlertDialog.tsx';
import { Tooltip } from 'app/components/Tooltip';
import { FaRedo } from 'react-icons/fa';
import { t } from 'app/i18n';

type ReloadFileAlertProps = {
    fileLoaded: boolean;
    handleFileReload: () => void;
};

export function ReloadFileAlert({
    fileLoaded,
    handleFileReload,
}: ReloadFileAlertProps) {
    return (
        <AlertDialog>
            <Tooltip content={t('Reload File')}>
                <AlertDialogTrigger asChild>
                    <Button
                        disabled={!fileLoaded}
                        icon={
                            <FaRedo className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                        }
                        variant="ghost"
                        className="h-full rounded-none"
                        aria-label={t('Reload File')}
                    />
                </AlertDialogTrigger>
            </Tooltip>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('Are you sure?')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('This will reload the current file from disk.')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFileReload}>
                        {t('Reload File')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
