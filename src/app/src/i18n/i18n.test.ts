import { setLanguage, t } from './index';

describe('i18n', () => {
    it('falls back to the key itself for untranslated keys in English', () => {
        setLanguage('en');
        expect(t('Some Unregistered Key')).toBe('Some Unregistered Key');
    });

    it('interpolates {{var}} placeholders in Japanese', () => {
        setLanguage('ja');
        expect(t('Ethernet (port {{port}})', { port: 23 })).toBe(
            'イーサネット（ポート23）',
        );
    });
});
