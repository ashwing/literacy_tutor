import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2, Loader2 } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { generateRACEPrompt } from '../../lib/ai-service';
import type { RACEPrompt } from '../../lib/mock-content';

export const RACEPractice: React.FC = () => {
    const {
        gradeLevel,
        incrementStats,
        raceResponse,
        setRaceResponse,
        currentRACEPrompt,
        setCurrentRACEPrompt,
        currentScore,
        setCurrentScore,
        clearMessages,
        addSubmission,
        chatSessions
    } = useAppStore();

    // We only need local state for UI interactions, not data
    const [showConfetti, setShowConfetti] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Reset score when entering the mode
    useEffect(() => {
        setCurrentScore(null);
    }, []);

    useEffect(() => {
        if (!currentRACEPrompt) {
            handleRefresh();
        }
    }, [gradeLevel]);

    const handleRefresh = async () => {
        setIsGenerating(true);
        try {
            const newData = await generateRACEPrompt(gradeLevel);
            setCurrentRACEPrompt(newData);
            setRaceResponse('');
            setCurrentScore(null);
            clearMessages('race'); // Reset chat for new challenge
            setShowConfetti(false);
        } catch (error) {
            console.error("Failed to generate RACE prompt:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleComplete = () => {
        incrementStats('racePromptsCompleted');

        // Get feedback from last chat message
        const lastMsg = chatSessions['race']?.slice(-1)[0];
        let feedback = '';
        if (lastMsg) {
            try {
                const parsed = JSON.parse(lastMsg.content);
                feedback = parsed.feedback || lastMsg.content;
            } catch {
                feedback = lastMsg.content;
            }
        }

        addSubmission({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'race',
            title: currentRACEPrompt?.title || 'RACE Practice',
            content: raceResponse,
            score: currentScore || 0,
            feedback,
            racePrompt: currentRACEPrompt?.prompt
        });

        setShowConfetti(true);

        // Refresh after a short delay
        setTimeout(() => {
            setShowConfetti(false);
            handleRefresh();
        }, 3000);
    };

    if (!currentRACEPrompt && !isGenerating) return <div>Loading...</div>;

    return (
        <div className="h-full flex flex-col p-4 pt-16 gap-4 max-w-4xl mx-auto relative">
            {showConfetti && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-6 py-2 rounded-full shadow-lg z-50 animate-bounce">
                    Challenge Completed! Badge Earned! 🏆
                </div>
            )}

            {/* Toolbar */}
            <div className="flex justify-end">
                <button
                    onClick={handleRefresh}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg transition-all text-sm font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                    {isGenerating ? 'Creating Challenge...' : 'New Challenge'}
                </button>
            </div>

            {isGenerating ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-300" />
                    <p className="text-lg font-medium animate-pulse">Designing a challenge...</p>
                </div>
            ) : (
                <>
                    {/* Top Section: Passage & Prompt */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-2/5">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-y-auto">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Read</span>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{currentRACEPrompt?.title}</h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {currentRACEPrompt?.content}
                            </p>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-center">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 block">Prompt</span>
                            <p className="text-xl text-indigo-900 font-medium">
                                {currentRACEPrompt?.prompt}
                            </p>
                        </div>
                    </div>

                    {/* Bottom Section: Writing Area */}
                    <div className="flex-1 bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm focus-within:border-indigo-300 transition-all flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700">Your Response</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    {['Restate', 'Answer', 'Cite', 'Explain'].map((letter) => (
                                        <span key={letter} className="px-2 py-1 text-xs font-bold bg-slate-100 text-slate-500 rounded-md">
                                            {letter}
                                        </span>
                                    ))}
                                </div>
                                {currentScore !== null && (
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-sm ${currentScore >= 8 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        Score: {currentScore}/10
                                    </div>
                                )}
                                <button
                                    onClick={handleComplete}
                                    disabled={currentScore === null || currentScore < 8}
                                    title={!currentScore || currentScore < 8 ? "You need a score of 8+ to submit!" : "Submit your work"}
                                    className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Submit
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={raceResponse}
                            onChange={(e) => setRaceResponse(e.target.value)}
                            className="w-full flex-1 resize-none outline-none text-lg leading-relaxed text-slate-700"
                            placeholder="Start by restating the question..."
                        />
                    </div>
                </>
            )}
        </div>
    );
};
