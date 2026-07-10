import '@testing-library/jest-dom';
import enMessages from './messages/en.json';

// next-intl ships as ESM and trips Jest's default transform. Stub the hooks
// so tests resolve real strings from messages/en.json (preserving the assertions
// that query rendered output by English text), while skipping the real ESM bundle.
type Messages = Record<string, Record<string, string>>;
const messages = enMessages as Messages;

const interpolate = (template: string, params?: Record<string, unknown>) => {
    if (!params) return template;
    // Strip ICU plural blocks so we at least render a stable string in tests.
    let result = template.replace(
        /\{(\w+),\s*plural,([^}]|\{[^}]*\})*\}/g,
        (_, key: string) => {
            const value = params[key];
            return value === undefined ? `{${key}}` : String(value);
        }
    );
    result = result.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = params[key];
        return value === undefined ? `{${key}}` : String(value);
    });
    return result;
};

const resolve = (namespace: string | undefined, key: string): string => {
    if (namespace && messages[namespace] && messages[namespace][key] !== undefined) {
        return messages[namespace][key];
    }
    return key;
};

jest.mock('next-intl', () => ({
    useTranslations: (namespace?: string) => {
        const t = (key: string, params?: Record<string, unknown>) =>
            interpolate(resolve(namespace, key), params);
        // t.rich renders formatted messages with tag callbacks in real next-intl;
        // for tests we resolve the raw template (tags left as literal text).
        t.rich = (key: string) => resolve(namespace, key);
        return t;
    },
    useLocale: () => 'en',
    useFormatter: () => ({
        number: (v: number) => String(v),
        dateTime: (v: Date) => v.toISOString(),
    }),
    NextIntlClientProvider: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('next-intl/server', () => ({
    getLocale: async () => 'en',
    getMessages: async () => messages,
    getTranslations: async (namespace?: string) =>
        (key: string, params?: Record<string, unknown>) =>
            interpolate(resolve(namespace, key), params),
}));

// `@/i18n/actions` pulls in `next/cache`, which ships as ESM and breaks
// Jest's transform. Tests don't exercise the locale-cookie action, so stub it.
jest.mock('@/i18n/actions', () => ({
    setLocaleCookie: jest.fn(async () => undefined),
}));
