import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { RACEPrompt, ReadingPassage } from './mock-content';
import type { AIMessage } from './ai-service';

interface AppStats {
  wordsWritten: number;
  storiesRead: number;
  racePromptsCompleted: number;
  streakDays: number;
  storiesWritten: number;
  history: Record<string, DailyStats>;
  lastActiveDate: string;
  submissions: Submission[];
}

export interface Submission {
  id: string;
  date: string;
  type: 'free-write' | 'reading' | 'race';
  title: string;
  content: string;
  score: number;
  feedback?: string;
  readingQuestions?: { id: number; text: string; answer: string }[];
  racePrompt?: string;
}

interface DailyStats {
  wordsWritten: number;
  storiesRead: number;
  racePromptsCompleted: number;
  storiesWritten: number;
}

// ... existing AppState interface ...

const STORAGE_KEY = 'writing-buddy-storage-v1';

const getInitialStats = (): AppStats => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure history exists for backward compatibility
      if (!parsed.history) parsed.history = {};
      if (!parsed.submissions) parsed.submissions = [];
      if (!parsed.lastActiveDate) parsed.lastActiveDate = new Date().toISOString().split('T')[0];
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }
  return {
    wordsWritten: 0,
    storiesRead: 0,
    racePromptsCompleted: 0,
    streakDays: 1,
    storiesWritten: 0,
    history: {},
    lastActiveDate: new Date().toISOString().split('T')[0],
    submissions: []
  };
};

interface AppState {
  // User State
  text: string;
  setText: (text: string) => void;
  gradeLevel: number;
  setGradeLevel: (level: number) => void;
  // Module Specific State
  readingAnswers: Record<number, string>;
  setReadingAnswers: (answers: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void; // Support functional updates
  raceResponse: string;
  setRaceResponse: (response: string) => void;
  currentRACEPrompt: RACEPrompt | null;
  setCurrentRACEPrompt: (prompt: RACEPrompt | null) => void;
  currentReadingPassage: ReadingPassage | null;
  setCurrentReadingPassage: (passage: ReadingPassage | null) => void;
  currentScore: number | null;
  setCurrentScore: (score: number | null) => void;

  // Navigation State
  currentMode: 'free-write' | 'reading' | 'race' | 'dashboard' | 'submissions';
  setCurrentMode: (mode: 'free-write' | 'reading' | 'race' | 'dashboard' | 'submissions') => void;

  // System State
  isDebugMode: boolean;
  setIsDebugMode: (isEnabled: boolean) => void;

  // Progress Stats
  stats: AppStats;
  incrementStats: (key: keyof Omit<DailyStats, 'date'>, amount?: number) => void;
  addSubmission: (submission: Submission) => void;

  // Chat State
  chatSessions: Record<string, AIMessage[]>;
  addMessage: (mode: string, message: AIMessage) => void;
  clearMessages: (mode: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [text, setText] = useState('');
  const [gradeLevel, setGradeLevel] = useState(4); // Default to Grade 4
  const [readingAnswers, setReadingAnswers] = useState<Record<number, string>>({});
  const [raceResponse, setRaceResponse] = useState('');
  const [currentRACEPrompt, setCurrentRACEPrompt] = useState<RACEPrompt | null>(null);
  const [currentReadingPassage, setCurrentReadingPassage] = useState<ReadingPassage | null>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [currentMode, setCurrentMode] = useState<'free-write' | 'reading' | 'race' | 'dashboard' | 'submissions'>('free-write');
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [stats, setStats] = useState<AppStats>(getInitialStats);

  // Persistence effect
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const incrementStats = (key: keyof Omit<DailyStats, 'date'>, amount = 1) => {
    // ... existing implementation
    const today = new Date().toISOString().split('T')[0];

    setStats(prev => {
      // ... existing logic (omitted for brevity in replacement, but I must be careful not to overwrite if I can't see it all. 
      // Actually, replace_file_content replaces the chunk. I need to keep the existing implementation of incrementStats or re-write it.)
      // Since I am replacing the whole function block in the previous turn? No, I am inserting AFTER incrementStats usually.
      // Let's use the END of incrementStats to append the new logic.

      const newHistory = { ...prev.history };
      if (!newHistory[today]) {
        newHistory[today] = { wordsWritten: 0, storiesRead: 0, racePromptsCompleted: 0, storiesWritten: 0 };
      }
      newHistory[today][key] = (newHistory[today][key] || 0) + amount;

      let newStreak = prev.streakDays;
      const lastActive = prev.lastActiveDate;
      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (lastActive === yesterdayStr) newStreak += 1;
        else newStreak = 1;
      }

      // ... existing incrementStats ...
      return {
        ...prev,
        [key]: (prev[key] as number) + amount,
        history: newHistory,
        streakDays: newStreak,
        lastActiveDate: today
      };
    });
  };

  const addSubmission = (submission: Submission) => {
    setStats(prev => ({
      ...prev,
      submissions: [submission, ...(prev.submissions || [])]
    }));
  };

  // Chat Session Management
  const [chatSessions, setChatSessions] = useState<Record<string, AIMessage[]>>({
    'dashboard': [],
    'reading': [],
    'race': [],
    'free-write': []
  });

  const addMessage = (mode: string, message: AIMessage) => {
    setChatSessions(prev => ({
      ...prev,
      [mode]: [...(prev[mode] || []), message]
    }));
  };

  const clearMessages = (mode: string) => {
    setChatSessions(prev => ({
      ...prev,
      [mode]: []
    }));
  };

  return (
    <AppContext.Provider value={{
      text, setText,
      gradeLevel, setGradeLevel,
      readingAnswers, setReadingAnswers,
      raceResponse, setRaceResponse,
      currentMode, setCurrentMode,
      isDebugMode, setIsDebugMode,
      stats, incrementStats,
      currentRACEPrompt, setCurrentRACEPrompt,
      currentReadingPassage, setCurrentReadingPassage,
      currentScore, setCurrentScore,
      chatSessions, addMessage, clearMessages,
      addSubmission
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
