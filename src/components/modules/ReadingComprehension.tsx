import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2, Loader2 } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { generateReadingPassage } from '../../lib/ai-service';
import type { ReadingPassage } from '../../lib/mock-content';

export const ReadingComprehension: React.FC = () => {
    const {
        gradeLevel,
        incrementStats,
        readingAnswers,
        setReadingAnswers,
        currentReadingPassage,
        setCurrentReadingPassage,
        currentScore,
        setCurrentScore,
        clearMessages,
        addSubmission,
        chatSessions
    } = useAppStore();

    const [showConfetti, setShowConfetti] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Reset score when entering the mode
    useEffect(() => {
        setCurrentScore(null);
    }, []);

    // Load initial passage
    useEffect(() => {
        if (!currentReadingPassage) {
            handleRefresh();
        }
    }, [gradeLevel]);

    const handleRefresh = async () => {
        setIsGenerating(true);
        try {
            const newPassage = await generateReadingPassage(gradeLevel);
            setCurrentReadingPassage(newPassage);
            setReadingAnswers({});
            setCurrentScore(null);
            clearMessages('reading'); // Reset chat for new story
            setShowConfetti(false);
        } catch (error) {
            console.error("Failed to generate story:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleComplete = () => {
        incrementStats('storiesRead');

        // Get feedback from last chat message
        const lastMsg = chatSessions['reading']?.slice(-1)[0];
        let feedback = '';
        if (lastMsg) {
            try {
                const parsed = JSON.parse(lastMsg.content);
                feedback = parsed.feedback || lastMsg.content;
            } catch {
                feedback = lastMsg.content;
            }
        }

        const questionsWithAnswers = currentReadingPassage?.questions.map(q => ({
            id: q.id,
            text: q.text,
            answer: readingAnswers[q.id] || ''
        }));

        addSubmission({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'reading',
            title: currentReadingPassage?.title || 'Reading Comprehension',
            content: 'Completed reading comprehension questions.',
            score: currentScore || 0,
            feedback,
            readingQuestions: questionsWithAnswers
        });

        setShowConfetti(true);

        // Refresh after a short delay
        setTimeout(() => {
            setShowConfetti(false);
            handleRefresh();
        }, 3000);
    };

    if (!currentReadingPassage && !isGenerating) return <div>Loading...</div>;

    return (
        <div className="h-full flex flex-col p-6 pt-10 max-w-4xl mx-auto relative">
            {showConfetti && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full shadow-lg z-50 animate-bounce">
                    Great Job! Story Completed! 🎉
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                {/* Toolbar */}
                <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-end">
                    <button
                        onClick={handleRefresh}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg transition-all text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                        {isGenerating ? 'Writing Story...' : 'New Story'}
                    </button>
                </div>

                {isGenerating ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-300" />
                        <p className="text-lg font-medium animate-pulse">Consulting the library...</p>
                    </div>
                ) : (
                    <>
                        {/* Scrollable Passage */}
                        <div className="p-8 bg-amber-50 overflow-y-auto flex-1 border-b border-slate-200">
                            <h2 className="text-3xl font-bold text-amber-900 mb-6 font-serif">{currentReadingPassage?.title}</h2>
                            <p className="text-xl leading-loose text-slate-800 font-serif whitespace-pre-line">
                                {currentReadingPassage?.content}
                            </p>
                        </div>

                        {/* Questions Area */}
                        <div className="p-8 bg-white h-1/2 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-indigo-900 uppercase tracking-wider">Comprehension Check</h3>
                                {currentScore !== null && (
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm ${currentScore >= 8 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        Score: {currentScore}/10
                                    </div>
                                )}
                                <button
                                    onClick={handleComplete}
                                    disabled={currentScore === null || currentScore < 8}
                                    title={!currentScore || currentScore < 8 ? "You need a score of 8+ to submit!" : "Submit your work"}
                                    className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    I'm Done!
                                </button>
                            </div>

                            <div className="space-y-6">
                                {currentReadingPassage?.questions.map((q) => (
                                    <div key={q.id}>
                                        <label className="block text-slate-700 font-medium mb-2">{q.text}</label>
                                        <textarea
                                            value={readingAnswers[q.id] || ''}
                                            onChange={(e) => setReadingAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                            className="w-full p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none h-24"
                                            placeholder="Type your answer here..."
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
