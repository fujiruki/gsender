import { Confirm } from 'app/components/ConfirmationDialog/ConfirmationDialogLib.ts';
import { t } from 'app/i18n';
import cx from 'classnames';
import pubsub from 'pubsub-js';
import { FaTasks } from 'react-icons/fa';
import { IoSpeedometerOutline } from 'react-icons/io5';
import { RiToolsFill } from 'react-icons/ri';
import { useLocation, useNavigate } from 'react-router';
import { useSettings } from '../Config/utils/SettingsContext.tsx';
import Carve from './assets/Carve.svg';
import Blocker from './components/Blocker.tsx';
import { NavbarLink } from './components/NavbarLink.tsx';

export const NavBar = () => {
    const { settingsAreDirty, setSettingsAreDirty } = useSettings();
    const location = useLocation();
    const navigate = useNavigate();
    const blocker = new Blocker();

    const proceed = () => {
        blocker.proceed();
    };

    const reset = () => {
        blocker.reset();
    };

    const checkIfNeedsBlock = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
        href: string,
    ) => {
        e.preventDefault();
        if (location.pathname.includes('configuration') && settingsAreDirty) {
            blocker.block(() => {
                pubsub.publish('repopulate');
                pubsub.publish('eeprom:repopulate');
                setSettingsAreDirty(false);
                navigate(href);
            });
            Confirm({
                title: t('Unsaved Changes'),
                content: t('Are you sure you want to leave without saving?'),
                onClose: reset,
                onConfirm: proceed,
                confirmLabel: t('Yes'),
                cancelLabel: t('No'),
            });
        } else {
            navigate(href);
        }
    };
    return (
        <>
            <div
                className={cx(
                    'grid [grid-template-rows:minmax(0,30%)_auto_auto] gap-0 justify-end flex-grow self-stretch',
                )}
            >
                <div className="py-5 border-gray-400 border-r-2 dark:border-outline"></div>
                <NavbarLink
                    href="/"
                    svg={Carve}
                    label={t('Carve')}
                    onClick={(e) => checkIfNeedsBlock(e, '/')}
                />
                <NavbarLink
                    href="stats"
                    icon={IoSpeedometerOutline}
                    label={t('Stats')}
                    onClick={(e) => checkIfNeedsBlock(e, 'stats')}
                />
                <NavbarLink
                    href="tools"
                    icon={RiToolsFill}
                    label={t('Tools')}
                    onClick={(e) => checkIfNeedsBlock(e, 'tools')}
                />

                <NavbarLink
                    href="configuration"
                    icon={FaTasks}
                    label={t('Config')}
                />
            </div>
        </>
    );
};
