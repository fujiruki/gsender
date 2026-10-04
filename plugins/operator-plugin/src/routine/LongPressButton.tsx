import { type ReactNode, useRef, useState } from 'react';

const LONG_PRESS_MS = 1500;
const TICK_MS = 50;

type LongPressButtonProps = {
    onComplete: () => void;
    children: ReactNode;
    className?: string;
};

/** Requires holding the button down for LONG_PRESS_MS before firing, with a
 * fill bar showing progress -- a deliberate, hard-to-trigger-by-accident
 * exit gesture for leaving Routine mode. */
const LongPressButton = ({
    onComplete,
    children,
    className,
}: LongPressButtonProps) => {
    const [progress, setProgress] = useState(0);
    const timerRef = useRef<number | null>(null);
    const startedAtRef = useRef(0);

    const cancel = () => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setProgress(0);
    };

    const start = () => {
        startedAtRef.current = Date.now();
        const tick = () => {
            const elapsed = Date.now() - startedAtRef.current;
            if (elapsed >= LONG_PRESS_MS) {
                setProgress(1);
                timerRef.current = null;
                onComplete();
                return;
            }
            setProgress(elapsed / LONG_PRESS_MS);
            timerRef.current = window.setTimeout(tick, TICK_MS);
        };
        tick();
    };

    return (
        <button
            type="button"
            onMouseDown={start}
            onMouseUp={cancel}
            onMouseLeave={cancel}
            onTouchStart={start}
            onTouchEnd={cancel}
            className={className}
            style={{
                backgroundImage: `linear-gradient(to right, rgba(220,38,38,0.5) ${progress * 100}%, transparent ${progress * 100}%)`,
            }}
        >
            {children}
        </button>
    );
};

export default LongPressButton;
