import React, { type ReactNode } from 'react';

interface SplitScreenProps {
    leftPanel: ReactNode;
    rightPanel: ReactNode;
}

export const SplitScreen: React.FC<SplitScreenProps> = ({ leftPanel, rightPanel }) => {
    return (
        <div className="flex h-full w-full flex-col md:flex-row overflow-hidden bg-slate-50">
            {/* Left Panel - Writing Area */}
            <div className="w-full md:w-3/5 h-1/2 md:h-full overflow-y-auto border-r border-slate-200 bg-white shadow-sm z-10 pt-4">
                {leftPanel}
            </div>

            {/* Right Panel - Companion Area */}
            <div className="w-full md:w-2/5 h-1/2 md:h-full bg-slate-50 relative">
                {rightPanel}
            </div>
        </div>
    );
};
