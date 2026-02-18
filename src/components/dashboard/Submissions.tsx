import React from 'react';
import { useAppStore } from '../../lib/store';
import { FileText, BookOpen, Flag, Award, Calendar } from 'lucide-react';

export const Submissions: React.FC = () => {
    const { stats } = useAppStore();
    const submissions = stats.submissions || [];

    const getIcon = (type: string) => {
        switch (type) {
            case 'free-write': return <FileText className="w-5 h-5 text-indigo-500" />;
            case 'reading': return <BookOpen className="w-5 h-5 text-amber-500" />;
            case 'race': return <Flag className="w-5 h-5 text-orange-500" />;
            default: return <FileText className="w-5 h-5 text-slate-500" />;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'free-write': return 'Creative Writing';
            case 'reading': return 'Reading Comprehension';
            case 'race': return 'RACE Practice';
            default: return 'Activity';
        }
    };

    if (submissions.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <Award className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Submissions Yet</h3>
                <p className="max-w-md text-center">
                    Complete stories, reading exercises, or RACE challenges with a score of 8+ to see them here!
                </p>
            </div>
        );
    }

    const renderMarkdown = (text: string) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={j} className="text-indigo-900 font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
                <br />
            </React.Fragment>
        ));
    };

    return (
        <div className="h-full overflow-y-auto p-6 max-w-5xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">My Showcase</h1>
                <p className="text-slate-500">A collection of your best work (Score 8+)</p>
            </header>

            <div className="grid gap-6">
                {submissions.map((submission) => (
                    <div key={submission.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100`}>
                                    {getIcon(submission.type)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {getLabel(submission.type)}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(submission.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800">{submission.title}</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-100">
                                <Award className="w-4 h-4" />
                                {submission.score}/10
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50">
                            <div className="prose prose-slate max-w-none">
                                <p className="whitespace-pre-line text-slate-700 font-serif leading-relaxed">
                                    {submission.content}
                                </p>
                            </div>

                            {submission.type === 'race' && submission.racePrompt && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Prompt</p>
                                    <p className="text-sm text-slate-600 italic">{submission.racePrompt}</p>
                                </div>
                            )}

                            {submission.type === 'reading' && submission.readingQuestions && (
                                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Q&A</p>
                                    {submission.readingQuestions.map((qa) => (
                                        <div key={qa.id}>
                                            <p className="text-sm font-bold text-slate-700 mb-1">{qa.text}</p>
                                            <p className="text-sm text-slate-600">{qa.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {submission.feedback && (
                                <div className="mt-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        Examiner Feedback
                                    </h4>
                                    <div className="text-sm text-indigo-800 leading-relaxed">
                                        {renderMarkdown(submission.feedback)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
