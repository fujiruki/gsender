import { machine, storage } from '@sienci/gsender-plugin-sdk';
import { useTypedSelector } from '@sienci/gsender-plugin-sdk/react';
import { useState } from 'react';

import AdminControls from './admin/AdminControls';
import { AdminRoleProvider } from './admin/AdminRoleContext';
import ChecklistPanel from './checklist/ChecklistPanel';
import { translateWorkflowReason } from './i18n/translateWorkflowReason';
import { workflowStateLabel } from './i18n/workflowStateLabel';
import OriginPanel from './origin/OriginPanel';
import ProbePanel from './probe/ProbePanel';
import StartupPanel from './startup/StartupPanel';
import { useWorkflowState } from './workflow/useWorkflowState';

type RootState = {
    connection?: {
        isConnected?: boolean;
    };
};

const G54_LINE_PATTERN = /^\[G54:([-\d.]+),([-\d.]+),([-\d.]+)\]$/;

const STORAGE_KEY = 'connectivity-check';

const App = () => {
    const isConnected = useTypedSelector<boolean, RootState>(
        (state) => state.connection?.isConnected ?? false,
    );
    const workflow = useWorkflowState();

    const [queryLines, setQueryLines] = useState<string[] | null>(null);
    const [queryError, setQueryError] = useState<string | null>(null);
    const [queryLoading, setQueryLoading] = useState(false);

    const [storageInput, setStorageInput] = useState('');
    const [storageValue, setStorageValue] = useState<string | null>(null);
    const [storageLoading, setStorageLoading] = useState(false);

    const handleQueryWcs = async () => {
        setQueryLoading(true);
        setQueryError(null);
        try {
            const result = await machine.query('$#');
            setQueryLines(result.lines);
        } catch (err) {
            setQueryError(err instanceof Error ? err.message : String(err));
        } finally {
            setQueryLoading(false);
        }
    };

    const g54Line = queryLines?.find((line) => G54_LINE_PATTERN.test(line));
    const g54 = g54Line?.match(G54_LINE_PATTERN);

    const handleStorageSave = async () => {
        setStorageLoading(true);
        try {
            await storage.set(STORAGE_KEY, storageInput);
            setStorageValue(storageInput);
        } finally {
            setStorageLoading(false);
        }
    };

    const handleStorageLoad = async () => {
        setStorageLoading(true);
        try {
            const value = await storage.get<string>(STORAGE_KEY);
            setStorageValue(value ?? null);
        } finally {
            setStorageLoading(false);
        }
    };

    return (
        <AdminRoleProvider>
        <main className="mx-auto flex max-w-xl flex-col gap-6">
            <header>
                <h1 className="text-xl font-semibold">オペレーター Plugin</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    日常のCNC操作を標準化するPluginです。
                </p>
            </header>

            <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
                <h2 className="mb-2 font-medium">ワークフロー状態</h2>
                <p className="font-mono text-lg font-semibold">
                    {workflowStateLabel(workflow.state)}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {translateWorkflowReason(workflow.state, workflow.reason)}
                </p>
            </section>

            <AdminControls />

            <StartupPanel />

            <ChecklistPanel />

            <OriginPanel />

            <ProbePanel />

            <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
                <h2 className="mb-2 font-medium">接続</h2>
                <p>
                    状態:{' '}
                    <span
                        className={
                            isConnected
                                ? 'font-medium text-green-600 dark:text-green-400'
                                : 'font-medium text-red-600 dark:text-red-400'
                        }
                    >
                        {isConnected ? '接続済み' : '未接続'}
                    </span>
                </p>
            </section>

            <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
                <h2 className="mb-2 font-medium">WCS(G54)を$#で確認</h2>
                <button
                    type="button"
                    onClick={handleQueryWcs}
                    disabled={queryLoading}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                >
                    {queryLoading ? '問い合わせ中…' : '$#を問い合わせ'}
                </button>
                {g54 && (
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">
                                X
                            </dt>
                            <dd>{g54[1]}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">
                                Y
                            </dt>
                            <dd>{g54[2]}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">
                                Z
                            </dt>
                            <dd>{g54[3]}</dd>
                        </div>
                    </dl>
                )}
                {queryLines && !g54 && (
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        応答にG54の行がありません。
                    </p>
                )}
                {queryError && (
                    <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                        エラー: {queryError}
                    </p>
                )}
                {queryLines && (
                    <pre className="mt-3 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                        {queryLines.join('\n')}
                    </pre>
                )}
            </section>

            <section className="rounded-md border border-gray-300 p-4 dark:border-gray-700">
                <h2 className="mb-2 font-medium">ストレージ読み書き確認</h2>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={storageInput}
                        onChange={(event) =>
                            setStorageInput(event.target.value)
                        }
                        placeholder="保存する値"
                        className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                    />
                    <button
                        type="button"
                        onClick={handleStorageSave}
                        disabled={storageLoading}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                    >
                        保存
                    </button>
                    <button
                        type="button"
                        onClick={handleStorageLoad}
                        disabled={storageLoading}
                        className="rounded-md border border-gray-300 px-3 py-1.5 dark:border-gray-700"
                    >
                        読込
                    </button>
                </div>
                {storageValue !== null && (
                    <p className="mt-3 text-sm">
                        保存された値: <code>{storageValue}</code>
                    </p>
                )}
            </section>
        </main>
        </AdminRoleProvider>
    );
};

export default App;
