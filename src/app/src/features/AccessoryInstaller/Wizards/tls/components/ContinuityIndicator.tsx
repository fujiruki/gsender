import { Check, AlertTriangle } from 'lucide-react';
import { t } from 'app/i18n';
import './ContinuityIndicator.css';

export type ContinuityPhase =
    | 'checking-idle'
    | 'waiting'
    | 'success'
    | 'stuck-on';

function getCopy(phase: ContinuityPhase): string {
    return {
        'checking-idle': t('Checking continuity…'),
        waiting: t('Waiting for probe contact…'),
        success: t('Continuity confirmed'),
        'stuck-on': t('Sensor triggered immediately'),
    }[phase];
}

interface ContinuityIndicatorProps {
    phase: ContinuityPhase;
    size?: number;
    label?: string;
}

export function ContinuityIndicator({
    phase,
    size = 140,
    label,
}: ContinuityIndicatorProps) {
    const text = label ?? getCopy(phase);

    return (
        <div className="continuity-indicator" data-phase={phase}>
            <div
                className="continuity-indicator__shell"
                style={{ width: size, height: size }}
            >
                <svg className="continuity-indicator__svg" viewBox="0 0 160 160">
                    <circle
                        className="ci-bezel"
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                    />
                    <circle
                        className="ci-ripple ci-ripple--1"
                        cx="80"
                        cy="80"
                        r="20"
                        fill="none"
                        strokeWidth="2"
                    />
                    <circle
                        className="ci-ripple ci-ripple--2"
                        cx="80"
                        cy="80"
                        r="20"
                        fill="none"
                        strokeWidth="2"
                    />
                    <circle className="ci-core" cx="80" cy="80" r="16" />
                </svg>

                <span
                    className="continuity-indicator__glyph continuity-indicator__glyph--check"
                    aria-hidden="true"
                >
                    <Check strokeWidth={2.5} />
                </span>
                <span
                    className="continuity-indicator__glyph continuity-indicator__glyph--warning"
                    aria-hidden="true"
                >
                    <AlertTriangle strokeWidth={2.5} />
                </span>
            </div>

            <div className="continuity-indicator__readout">
                <span className="continuity-indicator__dot" />
                <span>{text}</span>
            </div>

            <div
                className="continuity-indicator__visually-hidden"
                role="status"
                aria-live="polite"
            >
                {text}
            </div>
        </div>
    );
}
