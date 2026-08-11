import { NextRequest } from 'next/server';
import { Message, ModelSettings } from '@/lib/types';
import { PERSONAS } from '@/lib/personas';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, settings }: { messages: Message[]; settings: ModelSettings } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lastUserMessage = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
    const activePersona = PERSONAS.find((p) => p.id === settings.personaId) || PERSONAS[0];

    // If custom API Key provided for Gemini
    if (settings.provider === 'gemini' && settings.apiKey) {
      return handleGeminiStream(messages, settings, activePersona.systemPrompt);
    }

    // If custom API Key provided for OpenAI
    if (settings.provider === 'openai' && settings.apiKey) {
      return handleOpenAIStream(messages, settings, activePersona.systemPrompt);
    }

    // Default fast & rich Demo Simulator Stream (Zero API Key needed)
    return handleDemoSimulatorStream(lastUserMessage, settings, activePersona);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('API Chat error:', err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Google Gemini API Stream Handler
async function handleGeminiStream(
  messages: Message[],
  settings: ModelSettings,
  systemPrompt: string
) {
  const model = settings.modelName || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${settings.apiKey}`;

  const contents = [
    { role: 'user', parts: [{ text: `System directive: ${systemPrompt}` }] },
    ...messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: settings.temperature ?? 0.7,
        maxOutputTokens: settings.maxTokens ?? 2048,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const encoder = new TextEncoder();
  const reader = res.body?.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      if (!reader) {
        controller.close();
        return;
      }
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += new TextDecoder().decode(value, { stream: true });
          
          // Parse JSON chunks from stream
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('"text":')) {
              const match = trimmed.match(/"text":\s*"([^"]+)"/);
              if (match) {
                controller.enqueue(encoder.encode(match[1].replace(/\\n/g, '\n')));
              }
            } else if (trimmed.includes('"text"')) {
              try {
                const parsed = JSON.parse(trimmed.replace(/^,/, ''));
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) controller.enqueue(encoder.encode(text));
              } catch {
                // Ignore JSON parse errors for incomplete stream chunks
              }
            }
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}

// OpenAI API Stream Handler
async function handleOpenAIStream(
  messages: Message[],
  settings: ModelSettings,
  systemPrompt: string
) {
  const model = settings.modelName || 'gpt-4o-mini';
  const url = 'https://api.openai.com/v1/chat/completions';

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      temperature: settings.temperature ?? 0.7,
      max_tokens: settings.maxTokens ?? 2048,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API Error (${res.status}): ${errText}`);
  }

  const encoder = new TextEncoder();
  const reader = res.body?.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      if (!reader) {
        controller.close();
        return;
      }
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += new TextDecoder().decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                  controller.enqueue(encoder.encode(token));
                }
              } catch {
                // Ignore JSON parse errors for incomplete stream chunks
              }
            }
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}

// Built-in Demo Simulator Stream (Intelligent contextual streaming response without requiring an API Key)
function handleDemoSimulatorStream(
  prompt: string,
  settings: ModelSettings,
  persona: (typeof PERSONAS)[0]
) {
  const responseText = generateSmartDemoResponse(prompt, persona.id);

  const encoder = new TextEncoder();
  // Safe word-token chunking to preserve multi-byte UTF-8 emojis (e.g. 👋, 💻, ⚡) without splitting surrogate pairs
  const chunks = responseText.split(/(?<=\s)/);

  let index = 0;
  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(() => {
        if (index < chunks.length) {
          controller.enqueue(encoder.encode(chunks[index]));
          index++;
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 35); // smooth 35ms word streaming interval
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}

function generateSmartDemoResponse(prompt: string, personaId: string): string {
  const lower = prompt.toLowerCase().trim();

  // Friendly greeting check
  if (/^(hello|hi|hey|greetings|howdy|good morning|good afternoon|good evening|who are you|how are you)/i.test(lower)) {
    return `Hello! 👋 Welcome to **Gemini LLM Studio**.

How can I assist you today? Here are a few things you can ask me:
* 💻 **Software Architecture & Code**: Write TypeScript hooks, refactor loops, or build features.
* ⚡ **Technical Explanations**: Explain complex topics like Quantum Computing, state machines, or APIs.
* 💡 **Creative Ideas**: Brainstorm brand concepts, UX copy, or app features.

> **Tip**: You can switch system personas in the left sidebar or plug in your own Google Gemini / OpenAI API key in **Settings** for live AI inference!`;
  }

  if (lower.includes('hook') || lower.includes('react') || lower.includes('fetch')) {
    return `Here is a production-ready custom React hook in **TypeScript** featuring automatic loading state management, error handling, and manual re-fetching:

\`\`\`typescript
import { useState, useEffect, useCallback } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetch<T>(url: string): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
\`\`\`

### Usage Example:
\`\`\`tsx
const UserProfile = () => {
  const { data: user, loading, error, refetch } = useFetch('/api/user/123');

  if (loading) return <div className="animate-pulse">Loading profile...</div>;
  if (error) return <div className="text-red-400">Error: {error.message}</div>;

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <button onClick={refetch}>Refresh Data</button>
    </div>
  );
};
\`\`\`

> **Pro Tip**: Notice how \`useCallback\` prevents infinite re-render cycles when passing the URL parameter!`;
  }

  if (lower.includes('quantum') || lower.includes('physics') || lower.includes('explain')) {
    return `### Understanding Quantum Computing in Simple Terms

Imagine a traditional computer is like an ordinary **light switch**.
* It can only be in one of two positions: **OFF (0)** or **ON (1)**.

A **Quantum Computer**, on the other hand, operates using **Qubits** (Quantum Bits):

1. 🌌 **Superposition**:
   Think of a spinning coin. While it's spinning in mid-air, it's not strictly Heads (1) or Tails (0)—it's a blend of **both probabilities simultaneously**. A qubit can hold 0, 1, or any continuous state in between until measured!

2. 🔗 **Entanglement**:
   Imagine two magical dice. When you roll them, no matter how far apart they are (even across galaxies), if one lands on a 6, the other *instantly* lands on a 6. Entangled qubits share state instantaneously.

3. ⚡ **Parallel Processing Power**:
   - 2 bits can represent **1** combination at a time out of 4 options (00, 01, 10, 11).
   - 2 qubits in superposition can process **all 4 combinations at the same time**.

\`\`\`
Classical Bit:  [ 0 ] or [ 1 ]  -> Sequential calculation
Quantum Qubit:   ( 0 + 1 )     -> Multi-dimensional parallel computation
\`\`\`

*Would you like to explore how quantum cryptography or Shor's algorithm works next?*`;
  }

  if (lower.includes('optimize') || lower.includes('performance') || lower.includes('loop')) {
    return `### High-Performance JavaScript Data Operations

When handling datasets with tens of thousands of items, chaining \`.filter().map()\` creates multiple intermediate arrays, causing **garbage collection lag**.

Here are 3 key optimizations:

#### 1. Combine Filter & Map into a Single Pass
\`\`\`typescript
// ❌ Inefficient: Creates 2 arrays & iterates twice
const activeUserNames = users
  .filter(user => user.isActive)
  .map(user => user.name);

// ✅ Optimized: Single pass using Array.reduce()
const activeUserNamesFast = users.reduce<string[]>((acc, user) => {
  if (user.isActive) {
    acc.push(user.name);
  }
  return acc;
}, []);
\`\`\`

#### 2. Pre-allocate Memory for Huge Datasets
If you know the size upfront, use a indexed \`for\` loop instead of higher-order array methods for up to **3x speedup**:

\`\`\`typescript
const len = users.length;
const result = [];
for (let i = 0; i < len; i++) {
  const user = users[i];
  if (user.isActive) {
    result.push(user.name);
  }
}
\`\`\`

| Approach | Memory Usage | Execution Time (100k items) |
| :--- | :--- | :--- |
| Chained \`.filter().map()\` | ~18.4 MB | ~14.2 ms |
| Combined \`.reduce()\` | ~8.1 MB | ~5.8 ms |
| Optimized \`for\` Loop | **~4.2 MB** | **~2.1 ms** |`;
  }

  if (lower.includes('israel') && (lower.includes('capital') || lower.includes('city'))) {
    return `### Capital of Israel

**Jerusalem** is the capital of Israel.

* 📜 **Historical & Cultural Importance**: It is one of the oldest cities in the world and holds profound historical, cultural, and spiritual significance.
* 🏛️ **Seat of Government**: Jerusalem serves as the administrative capital of Israel, hosting its primary government institutions including the **Knesset** (parliament), the **Supreme Court**, and the official residences of the Prime Minister and President.

> **Tip**: Plug in your Google Gemini or OpenAI API key in **Settings** anytime to get live real-time LLM inference for any question!`;
  }

  // Persona specific fallback response
  if (personaId === 'coder') {
    return `### Analysis & Solution for: "${prompt}"

Here is a structured technical response:

1. 🎯 **Requirement Analysis**: Addressing "${prompt}" with clean, maintainable architecture.
2. ⚡ **Implementation Best Practices**: Ensuring type safety, performance, and low memory consumption.

\`\`\`typescript
// Solution snippet for: ${prompt.substring(0, 40)}
export function handleRequest(input: string): { status: string; result: string } {
  if (!input.trim()) {
    return { status: 'error', result: 'Input cannot be empty' };
  }

  return {
    status: 'success',
    result: \`Processed: \${input}\`
  };
}
\`\`\`

> **Note**: For live real-time LLM responses to any complex prompt, toggle to **Google Gemini** or **OpenAI** in the **Settings** menu!`;
  }

  if (personaId === 'creative') {
    return `✨ **Creative Perspective on: "${prompt}"**

That's a great topic to explore! Here is an imaginative breakdown:

### 🌟 Core Angle
> *"Great ideas begin at the intersection of curiosity and perspective."*

### 💡 3 Key Ideas:
1. **Interactive Storytelling**: Elevating the concept through user engagement.
2. **Visual Impact**: Pairing bold imagery with concise, memorable messaging.
3. **Future Vision**: Anticipating how this evolves over the next 5 years.

Feel free to refine this concept or switch system personas in the left sidebar!`;
  }

  return `### Response to: "${prompt}"

Here are the key takeaways and structured breakdown:

1. 🎯 **Core Concept**: Addressing the main question with clarity and precision.
2. ⚡ **Key Factors**: Ensuring robust implementation and high usability.
3. 🔒 **Best Practices**: Following standard design guidelines and maintainability.

> **Tip**: You can enter your own Google Gemini or OpenAI API key in **Settings** for live AI inference!`;
}
