import { useParams } from 'react-router';
import { WizardsManager } from 'app/features/AccessoryInstaller/components/wizard';
import { useAllWizards } from 'app/features/AccessoryInstaller/Wizards';
import { t } from 'app/i18n';

export function AccessoryInstaller() {
    const wizards = useAllWizards();
    const { wizardId, subWizardId } = useParams<{ wizardId?: string; subWizardId?: string }>();
    return (
        <div className="fixed-content-area h-full max-h-full w-full overflow-hidden">
            <WizardsManager
                wizards={wizards}
                initialWizardId={wizardId}
                initialSubWizardId={subWizardId}
                hubTitle={t('Accessory Installation')}
                hubDescription={t(
                    'Select a wizard to configure and install your CNC accessories. Each wizard will guide you through the setup process step by step.',
                )}
            />
        </div>
    );
}
