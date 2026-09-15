import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FaGamepad, FaTimes } from 'react-icons/fa';

import { Confirm } from 'app/components/ConfirmationDialog/ConfirmationDialogLib';
import { toast } from 'app/lib/toaster';
import ToolCard from 'app/components/ToolCard';

import { GamepadContext } from './utils/context';
import {
    removeGamepadProfileFromList,
    setCurrentGamepadProfile,
} from './utils/actions';
import { t } from 'app/i18n';

const ProfileItem = ({ title, icon, id }) => {
    const { dispatch } = useContext(GamepadContext);

    const handleDelete = (e) => {
        e.stopPropagation(); //Prevents bubbling that will fire the parent div's onclick first

        Confirm({
            content: t(
                'Are you sure you want to delete this gamepad profile?',
            ),
            title: t('Delete Gamepad Profile'),
            onConfirm: () => deleteProfile(id),
        });
    };

    const deleteProfile = (id) => {
        dispatch(removeGamepadProfileFromList(id));
        toast.info(t('Removed Gamepad Profile'), { position: 'bottom-right' });
    };

    const setCurrentProfile = (profileID) => {
        dispatch(setCurrentGamepadProfile(profileID));
    };

    return (
        <div className="relative">
            <ToolCard
                title={title}
                icon={FaGamepad}
                onClick={() => setCurrentProfile(id)}
            />
            <FaTimes
                tabIndex={0}
                role="button"
                onClick={(e) => handleDelete(e)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDelete(e);
                    }
                }}
                aria-label={t('Delete gamepad profile {{title}}', { title })}
                className="text-red-500 cursor-pointer hover:text-red-700 absolute top-2 right-2 z-10"
            />
        </div>
    );
};

ProfileItem.propTypes = {
    title: PropTypes.string,
    icon: PropTypes.string,
    id: PropTypes.array,
};

export default ProfileItem;
