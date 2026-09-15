import { useState } from 'react';

import { store as reduxStore } from 'app/store/redux';
import Button from 'app/components/Button';
import controller from 'app/lib/controller';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogTrigger,
} from 'app/components/shadcn/AlertDialog';

import { useSquaring } from '../context/SquaringContext';
import {
    calculateHypotenuse,
    calculateAngle,
    determineEEPROMAdjustment,
} from '../utils';
import { toast } from 'app/lib/toaster';
import { METRIC_UNITS } from 'app/constants';
import store from 'app/store';
import { useWorkspaceState } from 'app/hooks/useWorkspaceState';
import { t } from 'app/i18n';

const FM_LOWER_OFFSET_THRESHOLD =
    store.get('workspace.units', METRIC_UNITS) === METRIC_UNITS ? 2 : 0.079;

const ResultsStep = () => {
    const { triangle, jogValues } = useSquaring();
    const [isUpdating, setIsUpdating] = useState(false);
    const { units } = useWorkspaceState();

    const calculatedHypotenuse = calculateHypotenuse(triangle);
    const hypotenuseDiff = Math.abs(calculatedHypotenuse - triangle.c).toFixed(
        2,
    );
    const angle = calculateAngle(triangle);
    const isSquare = Math.abs(angle) < 0.1; // Less than 0.1 degree deviation
    const isWithinEEPROMThreshold =
        Number(hypotenuseDiff) <= FM_LOWER_OFFSET_THRESHOLD;

    const eepromAdjustment = determineEEPROMAdjustment(triangle, jogValues);
    const needsEEPROMAdjustment =
        eepromAdjustment.x.needsAdjustment ||
        eepromAdjustment.y.needsAdjustment;
    const { settings } = reduxStore.getState().controller.settings;
    const currentXSteps = Number(settings.$100);
    const currentYSteps = Number(settings.$101);

    const handleUpdateEEPROM = async () => {
        setIsUpdating(true);
        try {
            const $100 = eepromAdjustment.x.amount.toFixed(3);
            const $101 = eepromAdjustment.y.amount.toFixed(3);

            controller.command('gcode', [`$100=${$100}`, `$101=${$101}`, '$$']);

            toast.info(t('Updated EEPROM values'), { position: 'bottom-right' });
        } catch (error) {
            console.error('Failed to update EEPROM:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const renderResult = () => {
        // Machine is square if angle deviation is less than 0.1 degrees
        if (isSquare) {
            return (
                <div className="text-green-950 bg-green-100 p-4 rounded-lg space-y-2">
                    <p className="font-bold text-lg">
                        {t('Your machine is properly squared!')}
                    </p>
                    <p className="text-sm">{t('No adjustments are needed.')}</p>
                </div>
            );
        }

        // Tolerable if hypotenuse difference is less than 2mm
        if (isWithinEEPROMThreshold) {
            return (
                <div className="text-yellow-800 bg-yellow-100 p-4 rounded-lg space-y-2 dark:bg-yellow-900 dark:text-white">
                    <p className="font-bold text-lg">
                        {t('Your machine is slightly out of square')}
                    </p>
                    <p>
                        {t(
                            'The deviation is minor ({{diff}}{{units}}) but you may want to adjust the right Y-axis rail to achieve better squareness.',
                            { diff: hypotenuseDiff, units },
                        )}
                    </p>

                    <p>
                        {t(
                            'You can move your either the right y-axis rail forward by {{diff}}{{units}} or the left y-axis rail backward by {{diff}}{{units}}.',
                            { diff: hypotenuseDiff, units },
                        )}
                    </p>
                </div>
            );
        }

        // Noticeably out of square
        return (
            <div className="text-red-950 bg-red-100 p-4 rounded-lg space-y-2 dark:bg-red-950 dark:text-white">
                <p className="font-bold text-lg">
                    {t('Your machine needs adjustment')}
                </p>
                <p>
                    {t('The machine is off by {{angle}}° or', {
                        angle: angle.toFixed(2),
                    })}{' '}
                    <strong>
                        {hypotenuseDiff}
                        {units}
                    </strong>{' '}
                    {t('on the diagonal.')}
                </p>
                <p>
                    {t(
                        'You can move your either the right y-axis rail forward by',
                    )}{' '}
                    <strong>
                        {hypotenuseDiff}
                        {units}
                    </strong>{' '}
                    {t('or the left y-axis rail backward by')}{' '}
                    <strong>
                        {hypotenuseDiff}
                        {units}
                    </strong>
                    .
                </p>
            </div>
        );
    };

    return (
        <div className="max-w-7xl w-full grid">
            <div className="flex flex-col gap-4">
                <div className="flex flex-row items-start gap-4">
                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold dark:text-white">
                            {t('Results')}
                        </h3>
                        {renderResult()}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-lg font-semibold dark:text-white">
                            {t('Measured Dimensions')}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-gray-50 rounded-lg dark:bg-dark dark:text-white">
                                <div className="text-sm text-gray-600 dark:text-white">
                                    {t('Bottom Edge (1-2)')}
                                </div>
                                <div className="text-xl font-bold">
                                    {triangle.a}
                                    {units}
                                </div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg dark:bg-dark dark:text-white">
                                <div className="text-sm text-gray-600 dark:text-white">
                                    {t('Right Edge (2-3)')}
                                </div>
                                <div className="text-xl font-bold">
                                    {triangle.b}
                                    {units}
                                </div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg dark:bg-dark dark:text-white">
                                <div className="text-sm text-gray-600 dark:text-white">
                                    {t('Diagonal (1-3)')}
                                </div>
                                <div className="text-xl font-bold">
                                    {triangle.c}
                                    {units}
                                </div>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg dark:bg-dark dark:text-white">
                                <div className="text-sm text-gray-600 dark:text-white">
                                    {t('Angle Deviation')}
                                </div>
                                <div className="text-xl font-bold">
                                    {angle.toFixed(2)}°
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {needsEEPROMAdjustment && (
                    <div className="flex flex-col justify-center items-start space-y-1">
                        <h3 className="text-lg font-semibold dark:text-white">
                            {t('Other Recommendations')}
                        </h3>
                        <div className="space-y-1 text-yellow-800 bg-yellow-100 p-4 rounded-lg border min-h-52 flex flex-col justify-center items-start space-y-1 dark:bg-yellow-950 dark:text-white dark:border-yellow-950">
                            <p>
                                {t(
                                    'We also noticed from the results that your motor movement settings could be updated to improve your machines accuracy.',
                                )}
                            </p>
                            {/* <div className="grid grid-cols-2 gap-4"> */}
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="p-2 bg-gray-50 rounded-lg dark:bg-dark">
                                    <div className="text-sm text-gray-600 dark:text-white">
                                        {t('X-axis step/mm')}
                                    </div>
                                    <div className="text-xl font-bold">
                                        {t('Current: {{value}}', {
                                            value: currentXSteps,
                                        })}
                                    </div>
                                    <div className="text-xl font-bold text-blue-600">
                                        {t('Recommended: {{value}}', {
                                            value: eepromAdjustment.x.amount.toFixed(
                                                3,
                                            ),
                                        })}
                                    </div>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg dark:bg-dark">
                                    <div className="text-sm text-gray-600 dark:text-white">
                                        {t('Y-axis step/mm')}
                                    </div>
                                    <div className="text-xl font-bold">
                                        {t('Current: {{value}}', {
                                            value: currentYSteps,
                                        })}
                                    </div>
                                    <div className="text-xl font-bold text-blue-600">
                                        {t('Recommended: {{value}}', {
                                            value: eepromAdjustment.y.amount.toFixed(
                                                3,
                                            ),
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row gap-4">
                                <div className="mt-1 xl:mt-4">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button disabled={isUpdating}>
                                                {isUpdating
                                                    ? t('Updating...')
                                                    : t('Update step/mm')}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-white">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    {t('Update Firmware')}
                                                </AlertDialogTitle>
                                                <div className="space-y-4">
                                                    <p>
                                                        {t(
                                                            'This will update the X-axis ($100) and Y-axis ($101) step/mm values in your CNC firmware to the new ones below:',
                                                        )}
                                                    </p>
                                                    <p>
                                                        {t('X-axis:')}{' '}
                                                        <strong>
                                                            {eepromAdjustment.x.amount.toFixed(
                                                                3,
                                                            )}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        {t('Y-axis:')}{' '}
                                                        <strong>
                                                            {eepromAdjustment.y.amount.toFixed(
                                                                3,
                                                            )}
                                                        </strong>
                                                    </p>
                                                </div>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    {t('Cancel')}
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="border border-blue-500"
                                                    onClick={handleUpdateEEPROM}
                                                >
                                                    {t('Update Firmware')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                <div className="mt-1 xl:mt-4 text-sm text-yellow-600 dark:text-yellow-400">
                                    <p className="font-bold">{t('Warning')}</p>
                                    <p>
                                        {t(
                                            "Updating Firmware values can affect your machine's accuracy. Make sure to verify the new settings after applying them.",
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    // </div>
                )}
            </div>
        </div>
    );
};

export default ResultsStep;
