import { AppProvider, useAppStore } from './lib/store';
import { SplitScreen } from './components/layout/SplitScreen';
import { WritingEditor } from './components/editor/WritingEditor';
import { ChatInterface } from './components/companion/ChatInterface';
import { ModeTabs } from './components/navigation/ModeTabs';
import { GradeSelector } from './components/navigation/GradeSelector';
import { ReadingComprehension } from './components/modules/ReadingComprehension';
import { RACEPractice } from './components/modules/RACEPractice';
import { Dashboard } from './components/dashboard/Dashboard';
import { Submissions } from './components/dashboard/Submissions';

import { useState } from 'react';
import { Settings, Bug } from 'lucide-react';
import { SettingsModal } from './components/common/SettingsModal';
import { DebugOverlay } from './components/common/DebugOverlay';

const AppContent = () => {
  const { currentMode, isDebugMode, setIsDebugMode } = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getLeftPanel = () => {
    switch (currentMode) {
      case 'dashboard':
        return <Dashboard />;
      case 'submissions':
        return <Submissions />;
      case 'reading':
        return <ReadingComprehension />;
      case 'race':
        return <RACEPractice />;
      case 'free-write':
      default:
        return <WritingEditor />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <DebugOverlay />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Writing Buddy (v3.1)</span>
        </div>

        <ModeTabs />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDebugMode(!isDebugMode)}
            className={`p-2 rounded-full transition-all ${isDebugMode ? 'bg-slate-800 text-green-400' : 'text-slate-400 hover:bg-slate-100'}`}
            title="Debug Mode"
          >
            <Bug className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <GradeSelector />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {currentMode === 'dashboard' ? (
          <Dashboard />
        ) : (
          <SplitScreen
            leftPanel={getLeftPanel()}
            rightPanel={<ChatInterface />}
          />
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
