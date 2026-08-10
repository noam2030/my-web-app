'use client';

import React from 'react';
import { ModelSettings } from '@/lib/types';
import { PERSONAS } from '@/lib/personas';
import {
  Sparkles,
  Sliders,
  Trash2,
  Settings,
  Code2,
  Zap,
  GraduationCap,
  Bot,
  Key,
  Flame,
  Layers,
  X
} from 'lucide-react';

interface SidebarProps {
  settings: ModelSettings;
  onUpdateSettings: (newSettings: Partial<ModelSettings>) => void;
  onClearChat: () => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  onUpdateSettings,
  onClearChat,
  onOpenSettings,
  isOpen,
  onCloseMobile,
}) => {
  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-80 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col justify-between p-5 text-slate-200`}
    >
      {/* Top Header */}
      <div className="space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight gradient-text">
                Gemini LLM Studio
              </h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Next.js AI Chat
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" /> System Persona
            </span>
          </div>

          <div className="space-y-2">
            {PERSONAS.map((persona) => {
              const isSelected = settings.personaId === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => onUpdateSettings({ personaId: persona.id })}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? `bg-gradient-to-tr ${persona.badgeColor} text-white`
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {getPersonaIcon(persona.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {persona.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug mt-0.5">
                      {persona.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Hyperparameters */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" /> Model Parameters
            </span>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1 text-slate-400">
                <Flame className="w-3 h-3 text-amber-400" /> Temperature:
              </span>
              <span className="text-cyan-400 font-bold">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Precise (0.0)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          {/* Max Tokens Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1 text-slate-400">
                <Layers className="w-3 h-3 text-purple-400" /> Max Length:
              </span>
              <span className="text-purple-400 font-bold">{settings.maxTokens} tokens</span>
            </div>
            <input
              type="range"
              min="256"
              max="4096"
              step="256"
              value={settings.maxTokens}
              onChange={(e) => onUpdateSettings({ maxTokens: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        {/* Active Provider Badge */}
        <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium text-slate-300">Provider:</span>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 capitalize font-semibold">
            {settings.provider === 'demo' ? '⚡ Demo Mode' : settings.provider}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs font-semibold"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            Settings
          </button>
          <button
            onClick={onClearChat}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-300 hover:text-red-200 border border-red-900/40 transition-all text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            Clear
          </button>
        </div>
      </div>
    </aside>
  );
};
