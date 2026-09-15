import { Confirm } from 'app/components/ConfirmationDialog/ConfirmationDialogLib';
import { useWizardAPI } from 'app/features/Helper/context';
import { t } from 'app/i18n';
import { X } from 'lucide-react';
import React from 'react';

const CancelButton = () => {
    const { cancelToolchange } = useWizardAPI();

    const handleCancel = () => {
        Confirm({
            title: t('Cancel Toolchange Wizard'),
            content: t(
                'Are you sure you want to cancel the toolchange wizard? All steps will be lost.',
            ),
            confirmLabel: t('Yes'),
            onConfirm: () => {
                cancelToolchange();
            },
        });
    };

    return (
        <button
            type="button"
            onClick={handleCancel}
            aria-label={t('Cancel wizard')}
            className="flex items-center justify-center w-7 h-7 rounded border border-gray-300 dark:border-[#3a3a48] bg-transparent text-gray-500 dark:text-content-muted hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
            <X size={12} />
        </button>
    );
};

export default CancelButton;
