import React, { useEffect, useState, useRef } from 'react';
import { X, Bug, Trash2, Cpu, Database } from 'lucide-react';
import { debugManager, type LogEntry } from '../../lib/debug';
import { useAppStore } from '../../lib/store';

export const DebugOverlay: React.FC = () => {
    const { isDebugMode, setIsDebugMode } = useAppStore();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial logs
        setLogs(debugManager.getLogs());

        // Subscribe to new logs
        const unsubscribe = debugManager.subscribe((newLog) => {
            setLogs(prev => [...prev, newLog]);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (isDebugMode) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isDebugMode]);

    if (!isDebugMode) return null;

    return (
        <div className="fixed bottom-0 right-0 w-full md:w-[600px] h-[50vh] bg-slate-900 shadow-2xl z-50 flex flex-col border-t border-slate-700 md:rounded-tl-xl md:border-l overflow-hidden font-mono text-xs">
            {/* Header */}
            <div className="bg-slate-800 p-3 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-2 text-slate-200">
                    <Bug className="w-4 h-4 text-green-400" />
                    <span className="font-bold">AI Debug Console</span>
                    <span className="text-slate-500 text-[10px] ml-2">{logs.length} events</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            debugManager.clear();
                            setLogs([]);
                        }}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
                        title="Clear Logs"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsDebugMode(false)}
                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Log Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
                {logs.length === 0 && (
                    <div className="text-center text-slate-600 italic py-8">
                        No logs yet. Trigger an AI action...
                    </div>
                )}

                {logs.map((log) => (
                    <div key={log.id} className="border-l-2 border-slate-700 pl-3 py-1 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-1.5 rounded text-[10px] font-bold uppercase ${log.type === 'error' ? 'bg-red-900 text-red-200' :
                                    log.type === 'success' ? 'bg-green-900 text-green-200' :
                                        log.type === 'warning' ? 'bg-amber-900 text-amber-200' :
                                            'bg-blue-900 text-blue-200'
                                }`}>
                                {log.type}
                            </span>
                            <span className="text-slate-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-green-500 font-bold ml-auto flex items-center gap-1">
                                {log.details?.error ? (
                                    <span className="text-red-400">Failed</span>
                                ) : (
                                    log.message.includes('Mock') ? (
                                        <><Database className="w-3 h-3" /> Mock</>
                                    ) : (
                                        <><Cpu className="w-3 h-3" /> Real AI</>
                                    )
                                )}
                            </span>
                        </div>

                        <div className="text-slate-300 font-bold mb-1">
                            {log.message}
                        </div>

                        {log.details && (
                            <div className="bg-black/30 p-2 rounded border border-slate-800 overflow-x-auto">
                                {log.details.error && (
                                    <div className="text-red-400 mb-1">
                                        Error: {JSON.stringify(log.details.error)}
                                    </div>
                                )}
                                {log.details.prompt && (
                                    <div className="mb-2">
                                        <div className="text-slate-500 mb-0.5">Prompt:</div>
                                        <pre className="whitespace-pre-wrap text-slate-400">{log.details.prompt}</pre>
                                    </div>
                                )}
                                {log.details.response && (
                                    <div>
                                        <div className="text-slate-500 mb-0.5">Response:</div>
                                        <pre className="whitespace-pre-wrap text-green-400/80">{log.details.response}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
