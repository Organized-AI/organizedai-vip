// Pi Agent — conversational agent over the LLM Wiki.
// Streams SSE back to the client. Uses OpenAI-compatible Chat Completions
// with a Codex OAuth Bearer token, so Hermes can be served from anywhere
// that speaks that protocol (self-hosted vLLM, proxy, hosted provider).
//
// Required env vars on Cloudflare Pages:
//   CODEX_OAUTH_TOKEN — Bearer token issued by the Codex OAuth flow
//   HERMES_API_URL    — e.g. https://api.openai.com/v1/chat/completions
//                       or a Claw Mac Mini gateway URL exposed via CF Tunnel
// Optional:
//   HERMES_MODEL      — model string passed to the endpoint (default "hermes-4")

const DEFAULT_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'hermes-4';
const MAX_TOKENS = 2048;
const MAX_TURNS = 6;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Manifest of wiki entries — Pi sees this in the system prompt as the cheap
// "what exists" lookup; full content comes through the read_wiki_entry tool.
const WIKI_MANIFEST = [
  // Frontier · Closed Weights
  { slug: 'claude',   title: 'Claude',   vendor: 'Anthropic',     category: 'Frontier',
    summary: 'Constitutional AI. Tool use, prompt caching, extended thinking. Opus/Sonnet/Haiku tiers.' },
  { slug: 'gpt',      title: 'GPT',      vendor: 'OpenAI',        category: 'Frontier',
    summary: 'Flagship + o-series reasoning. Broadest ecosystem. Azure OpenAI for enterprise.' },
  { slug: 'gemini',   title: 'Gemini',   vendor: 'Google',        category: 'Frontier',
    summary: 'Natively multimodal. 1M+ token context. Vertex AI and Workspace integration.' },
  { slug: 'pi',       title: 'Pi',       vendor: 'Inflection AI', category: 'Frontier',
    summary: 'Personal-intelligence agent. Conversational warmth, long memory, voice-forward. Enterprise post-MSFT.' },
  { slug: 'nova',     title: 'Nova',     vendor: 'Amazon',        category: 'Frontier',
    summary: 'Bedrock-native. Pro/Lite/Micro/Canvas/Reel. Aggressive cost tiers, AWS-lock-in.' },

  // Open Weights · Self-Hostable
  { slug: 'llama',    title: 'Llama',    vendor: 'Meta',           category: 'Open Weights',
    summary: 'Reference open-weights family. Llama 4 (Scout/Maverick/Behemoth). Llama Community License.' },
  { slug: 'qwen',     title: 'Qwen',     vendor: 'Alibaba',        category: 'Open Weights',
    summary: 'Qwen3, Qwen3-Coder. Best open coding model. Qwen-Agent framework. Apache 2.0.' },
  { slug: 'mistral',  title: 'Mistral',  vendor: 'Mistral AI',     category: 'Open Weights',
    summary: 'European lab. Mixtral MoE, Codestral. EU hosting and GDPR-native tooling.' },
  { slug: 'deepseek', title: 'DeepSeek', vendor: 'DeepSeek',       category: 'Open Weights',
    summary: 'DeepSeek-R1 — first open reasoning at o1-class. V3 flagship. MIT license, cheap hosted.' },
  { slug: 'grok',     title: 'Grok',     vendor: 'xAI',            category: 'Open Weights',
    summary: 'Real-time X integration. Grok 4, Grok Code Fast. Grok-1 weights open; current flagship API-only.' },
  { slug: 'hermes',   title: 'Hermes',   vendor: 'Nous Research',  category: 'Open Weights',
    summary: 'Fine-tune line. Best open function calling. Steerable alignment, YaRN long context.' },
  { slug: 'kimi',     title: 'Kimi',     vendor: 'Moonshot AI',    category: 'Open Weights',
    summary: 'K2 trillion-param open MoE. K1.5 reasoning. Pioneered 2M-token context in Kimi Chat.' },
  { slug: 'command',  title: 'Command',  vendor: 'Cohere',         category: 'Open Weights',
    summary: 'RAG-first enterprise line. Cited answers, multilingual. Embed + Rerank stack.' },
  { slug: 'phi',      title: 'Phi',      vendor: 'Microsoft',      category: 'Open Weights',
    summary: 'Small reasoning-dense models. 1B–14B. MIT licensed. On-device and edge default.' },
  { slug: 'gemma',    title: 'Gemma',    vendor: 'Google',         category: 'Open Weights',
    summary: 'Open-weights from Gemini research. 1B–27B. Multimodal Gemma 3. ShieldGemma moderation.' },
  { slug: 'olmo',     title: 'OLMo',     vendor: 'Allen AI',       category: 'Open Weights',
    summary: 'Fully open: weights, data (Dolma), code, checkpoints. Apache 2.0. Reproducible research.' },

  // Agent Runtimes & Stacks
  { slug: 'openclaw',  title: 'OpenClaw',  vendor: 'Organized AI',           category: 'Runtime',
    summary: 'Flagship Claw runtime. TypeScript, 50+ integrations, Qwen-Agent, Mac Mini edge, Slack control plane.' },
  { slug: 'nanoclaw',  title: 'NanoClaw',  vendor: 'Organized AI',           category: 'Runtime',
    summary: 'Python, Claude Agent SDK. Per-tool-call container sandbox. Security-first, multi-channel.' },
  { slug: 'microclaw', title: 'MicroClaw', vendor: 'Organized AI',           category: 'Runtime',
    summary: 'Rust multi-channel chat runtime. Durable session state, layered memory, provider arbitrage.' },
  { slug: 'picoclaw',  title: 'PicoClaw',  vendor: 'Organized AI · Sipeed',  category: 'Runtime',
    summary: 'Go, <10MB RAM. IoT/embedded. Agent protocol on-device, inference upstream.' },
  { slug: 'zeroclaw',  title: 'ZeroClaw',  vendor: 'Organized AI',           category: 'Runtime',
    summary: '3.4MB Rust binary, sub-10ms start, 22 providers. Serverless/edge/sidecar minimalism.' },
  { slug: 'exoclaw',   title: 'ExoClaw',   vendor: 'Organized AI',           category: 'Runtime',
    summary: 'Managed cloud Claw. WASM sandbox, 100+ AgentSkills, <60s deploy. Web control plane.' },

  // Integrations & Recipes
  { slug: 'pi-llm',    title: 'Pi × LLM',  vendor: 'Claw Mac Mini',          category: 'Recipe',
    summary: 'Raspberry Pi client → Hermes agent gateway on Claw Mac Mini. Tailscale, wiki-as-tool, scoped keys.' },
];

const SLUGS = new Set(WIKI_MANIFEST.map(e => e.slug));

const SYSTEM_PROMPT = `You are Pi, the agent for the Organized AI LLM Wiki at organized-ai-hub.pages.dev.
You help users explore, compare, and understand the wiki entries.

## Wiki entries available

${WIKI_MANIFEST.map(e => `- \`${e.slug}\` — **${e.title}** (${e.vendor}, ${e.category}): ${e.summary}`).join('\n')}

## Tools

- **read_wiki_entry(slug)** — fetch the full text of a specific entry. Use when a user asks for detail beyond the summary.
- **open_wiki_entry(slug)** — open an entry in the user's preview pane so they can read it themselves. Prefer this when the user wants to read an entry.
- **compare_wiki_entries(slugs)** — open a side-by-side comparison view. Use for "X vs Y" questions.

## Style

- Be concise. Most answers should fit in 2–4 short paragraphs.
- When you reference an entry, cite it inline like [Claude](/wiki/claude.html) so the slug is visible.
- Prefer **opening** an entry for the user (via tool) over quoting long passages back to them.
- If the user asks for a recommendation, be opinionated. State your pick and the one tradeoff that matters.
- Match the site's tone: technical, direct, no fluff.`;

// OpenAI-compatible tool schema (same shape Hermes / vLLM / OpenRouter / OAI speak).
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'read_wiki_entry',
      description: 'Fetch the full text content of a specific wiki entry. Use when you need details beyond the summary.',
      parameters: {
        type: 'object',
        properties: { slug: { type: 'string', description: 'The slug of the entry (e.g. "claude", "qwen").' } },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'open_wiki_entry',
      description: "Open a wiki entry in the user's preview pane. Use when the user should read the entry directly.",
      parameters: {
        type: 'object',
        properties: { slug: { type: 'string', description: 'The slug of the entry to open.' } },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'compare_wiki_entries',
      description: 'Open a side-by-side comparison of 2–3 wiki entries in the preview pane.',
      parameters: {
        type: 'object',
        properties: {
          slugs: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 3,
            description: 'The slugs to compare.',
          },
        },
        required: ['slugs'],
      },
    },
  },
];

function extractArticleText(html) {
  const match = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const raw = match ? match[1] : html;
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&larr;/g, '←')
    .replace(/&rarr;/g, '→')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readWikiEntry(slug, origin) {
  if (!SLUGS.has(slug)) return { error: `Unknown slug '${slug}'. Known slugs: ${[...SLUGS].join(', ')}` };
  const res = await fetch(`${origin}/wiki/${slug}.html`);
  if (!res.ok) return { error: `Failed to fetch entry '${slug}' (HTTP ${res.status})` };
  const html = await res.text();
  return { slug, url: `/wiki/${slug}.html`, content: extractArticleText(html) };
}

async function executeTool(name, input, origin) {
  if (name === 'read_wiki_entry') {
    return await readWikiEntry(input.slug, origin);
  }
  if (name === 'open_wiki_entry') {
    if (!SLUGS.has(input.slug)) return { error: `Unknown slug '${input.slug}'` };
    return { opened: input.slug, url: `/wiki/${input.slug}.html`, message: 'Opened in user preview pane.' };
  }
  if (name === 'compare_wiki_entries') {
    const unknown = (input.slugs || []).filter(s => !SLUGS.has(s));
    if (unknown.length) return { error: `Unknown slugs: ${unknown.join(', ')}` };
    return { compared: input.slugs, message: 'Opened comparison view.' };
  }
  return { error: `Unknown tool: ${name}` };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet() {
  return Response.json({ manifest: WIKI_MANIFEST }, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const token = context.env.CODEX_OAUTH_TOKEN;
  const apiUrl = context.env.HERMES_API_URL || DEFAULT_API_URL;
  const model = context.env.HERMES_MODEL || DEFAULT_MODEL;

  if (!token) {
    return Response.json(
      { error: 'CODEX_OAUTH_TOKEN not configured on this deployment.' },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  let body;
  try { body = await context.request.json(); } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS });
  }

  const userMessages = Array.isArray(body.messages) ? body.messages : null;
  if (!userMessages || userMessages.length === 0) {
    return Response.json({ error: 'messages[] required' }, { status: 400, headers: CORS_HEADERS });
  }

  const origin = new URL(context.request.url).origin;

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const emit = (event) => controller.enqueue(enc.encode(`data: ${JSON.stringify(event)}\n\n`));

      try {
        // Seed the loop with system prompt + the messages the client sent.
        // Client sends simplified {role:'user'|'assistant', content:[{type:'text', text}]}
        // — normalize to OpenAI's plain-string content form.
        const loop = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...userMessages.map(m => {
            if (typeof m.content === 'string') return m;
            const text = Array.isArray(m.content)
              ? m.content.filter(c => c.type === 'text').map(c => c.text).join('')
              : '';
            return { role: m.role, content: text };
          }),
        ];

        for (let turn = 0; turn < MAX_TURNS; turn++) {
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              max_tokens: MAX_TOKENS,
              tools: TOOLS,
              tool_choice: 'auto',
              messages: loop,
              stream: true,
            }),
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            emit({ type: 'error', message: `Hermes API ${res.status}: ${errText.slice(0, 300)}` });
            break;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          let contentText = '';
          const toolCalls = {};      // index → { id, name, arguments_str }
          const toolCallOrder = [];  // preserve order of first appearance by index
          let finishReason = null;

          outer: while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (!data) continue;
              if (data === '[DONE]') break outer;

              let evt;
              try { evt = JSON.parse(data); } catch { continue; }
              const choice = evt.choices?.[0];
              if (!choice) continue;
              const delta = choice.delta || {};

              if (typeof delta.content === 'string' && delta.content.length) {
                contentText += delta.content;
                emit({ type: 'text_delta', text: delta.content });
              }

              if (Array.isArray(delta.tool_calls)) {
                for (const tc of delta.tool_calls) {
                  const idx = tc.index ?? 0;
                  if (!toolCalls[idx]) {
                    toolCalls[idx] = { id: tc.id || null, name: '', arguments_str: '' };
                    toolCallOrder.push(idx);
                    emit({ type: 'tool_call_start', name: tc.function?.name || '', id: tc.id || null });
                  }
                  const slot = toolCalls[idx];
                  if (tc.id && !slot.id) slot.id = tc.id;
                  if (tc.function?.name) slot.name += tc.function.name;
                  if (tc.function?.arguments) slot.arguments_str += tc.function.arguments;
                }
              }

              if (choice.finish_reason) finishReason = choice.finish_reason;
            }
          }

          // Record the assistant turn for loop continuation.
          const assistantMsg = { role: 'assistant', content: contentText || null };
          if (toolCallOrder.length) {
            assistantMsg.tool_calls = toolCallOrder.map(idx => {
              const t = toolCalls[idx];
              return {
                id: t.id || `call_${idx}`,
                type: 'function',
                function: { name: t.name, arguments: t.arguments_str || '{}' },
              };
            });
          }
          loop.push(assistantMsg);

          if (finishReason !== 'tool_calls' || toolCallOrder.length === 0) break;

          // Execute each tool, emit control events for UI, feed results back.
          for (const idx of toolCallOrder) {
            const t = toolCalls[idx];
            let input = {};
            try { input = JSON.parse(t.arguments_str || '{}'); } catch {}

            if (t.name === 'open_wiki_entry' && input.slug && SLUGS.has(input.slug)) {
              emit({ type: 'control', action: 'open_entry', slug: input.slug });
            } else if (t.name === 'compare_wiki_entries' && Array.isArray(input.slugs)) {
              const valid = input.slugs.filter(s => SLUGS.has(s));
              if (valid.length >= 2) emit({ type: 'control', action: 'compare_entries', slugs: valid });
            }
            emit({ type: 'tool_call_end', name: t.name, input });

            const result = await executeTool(t.name, input, origin);
            loop.push({
              role: 'tool',
              tool_call_id: t.id || `call_${idx}`,
              content: typeof result === 'string' ? result : JSON.stringify(result),
            });
          }
        }

        emit({ type: 'done' });
      } catch (err) {
        emit({ type: 'error', message: String(err && err.message || err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
