import React from 'react';
import { PenTool, BookOpen, Flag, LayoutDashboard, Award } from 'lucide-react';
import { useAppStore } from '../../lib/store';

export const ModeTabs: React.FC = () => {
    const { currentMode, setCurrentMode } = useAppStore();

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'submissions', label: 'Submissions', icon: Award },
        { id: 'free-write', label: 'Free Writing', icon: PenTool },
        { id: 'reading', label: 'Reading Tutor', icon: BookOpen },
        { id: 'race', label: 'RACE Practice', icon: Flag },
    ] as const;

    return (
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setCurrentMode(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentMode === tab.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
