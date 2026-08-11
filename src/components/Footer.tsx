'use client';

import React from 'react';
import { Cloud, Globe, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-2 px-4 text-center border-t border-slate-900 bg-slate-950/90 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
          <Cloud className="w-3.5 h-3.5 text-cyan-400" />
          Hosted on Google Cloud Run & Vercel
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <a
          href="https://github.com/noam2030/my-web-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-cyan-400 transition-colors text-slate-400"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>noam2030/my-web-app</span>
        </a>
        <span className="text-slate-700">•</span>
        <span className="flex items-center gap-1 text-purple-400 font-medium">
          <Sparkles className="w-3 h-3" /> Next.js AI Studio
        </span>
      </div>
    </footer>
  );
};
