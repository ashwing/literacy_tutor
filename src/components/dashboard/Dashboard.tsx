import React from 'react';
import { Trophy, BookOpen, PenTool, Flame, Target } from 'lucide-react';
import { useAppStore } from '../../lib/store';

export const Dashboard: React.FC = () => {
    const { stats } = useAppStore();

    const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${color} bg-opacity-20`}>
                <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );

    // Helper to get last 30 days history
    const getLast30Days = () => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const hasActivity = stats.history && stats.history[dateStr] && (
                stats.history[dateStr].wordsWritten > 0 ||
                stats.history[dateStr].storiesRead > 0 ||
                stats.history[dateStr].racePromptsCompleted > 0 ||
                stats.history[dateStr].storiesWritten > 0
            );
            days.push({ date: dateStr, active: !!hasActivity });
        }
        return days;
    };

    const ActivityGrid = () => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Last 30 Days Activity
            </h3>
            <div className="flex gap-1 justify-between">
                {getLast30Days().map((day) => (
                    <div
                        key={day.date}
                        title={day.date}
                        className={`
                            h-8 flex-1 rounded-sm transition-all
                            ${day.active ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-100 hover:bg-slate-200'}
                        `}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>30 Days Ago</span>
                <span>Today</span>
            </div>
        </div>
    );

    // Helper to get stats for a specific range of days
    const getRangeStats = (days: number) => {
        let words = 0;
        let stories = 0;
        const today = new Date();

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const data = stats.history?.[dateStr];
            if (data) {
                words += data.wordsWritten || 0;
                stories += (data.storiesRead || 0) + (data.storiesWritten || 0) + (data.racePromptsCompleted || 0);
            }
        }
        return { words, stories };
    };

    const weeklyStats = getRangeStats(7);
    const monthlyStats = getRangeStats(30);
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyStats = stats.history?.[todayStr] || { wordsWritten: 0, storiesRead: 0, racePromptsCompleted: 0, storiesWritten: 0 };
    const todayStories = (dailyStats.storiesRead || 0) + (dailyStats.storiesWritten || 0) + (dailyStats.racePromptsCompleted || 0);

    return (
        <div className="h-full p-8 max-w-6xl mx-auto overflow-y-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Progress</h2>
                <p className="text-slate-500 text-lg">Keep up the great work! Here's how you're doing.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Flame}
                    label="Day Streak"
                    value={stats.streakDays}
                    color="bg-orange-500"
                />
                <StatCard
                    icon={PenTool}
                    label="Total Words"
                    value={stats.wordsWritten}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={BookOpen}
                    label="Stories Read"
                    value={stats.storiesRead}
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={Target}
                    label="RACE Challenges"
                    value={stats.racePromptsCompleted}
                    color="bg-purple-500"
                />
            </div>

            <ActivityGrid />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Badges Section */}
                <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm">
                            <Trophy className="w-12 h-12 text-yellow-300" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Writing Champion</h3>
                            <p className="text-indigo-100 text-lg">
                                You're on fire! Complete 3 more stories to unlock the "Bookworm" badge.
                            </p>
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
                </div>

                {/* Summaries */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Performance Summary</h3>
                    <div className="space-y-4">
                        {/* Today */}
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Today</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-700">Words Written</span>
                                <span className="font-bold text-indigo-600">{dailyStats.wordsWritten}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-slate-700">Activities Completed</span>
                                <span className="font-bold text-green-600">{todayStories}</span>
                            </div>
                        </div>

                        {/* Weekly */}
                        <div className="flex gap-4">
                            <div className="flex-1 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Last 7 Days</h4>
                                <div className="text-2xl font-bold text-indigo-900">{weeklyStats.words}</div>
                                <div className="text-xs text-indigo-600">words written</div>
                            </div>
                            <div className="flex-1 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wide mb-1">Last 30 Days</h4>
                                <div className="text-2xl font-bold text-emerald-900">{monthlyStats.words}</div>
                                <div className="text-xs text-emerald-600">words written</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
