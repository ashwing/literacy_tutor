import React, { useState } from 'react';
import { RotateCw, Loader2 } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { generateWritingPrompt } from '../../lib/ai-service';
import { getRandomWritingPrompt } from '../../lib/mock-content';

export const WritingEditor: React.FC = () => {
    const { text, setText, incrementStats, gradeLevel, currentScore, setCurrentScore, clearMessages, addSubmission, chatSessions } = useAppStore();
    const [topic, setTopic] = useState(getRandomWritingPrompt());
    const [isGenerating, setIsGenerating] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Reset score when entering the mode
    React.useEffect(() => {
        setCurrentScore(null);
    }, []);

    const handleRefreshTopic = async () => {
        setIsGenerating(true);
        try {
            const newTopic = await generateWritingPrompt(gradeLevel);
            setTopic(newTopic);
            setCurrentScore(null);
            clearMessages('free-write'); // Reset chat for new topic
            setShowConfetti(false);
            setText(''); // Clear text on new topic
        } catch (error) {
            console.error("Failed to generate topic:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleComplete = () => {
        incrementStats('storiesWritten');

        // Get feedback from last chat message
        const lastMsg = chatSessions['free-write']?.slice(-1)[0];
        let feedback = '';
        if (lastMsg) {
            try {
                // Try to parse if it's JSON (the new format)
                const parsed = JSON.parse(lastMsg.content);
                feedback = parsed.feedback || lastMsg.content;
            } catch {
                feedback = lastMsg.content;
            }
        }

        addSubmission({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: 'free-write',
            title: topic,
            content: text,
            score: currentScore || 0,
            feedback
        });

        setShowConfetti(true);

        // Refresh after a short delay to show celebration
        setTimeout(() => {
            setShowConfetti(false);
            handleRefreshTopic();
        }, 3000);
    };

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

    // Simple tracking: Update stats when word count increases significantly (e.g. every 10 words)
    // In a real app, this would be more sophisticated (debounced, session-based)
    React.useEffect(() => {
        if (wordCount > 0 && wordCount % 10 === 0) {
            incrementStats('wordsWritten', 10);
        }
    }, [wordCount]);

    return (
        <div className="p-8 pt-20 h-full flex flex-col max-w-4xl mx-auto relative">
            {showConfetti && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-full shadow-lg z-50 animate-bounce">
                    Story Published! Great Imagination! 🚀
                </div>
            )}

            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">My Story</h1>
                    <div className="h-1 w-20 bg-indigo-500 rounded-full mb-4"></div>
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 max-w-2xl">
                        <p className="text-indigo-900 font-medium italic">
                            {isGenerating ? (
                                <span className="flex items-center gap-2 text-indigo-400">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Finding inspiration...
                                </span>
                            ) : (
                                <>Prompt: "{topic}"</>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefreshTopic}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-4 py-2 rounded-lg transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                        New Topic
                    </button>
                    {currentScore !== null && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm ${currentScore >= 8 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            Score: {currentScore}/10
                        </div>
                    )}
                    <button
                        onClick={handleComplete}
                        disabled={currentScore === null || currentScore < 8}
                        title={!currentScore || currentScore < 8 ? "You need a score of 8+ to submit!" : "Publish your story"}
                        className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Publish Story
                    </button>
                </div>
            </header>

            <div className="flex-1 bg-white rounded-2xl border-2 border-indigo-100 p-6 shadow-sm focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Once upon a time..."
                    className="w-full h-full resize-none outline-none text-xl leading-relaxed text-slate-700 placeholder-slate-300 font-medium"
                    spellCheck={false}
                />
            </div>

            <div className="mt-4 flex justify-between items-center text-slate-400 text-sm font-medium">
                <span>{wordCount} words</span>
                <span>Saved just now</span>
            </div>
        </div>
    );
};
