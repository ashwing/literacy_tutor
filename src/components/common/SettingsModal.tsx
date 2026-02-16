import React, { useState, useEffect } from 'react';
import { X, Key, Save, Check } from 'lucide-react';
import { getApiKey, setApiKey } from '../../lib/anthropic';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [key, setKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setKey(getApiKey() || '');
            setSaved(false);
        }
    }, [isOpen]);

    const handleSave = () => {
        setApiKey(key.trim());
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-600" />
                        Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Anthropic API Key
                        </label>
                        <p className="text-xs text-slate-500 mb-3">
                            Required for AI features. Your key is stored locally in your browser.
                        </p>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="sk-ant-..."
                            className="w-full p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono text-sm"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${saved
                                ? 'bg-green-500 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                            }`}
                    >
                        {saved ? (
                            <>
                                <Check className="w-5 h-5" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Settings
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
