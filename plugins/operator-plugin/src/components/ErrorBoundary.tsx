import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
    children: ReactNode;
};

type ErrorBoundaryState = {
    error: Error | null;
    info: ErrorInfo | null;
};

/**
 * React 18 unmounts the whole tree on an uncaught render/effect error with
 * no boundary present -- a single panel's bug would otherwise blank this
 * entire plugin. Shows the error inline since the plugin iframe has no
 * reliable DevTools access during development.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null, info: null };

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        this.setState({ error, info });
        console.error('[operator-plugin] crashed:', error, info);
    }

    render() {
        const { error, info } = this.state;
        if (!error) {
            return this.props.children;
        }
        return (
            <main className="mx-auto flex max-w-xl flex-col gap-3 p-4">
                <h1 className="text-lg font-semibold text-red-600 dark:text-red-400">
                    Operator Pluginでエラーが発生しました
                </h1>
                <pre className="overflow-auto rounded bg-gray-100 p-3 text-xs text-red-700 dark:bg-gray-800 dark:text-red-300">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                    {info?.componentStack}
                </pre>
            </main>
        );
    }
}

export default ErrorBoundary;
