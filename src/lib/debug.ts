export interface LogEntry {
    id: string;
    timestamp: number;
    type: 'info' | 'success' | 'error' | 'warning';
    source: 'AI-Service' | 'System';
    message: string;
    details?: {
        prompt?: string;
        response?: string;
        model?: string;
        error?: any;
    };
}

class DebugLogger {
    private listeners: ((log: LogEntry) => void)[] = [];
    private logs: LogEntry[] = [];

    public log(type: LogEntry['type'], message: string, details?: LogEntry['details']) {
        const entry: LogEntry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            type,
            source: 'AI-Service',
            message,
            details
        };

        this.logs.push(entry);
        this.notify(entry);
    }

    public subscribe(listener: (log: LogEntry) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    public getLogs() {
        return this.logs;
    }

    public clear() {
        this.logs = [];
    }

    private notify(log: LogEntry) {
        this.listeners.forEach(l => l(log));
    }
}

export const debugManager = new DebugLogger();
