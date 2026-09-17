import { render } from '@testing-library/react';
import {
    confirmUnlockAfterHomingFailure,
    isLimitSwitchFaultAlarm,
} from 'app/features/UnlockButton';

jest.mock('app/components/ConfirmationDialog/ConfirmationDialogLib', () => ({
    Confirm: jest.fn(),
}));
jest.mock('app/features/DRO/utils/DRO', () => ({
    homeMachine: jest.fn(),
}));
jest.mock('app/lib/controller', () => ({
    __esModule: true,
    default: { command: jest.fn() },
}));

import { Confirm } from 'app/components/ConfirmationDialog/ConfirmationDialogLib';
import { homeMachine } from 'app/features/DRO/utils/DRO';

const mockConfirm = Confirm as jest.Mock;
const mockHomeMachine = homeMachine as jest.Mock;

const renderContent = (content: React.ReactNode) => render(<>{content}</>);

describe('confirmUnlockAfterHomingFailure', () => {
    beforeEach(() => {
        mockConfirm.mockClear();
        mockHomeMachine.mockClear();
    });

    it('unlocks immediately for a non-homing-failure alarm code', () => {
        const onUnlock = jest.fn();
        confirmUnlockAfterHomingFailure(3, onUnlock);
        expect(onUnlock).toHaveBeenCalledTimes(1);
        expect(mockConfirm).not.toHaveBeenCalled();
    });

    it('offers Rehome as confirm and Unlock Anyway as cancel for ALARM:6', () => {
        const onUnlock = jest.fn();
        confirmUnlockAfterHomingFailure(6, onUnlock);

        expect(mockConfirm).toHaveBeenCalledTimes(1);
        const options = mockConfirm.mock.calls[0][0];
        expect(options.confirmLabel).toBe('Rehome');
        expect(options.cancelLabel).toBe('Unlock Anyway');

        options.onConfirm();
        expect(mockHomeMachine).toHaveBeenCalledTimes(1);

        options.onClose();
        expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    test.each([8, 9])(
        'shows the limit switch fault guidance for ALARM:%i',
        (code) => {
            confirmUnlockAfterHomingFailure(code, jest.fn());
            const { content } = mockConfirm.mock.calls[0][0];
            const { getByText } = renderContent(content);
            expect(
                getByText(/turn off "Homing cycle enable" \(\$22\)/),
            ).toBeInTheDocument();
        },
    );

    test.each([6, 7])(
        'does not show the limit switch fault guidance for ALARM:%i',
        (code) => {
            confirmUnlockAfterHomingFailure(code, jest.fn());
            const { content } = mockConfirm.mock.calls[0][0];
            const { queryByText } = renderContent(content);
            expect(
                queryByText(/turn off "Homing cycle enable" \(\$22\)/),
            ).not.toBeInTheDocument();
        },
    );

    it('unlocks immediately for a Homing-required alarm (non-numeric code)', () => {
        const onUnlock = jest.fn();
        confirmUnlockAfterHomingFailure('Homing', onUnlock);
        expect(onUnlock).toHaveBeenCalledTimes(1);
        expect(mockConfirm).not.toHaveBeenCalled();
    });
});

describe('isLimitSwitchFaultAlarm', () => {
    it('is true only for ALARM:8 and ALARM:9', () => {
        expect(isLimitSwitchFaultAlarm(8)).toBe(true);
        expect(isLimitSwitchFaultAlarm(9)).toBe(true);
        expect(isLimitSwitchFaultAlarm(6)).toBe(false);
        expect(isLimitSwitchFaultAlarm(7)).toBe(false);
    });
});
