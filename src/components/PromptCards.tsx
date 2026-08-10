'use client';

import React from 'react';
import { PromptSuggestion, Persona } from '@/lib/types';
import { Code2, BookOpen, Zap, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';

interface PromptCardsProps {
  suggestions: PromptSuggestion[];
  onSelectPrompt: (prompt: string) => void;
  activePersona: Persona;
}

export const PromptCards: React.FC<PromptCardsProps> = ({
  suggestions,
  onSelectPrompt,
  activePersona,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-5 h-5 text-cyan-400" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Lightbulb':
        return <Lightbulb className="w-5 h-5 text-pink-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto px-4 text-center space-y-8 my-auto">
      {/* Hero Badge */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10 animate-pulse-glow">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Active Mode: {activePersona.name}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          What can I help you <span className="gradient-text">create today?</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Ask any coding question, request creative concepts, or select a preset starter prompt below to experience live streaming LLM responses.
        </p>
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full text-left">
        {suggestions.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group relative p-4 rounded-2xl glass-card flex flex-col justify-between h-32 cursor-pointer border border-slate-800/80 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 group-hover:scale-110 transition-transform">
                {getIcon(item.icon)}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
