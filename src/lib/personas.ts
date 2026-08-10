import { Persona, PromptSuggestion } from './types';

export const PERSONAS: Persona[] = [
  {
    id: 'coder',
    name: 'Code Architect',
    title: 'Senior Software Engineer & Architect',
    description: 'Expert in full-stack clean code, system architecture, performance, & debugging.',
    iconName: 'Code2',
    badgeColor: 'from-blue-500 to-cyan-400',
    systemPrompt: `You are an elite Senior Code Architect and Software Engineer. Provide clean, well-structured, production-ready code snippets with concise explanations. Format code using markdown blocks with language tags.`
  },
  {
    id: 'expert',
    name: 'Concise Expert',
    title: 'Direct & Technical Specialist',
    description: 'Delivers bulleted, high-density facts without fluff or unnecessary padding.',
    iconName: 'Zap',
    badgeColor: 'from-amber-400 to-orange-500',
    systemPrompt: `You are a Concise Technical Expert. Answer immediately, accurately, and with maximum density of useful information. Use bullet points and code blocks where helpful.`
  },
  {
    id: 'creative',
    name: 'Creative Spark',
    title: 'Ideas, Copywriting & Storytelling',
    description: 'Generates imaginative concepts, persuasive copy, and engaging stories.',
    iconName: 'Sparkles',
    badgeColor: 'from-purple-500 to-pink-500',
    systemPrompt: `You are Creative Spark, an imaginative ideas strategist, copywriter, and creative thinker. Provide captivating, vivid, and memorable responses.`
  },
  {
    id: 'tutor',
    name: 'Socratic Tutor',
    title: 'Interactive Learning Companion',
    description: 'Breaks down complex topics simply with analogies and encouraging step-by-step guidance.',
    iconName: 'GraduationCap',
    badgeColor: 'from-emerald-400 to-teal-500',
    systemPrompt: `You are a patient, encouraging Socratic Tutor. Break down complex topics into clear, easy-to-understand concepts using real-world analogies.`
  }
];

export const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: '1',
    title: 'React Custom Hook',
    subtitle: 'Write a TypeScript hook for fetching & caching API data',
    prompt: 'Create a reusable TypeScript React hook named `useFetch` with loading state, error handling, and manual re-fetch trigger.',
    category: 'code',
    icon: 'Code2'
  },
  {
    id: '2',
    title: 'Explain Quantum Computing',
    subtitle: 'High level overview with a relatable physical analogy',
    prompt: 'Explain the core principles of quantum computing (superposition and entanglement) to someone with no physics background using an intuitive analogy.',
    category: 'explain',
    icon: 'BookOpen'
  },
  {
    id: '3',
    title: 'Refactor Code Performance',
    subtitle: 'Identify bottlenecks and optimize JavaScript loops',
    prompt: 'How can I optimize large dataset filtering and mapping operations in JavaScript/TypeScript for maximum performance and low memory consumption?',
    category: 'code',
    icon: 'Zap'
  },
  {
    id: '4',
    title: 'Brainstorm App Features',
    subtitle: 'Innovative ideas for an AI productivity app',
    prompt: 'Give me 5 unique, standout AI-driven features for a modern personal knowledge management app.',
    category: 'creative',
    icon: 'Lightbulb'
  }
];
