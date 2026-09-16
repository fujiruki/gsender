import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackWidget } from '../index';

jest.mock('react-router', () => ({
    useLocation: () => ({ pathname: '/carve' }),
}));

// Dialog reads the accessibility focus-trapping preference from the redux
// store; stub it out so the widget can render without a real <Provider>.
jest.mock('app/hooks/useTypedSelector', () => ({
    useTypedSelector: () => ({ focusTrapping: false }),
}));

const mockCreate = jest.fn(() => Promise.resolve({ data: { err: null } }));
jest.mock('app/api', () => ({
    __esModule: true,
    default: {
        feedback: {
            create: (...args: any[]) => mockCreate(...args),
        },
    },
}));

const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('app/lib/toaster', () => ({
    toast: {
        success: (...args: any[]) => mockToastSuccess(...args),
        error: (...args: any[]) => mockToastError(...args),
    },
}));

// jsdom does not implement object URLs; the widget only uses them for
// thumbnail previews, so a stable fake is enough here.
beforeAll(() => {
    let counter = 0;
    global.URL.createObjectURL = jest.fn(() => `blob:mock-${counter++}`);
    global.URL.revokeObjectURL = jest.fn();
});

beforeEach(() => {
    mockCreate.mockClear();
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
});

const openWidget = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
};

describe('FeedbackWidget', () => {
    test('send button is disabled until body text is entered', () => {
        render(<FeedbackWidget />);
        openWidget();

        const sendButton = screen.getByRole('button', { name: 'Send' });
        expect(sendButton).toBeDisabled();

        fireEvent.change(screen.getByPlaceholderText('Describe the issue or request…'), {
            target: { value: 'Jog feels laggy' },
        });
        expect(sendButton).not.toBeDisabled();
    });

    test('adds a pasted clipboard image as a thumbnail and can remove it', () => {
        render(<FeedbackWidget />);
        openWidget();

        const textarea = screen.getByPlaceholderText('Describe the issue or request…');
        const file = new File(['fake'], 'clip.png', { type: 'image/png' });

        fireEvent.paste(textarea, {
            clipboardData: {
                items: [
                    {
                        type: 'image/png',
                        getAsFile: () => file,
                    },
                ],
            },
        });

        expect(screen.getAllByRole('img')).toHaveLength(1);

        fireEvent.click(screen.getByRole('button', { name: 'Remove image' }));
        expect(screen.queryAllByRole('img')).toHaveLength(0);
    });

    test('submits the form with body, priority and source screen, then closes and toasts success', async () => {
        render(<FeedbackWidget />);
        openWidget();

        fireEvent.change(screen.getByPlaceholderText('Describe the issue or request…'), {
            target: { value: 'Homing feels off' },
        });
        fireEvent.change(screen.getByRole('combobox', { name: 'Priority' }), {
            target: { value: 'high' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Send' }));

        await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));

        const formData = mockCreate.mock.calls[0][0] as FormData;
        expect(formData.get('body')).toBe('Homing feels off');
        expect(formData.get('priority')).toBe('high');
        expect(formData.get('sourceScreen')).toBe('/carve');

        await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());
        expect(screen.queryByPlaceholderText('Describe the issue or request…')).not.toBeInTheDocument();
    });

    test('shows an error toast and keeps the modal open when the request fails', async () => {
        mockCreate.mockImplementationOnce(() => Promise.reject(new Error('network error')));
        render(<FeedbackWidget />);
        openWidget();

        fireEvent.change(screen.getByPlaceholderText('Describe the issue or request…'), {
            target: { value: 'Something broke' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Send' }));

        await waitFor(() => expect(mockToastError).toHaveBeenCalled());
        expect(screen.getByPlaceholderText('Describe the issue or request…')).toBeInTheDocument();
    });
});
