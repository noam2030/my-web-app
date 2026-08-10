'use client';

import React, { useState } from 'react';
import { Message, Persona } from '@/lib/types';
import { User, Copy, Check, Sparkles, Terminal, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  persona?: Persona;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, persona }) => {
  const isUser = message.role === 'user';
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const handleCopyText = (text: string, index?: number) => {
    navigator.clipboard.writeText(text);
    if (index !== undefined) {
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } else {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  // Helper to parse content into formatted text & code blocks
  const renderFormattedContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let codeCounter = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }

      const lang = match[1] || 'code';
      const code = match[2].trim();
      parts.push({ type: 'code', lang, code, index: codeCounter++ });

      lastIndex = match.index + match[0].length;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText) {
      parts.push({ type: 'text', content: remainingText });
    }

    return parts.map((part, i) => {
      if (part.type === 'code') {
        return (
          <div key={i} className="my-3 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/90 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                {part.lang}
              </span>
              <button
                onClick={() => handleCopyText(part.code!, part.index)}
                className="flex items-center gap-1 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded"
              >
                {copiedCodeIndex === part.index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
              <code>{part.code}</code>
            </pre>
          </div>
        );
      }

      // Simple markdown inline text parsing (bold, lists, blockquotes)
      const lines = (part.content || '').split('\n');
      return (
        <div key={i} className="space-y-2">
          {lines.map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return <h3 key={lIdx} className="text-base font-bold text-slate-100 mt-3 mb-1">{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={lIdx} className="text-lg font-extrabold text-cyan-300 mt-4 mb-2">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('* ') || line.startsWith('- ')) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2">
                  <span className="text-cyan-400 text-xs mt-1.5">•</span>
                  <span>{formatInlineMarkdown(line.substring(2))}</span>
                </div>
              );
            }
            if (line.startsWith('> ')) {
              return (
                <blockquote key={lIdx} className="border-l-2 border-cyan-500/80 pl-3 py-1 my-2 bg-cyan-950/20 rounded-r text-cyan-200 italic text-sm">
                  {formatInlineMarkdown(line.replace('> ', ''))}
                </blockquote>
              );
            }
            return <p key={lIdx} className="leading-relaxed">{formatInlineMarkdown(line)}</p>;
          })}
        </div>
      );
    });
  };

  const formatInlineMarkdown = (text: string) => {
    // Bold: **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all ${
        isUser
          ? 'bg-slate-900/60 border border-slate-800/80 ml-auto max-w-[88%] sm:max-w-[80%]'
          : message.error
          ? 'bg-red-950/30 border border-red-800/50 text-red-200'
          : 'bg-slate-900/80 border border-slate-800/90 shadow-lg'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white'
            : message.error
            ? 'bg-red-900/80 text-red-300'
            : `bg-gradient-to-tr ${persona?.badgeColor || 'from-purple-600 to-indigo-600'} text-white`
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5" />
        ) : message.error ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <Sparkles className="w-5 h-5 animate-pulse" />
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 overflow-hidden space-y-1">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium text-slate-300">
            {isUser ? 'You' : persona?.name || 'AI Assistant'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">{message.timestamp}</span>
            {!isUser && (
              <button
                onClick={() => handleCopyText(message.content)}
                className="hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800"
                title="Copy entire message"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-sm text-slate-200 font-sans space-y-2">
          {renderFormattedContent(message.content)}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};
