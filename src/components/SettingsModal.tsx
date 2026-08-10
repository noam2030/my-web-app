'use client';

import React, { useState } from 'react';
import { ModelSettings, LLMProvider } from '@/lib/types';
import { X, Key, ShieldCheck, Cpu, Eye, EyeOff, Check, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ModelSettings;
  onSave: (newSettings: Partial<ModelSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [provider, setProvider] = useState<LLMProvider>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [modelName, setModelName] = useState(settings.modelName);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      provider,
      apiKey,
      modelName:
        provider === 'gemini'
          ? modelName || 'gemini-1.5-flash'
          : provider === 'openai'
          ? modelName || 'gpt-4o-mini'
          : 'demo-simulator',
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">LLM Provider Settings</h2>
              <p className="text-xs text-slate-400">Configure live API keys or fast Demo mode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Provider Select */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Inference Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProvider('demo');
                  setModelName('demo-simulator');
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  provider === 'demo'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Demo Stream
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setModelName('gemini-1.5-flash');
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  provider === 'gemini'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                Google Gemini
              </button>

              <button
                type="button"
                onClick={() => {
                  setProvider('openai');
                  setModelName('gpt-4o-mini');
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  provider === 'openai'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Key className="w-4 h-4 text-emerald-400" />
                OpenAI API
              </button>
            </div>
          </div>

          {/* Model selection if live API selected */}
          {provider !== 'demo' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Model Name</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
              >
                {provider === 'gemini' ? (
                  <>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Efficient)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Latest Next-Gen)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
                  </>
                ) : (
                  <>
                    <option value="gpt-4o-mini">gpt-4o-mini (Light & Fast)</option>
                    <option value="gpt-4o">gpt-4o (High Intelligence)</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* API Key Input if live API selected */}
          {provider !== 'demo' ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">
                  {provider === 'gemini' ? 'Google AI Studio API Key' : 'OpenAI Secret Key'}
                </label>
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'
                  }
                  className="w-full p-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Key stays private in your browser session & local API route call.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 space-y-1">
              <p className="font-semibold flex items-center gap-1 text-cyan-300">
                <Sparkles className="w-4 h-4" /> Zero-Setup Demo Mode Active
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Enjoy instant streaming LLM responses right away without needing to enter any external keys or environment variables.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
