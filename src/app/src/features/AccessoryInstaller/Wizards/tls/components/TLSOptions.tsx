import { StepActionButton } from 'app/components/Wizard/StepActionButton.tsx';
import { StepProps } from 'app/components/Wizard/types';
import { ATCI_SUPPORTED_VERSION } from 'app/features/ATC/utils/ATCiConstants.ts';
import { updateToolchangeContext } from 'app/features/Helper/Wizard.tsx';
import controller from 'app/lib/controller.ts';
import { firmwarePastVersion } from 'app/lib/firmwareSemver.ts';
import store from 'app/store';
import { RootState } from 'app/store/redux';
import { FirstToolBehavior } from 'app/workspace/definitions';
import get from 'lodash/get';
import pubsub from 'pubsub-js';
import { t } from 'app/i18n';
import { useState } from 'react';
import { useSelector } from 'react-redux';

const FIRST_TOOL_BEHAVIOUR_OPTIONS: FirstToolBehavior[] = [
    'Always run full wizard',
    'Prompt for first tool',
    'Always probe length only',
];

function getFirstToolBehaviourExplanation(
    behaviour: FirstToolBehavior,
): string {
    return {
        'Always run full wizard': t(
            'Runs the complete tool change process every time, including for the first tool.',
        ),
        'Prompt for first tool': t(
            'Asks whether to run the full wizard or just probe the current tool length for the first tool change.',
        ),
        'Always probe length only': t(
            'Skips the tool change prompt and only measures the current tool for the first tool change.',
        ),
    }[behaviour];
}

export function TLSOptions({ onComplete, onUncomplete }: StepProps) {
    const [error, setError] = useState<string>('');
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [success, setSuccess] = useState<string | null>(null);

    const [customLocation, setCustomLocation] = useState<boolean>(true);
    const [firstToolBehaviour, setFirstToolBehaviour] =
        useState<FirstToolBehavior>('Prompt for first tool');

    const boardId = useSelector(
        (state: RootState) => state.controller.settings.info?.BOARD,
    );
    const eepromSettings = useSelector(
        (state: RootState) => state.controller.settings.settings,
    );

    const applySettings = async () => {
        const code = ['$6=1'];
        if (!firmwarePastVersion(ATCI_SUPPORTED_VERSION)) {
            code.push('$668=0');
        }
        if (boardId === 'SLB Lite') {
            const current = Number(get(eepromSettings, '$65', 0)) || 0;
            const updated = current | 8;
            if (updated !== current) {
                code.push(`$65=${updated}`);
            }
            code.push('G65 P5 Q1');
        }
        code.push('$$');
        controller.command('gcode', code);

        store.set('workspace.toolChangeOption', 'Fixed Tool Sensor');
        store.set('workspace.toolChange.moveToManualPosition', customLocation);
        store.set(
            'workspace.toolChange.firstToolBehaviour',
            firstToolBehaviour,
        );
        store.set('workspace.toolChange.passthrough', false);
        store.set('widgets.probe.probeFastFeedrate', 1000);
        updateToolchangeContext();
        pubsub.publish('repopulate');
        setSuccess(t('Tool change options configured.'));
        setIsComplete(true);
        onComplete();
    };

    return (
        <div className="flex flex-col gap-5 justify-start">
            <p className="dark:text-content-primary">
                {t(
                    'Configure how gSender should handle tool changes with your Tool Length Sensor (TLS).',
                )}
            </p>

            <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-content-primary mb-2">
                    {t('First tool behaviour')}
                </label>
                <select
                    value={firstToolBehaviour}
                    onChange={(e) =>
                        setFirstToolBehaviour(
                            e.target.value as FirstToolBehavior,
                        )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    {FIRST_TOOL_BEHAVIOUR_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {t(option)}
                        </option>
                    ))}
                </select>
                <p className="text-sm text-gray-600 dark:text-content-secondary mt-2">
                    {getFirstToolBehaviourExplanation(firstToolBehaviour)}
                </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={customLocation}
                    onChange={(e) => setCustomLocation(e.target.checked)}
                    className="w-6 h-6 mt-0.5 shrink-0 rounded-md border-2 border-gray-300 accent-blue-500 cursor-pointer transition-colors hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <span>
                    <span className="block text-lg font-semibold text-gray-900 dark:text-content-primary">
                        {t('Set manual tool change location')}
                    </span>
                    <span className="block text-sm text-gray-600 dark:text-content-secondary">
                        {t(
                            'Move the CNC to a more convenient location for manual tool changes instead of prompting to change over the sensor.',
                        )}
                    </span>
                </span>
            </label>

            <p className="dark:text-content-primary">
                {t('Select')} <b>"{t('Apply')}"</b>{' '}
                {t(
                    'to set your tool change strategy to Fixed Tool Sensor and save these options.',
                )}
            </p>
            <StepActionButton
                label={t('Apply')}
                runningLabel={t('Applying...')}
                onApply={applySettings}
                isComplete={isComplete}
                error={error}
                success={success}
            />
        </div>
    );
}
