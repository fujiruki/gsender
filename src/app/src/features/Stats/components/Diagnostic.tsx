import generateSupportFile from 'app/lib/diagnostics.tsx';
import { t } from 'app/i18n';

interface DiagnosticProps {
    compactOnSmall?: boolean;
}

export function Diagnostic({ compactOnSmall = false }: DiagnosticProps) {
    return (
        <div
            className={`flex flex-col gap-4 ${
                compactOnSmall ? 'h-full max-xl:justify-center' : ''
            }`}
        >
            <p
                className={`text-gray-600 text-sm dark:text-white ${
                    compactOnSmall ? 'max-xl:hidden' : ''
                }`}
            >
                {t(
                    'Share this file with our customer support or community so others can help you better. It contains your machine errors, profile, settings, and more.',
                )}
            </p>
            {generateSupportFile()}
        </div>
    );
}
