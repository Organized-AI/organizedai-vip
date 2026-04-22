// Pi Agent — conversational agent over the LLM Wiki.
// Streams SSE back to the client. Uses Anthropic tool-use loop so Pi can read
// full entries on demand and emit "control" events that drive the UI.
//
// Required env var on Cloudflare Pages: ANTHROPIC_API_KEY

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2048;
const MAX_TURNS = 6;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Manifest of wiki entries. Pi sees this list in the system prompt — the cheap
// "what exists" lookup. Full content comes through the read_wiki_entry tool.
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

const TOOLS = [
  {
    name: 'read_wiki_entry',
    description: 'Fetch the full text content of a specific wiki entry. Use when you need details beyond the summary.',
    input_schema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'The slug of the entry (e.g. "claude", "qwen").' } },
      required: ['slug'],
    },
  },
  {
    name: 'open_wiki_entry',
    description: "Open a wiki entry in the user's preview pane. Use when the user should read the entry directly.",
    input_schema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'The slug of the entry to open.' } },
      required: ['slug'],
    },
  },
  {
    name: 'compare_wiki_entries',
    description: 'Open a side-by-side comparison of 2–3 wiki entries in the preview pane.',
    input_schema: {
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
];

function extractArticleText(html) {
  // Pull the <article>...</article> block, strip tags, collapse whitespace.
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
  const text = extractArticleText(html);
  return { slug, url: `/wiki/${slug}.html`, content: text };
}

async function executeTool(tool, origin) {
  if (tool.name === 'read_wiki_entry') {
    return await readWikiEntry(tool.input.slug, origin);
  }
  if (tool.name === 'open_wiki_entry') {
    if (!SLUGS.has(tool.input.slug)) return { error: `Unknown slug '${tool.input.slug}'` };
    return { opened: tool.input.slug, url: `/wiki/${tool.input.slug}.html`, message: 'Opened in user preview pane.' };
  }
  if (tool.name === 'compare_wiki_entries') {
    const unknown = (tool.input.slugs || []).filter(s => !SLUGS.has(s));
    if (unknown.length) return { error: `Unknown slugs: ${unknown.join(', ')}` };
    return { compared: tool.input.slugs, message: 'Opened comparison view.' };
  }
  return { error: `Unknown tool: ${tool.name}` };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet() {
  return Response.json({ manifest: WIKI_MANIFEST }, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY not configured on this deployment.' },
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
        const loop = [...userMessages];
        for (let turn = 0; turn < MAX_TURNS; turn++) {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: MODEL,
              max_tokens: MAX_TOKENS,
              system: SYSTEM_PROMPT,
              tools: TOOLS,
              messages: loop,
              stream: true,
            }),
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            emit({ type: 'error', message: `Anthropic API ${res.status}: ${errText.slice(0, 300)}` });
            break;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          const blocks = {};       // index → accumulated block
          const finalBlocks = [];  // in order of completion
          let stopReason = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6);
              if (!data.trim()) continue;
              let evt;
              try { evt = JSON.parse(data); } catch { continue; }

              if (evt.type === 'content_block_start') {
                blocks[evt.index] = { ...evt.content_block };
                if (evt.content_block.type === 'tool_use') {
                  blocks[evt.index].partial_json = '';
                  emit({ type: 'tool_call_start', name: evt.content_block.name, id: evt.content_block.id });
                }
              } else if (evt.type === 'content_block_delta') {
                const b = blocks[evt.index];
                if (!b) continue;
                if (evt.delta.type === 'text_delta') {
                  b.text = (b.text || '') + evt.delta.text;
                  emit({ type: 'text_delta', text: evt.delta.text });
                } else if (evt.delta.type === 'input_json_delta') {
                  b.partial_json += evt.delta.partial_json;
                }
              } else if (evt.type === 'content_block_stop') {
                const b = blocks[evt.index];
                if (!b) continue;
                if (b.type === 'tool_use') {
                  try { b.input = JSON.parse(b.partial_json || '{}'); } catch { b.input = {}; }
                  delete b.partial_json;
                  // Surface control-plane intent to the UI immediately.
                  if (b.name === 'open_wiki_entry' && b.input.slug && SLUGS.has(b.input.slug)) {
                    emit({ type: 'control', action: 'open_entry', slug: b.input.slug });
                  } else if (b.name === 'compare_wiki_entries' && Array.isArray(b.input.slugs)) {
                    const valid = b.input.slugs.filter(s => SLUGS.has(s));
                    if (valid.length >= 2) emit({ type: 'control', action: 'compare_entries', slugs: valid });
                  }
                  emit({ type: 'tool_call_end', name: b.name, input: b.input });
                }
                finalBlocks.push(b);
              } else if (evt.type === 'message_delta') {
                if (evt.delta?.stop_reason) stopReason = evt.delta.stop_reason;
              }
            }
          }

          loop.push({ role: 'assistant', content: finalBlocks });

          if (stopReason !== 'tool_use') break;

          // Execute tools, feed results back.
          const toolResults = [];
          for (const b of finalBlocks) {
            if (b.type !== 'tool_use') continue;
            const result = await executeTool(b, origin);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: b.id,
              content: typeof result === 'string' ? result : JSON.stringify(result),
            });
          }
          loop.push({ role: 'user', content: toolResults });
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
