import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { sendMessageToAI } from '../../lib/ai-service';
import type { AIMessage } from '../../lib/ai-service';
import { motion } from 'framer-motion';

export const ChatInterface: React.FC = () => {
    const {
        text,
        currentMode,
        readingAnswers,
        raceResponse,
        currentRACEPrompt,
        currentReadingPassage,
        setCurrentScore,
        chatSessions,
        addMessage
    } = useAppStore();

    const messages = chatSessions[currentMode] || [];

    // Initialize welcome message if empty
    useEffect(() => {
        if (messages.length === 0) {
            addMessage(currentMode, {
                id: 'welcome-' + Date.now(),
                role: 'assistant',
                content: "Hi! I'm your Writing Buddy. Select a mode to start learning!",
                timestamp: Date.now()
            });
        }
    }, [currentMode]); // Only run when mode changes and list is empty check inside effect

    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentMode]);

    const getContentToReview = () => {
        switch (currentMode) {
            case 'reading':
                if (!currentReadingPassage) return null;
                return {
                    mode: 'reading',
                    passage: currentReadingPassage,
                    answers: readingAnswers
                };
            case 'race':
                if (!currentRACEPrompt) return null;
                return {
                    mode: 'race',
                    prompt: currentRACEPrompt,
                    answer: raceResponse
                };
            case 'free-write':
            default:
                if (!text.trim()) return null;
                return {
                    mode: 'free-write',
                    text: text
                };
        }
    };

    const handleReviewRequest = async () => {
        const contentContext = getContentToReview();
        if (!contentContext) return;

        // Add user request
        const userMsg: AIMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: "Can you review my work?",
            timestamp: Date.now()
        };
        addMessage(currentMode, userMsg);
        setIsTyping(true);

        // Get AI response
        try {
            const response = await sendMessageToAI("Review Request", contentContext);

            // Set the score in the store
            setCurrentScore(response.score);

            const aiMsg: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.feedback,
                timestamp: Date.now(),
                score: response.score
            };
            addMessage(currentMode, aiMsg);
        } catch (error) {
            console.error(error);
            addMessage(currentMode, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Sorry, I had trouble reviewing that. Please try again.",
                timestamp: Date.now()
            });
        } finally {
            setIsTyping(false);
        }
    };

    const renderMarkdown = (text: string) => {
        // Simple markdown rendering for bold and newlines
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

    const ScoreBadge = ({ score }: { score: number }) => {
        return (
            <div className={`
                flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-2 w-fit
                ${score >= 8 ? 'bg-green-100 text-green-700' :
                    score >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}
            `}>
                <Sparkles className="w-4 h-4" />
                Score: {score}/10
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shadow-sm z-10">
                <div className="p-2 bg-indigo-100 rounded-full">
                    <Bot className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="font-bold text-slate-800">Writing Buddy</h2>
                    <p className="text-xs text-slate-500">Always here to help!</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user'
                                ? 'bg-indigo-500 text-white rounded-tr-none'
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                                }`}
                        >
                            {(msg as any).score !== undefined && (
                                <ScoreBadge score={(msg as any).score} />
                            )}
                            <div className="text-sm md:text-base leading-relaxed">
                                {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Actions */}
            <div className="p-4 bg-white border-t border-slate-200">
                <button
                    onClick={handleReviewRequest}
                    disabled={isTyping || !getContentToReview()}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                    <Sparkles className="w-5 h-5" />
                    Review My Work
                </button>
            </div>
        </div>
    );
};
