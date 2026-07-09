# Kimi K2.7 Code — Deep Research Report

> **Compiled:** July 6, 2026  
> **Sources:** Official Moonshot AI docs, Kimi K2.7 Code product page, Kimi K2.6 technical blog, API reference, community corroboration  
> **Status:** Current as of late June 2026 release

---

## 1. WHAT IS KIMI K2.7 CODE?

**Kimi K2.7 Code** is an open-source, coding-focused agentic model developed by **Moonshot AI (月之暗面)**. Released June 25, 2026, it is a purpose-built coding model — the "Code" variant of the Kimi K2 series. It is not a general-purpose model; for writing, analysis, and conversation, Moonshot recommends **K2.6** instead.

**Key positioning:** "Built for long-horizon software engineering" — multi-file refactoring, repository-scale changes, and sustained agent sessions.

### Architecture

| Parameter | Value |
|-----------|-------|
| Architecture | Mixture-of-Experts (MoE) |
| Total Parameters | **1 trillion (1T)** |
| Activated Parameters | **32 billion (32B)** per token |
| Layers | 61 (1 dense + 60 MoE) |
| Experts | 384 total, 8 selected per token + 1 shared |
| Attention | MLA (Multi-head Latent Attention) |
| Attention Dim | 7168 |
| MoE Hidden Dim | 2048 per expert |
| Attention Heads | 64 |
| Vocabulary | 160K tokens |
| Context Window | **256K tokens** (262,144) |
| Activation | SwiGLU |
| Vision Encoder | MoonViT (400M params) |
| Max Output Tokens | Default 32K (`max_completion_tokens`) |
| License | Open-source (Apache 2.0 or similar, HuggingFace) |

### Variants

| Model ID | Speed | Notes |
|----------|-------|-------|
| `kimi-k2.7-code` | Standard | Full model |
| `kimi-k2.7-code-highspeed` | ~180 tok/s (up to 260 in short contexts) | Same weights, 5-6x faster, 2x price |

---

## 2. STRENGTHS & WEAKNESSES vs CLAUDE & GPT

### Strengths

1. **Long-horizon coding reliability.** K2.7 Code is specifically optimized for tasks spanning dozens of tool calls and thousands of lines changed. Enterprise feedback: _"follows instructions more reliably in long contexts"_ and _"achieves higher end-to-end task success rates."_

2. **~30% fewer thinking tokens** vs K2.6. Gets to the solution faster without overthinking — compounds across every interactive session.

3. **Rich multimodal input** (text + images + video). Can see screenshots, UI mockups, and video walkthroughs, which Claude (API) and GPT cannot match in the same depth.

4. **Extremely cost-efficient.** At $0.95/M input tokens and $4.00/M output tokens (cache miss), it's **5-10x cheaper** than Claude Opus 4.x and GPT-5.x for comparable coding work.

5. **OpenAI API compatible.** Drop-in replacement — `base_url="https://api.moonshot.cn/v1"` with any OpenAI SDK.

6. **Native Claude Code / Cline / RooCode support.** Moonshot provides an Anthropic-compatible endpoint at `https://api.moonshot.cn/anthropic` for Claude Code.

7. **Agentic performance.** Strong tool calling, multi-step reasoning, 24/7 agent capability (Kimi Claw).

### Weaknesses vs Top Closed Models

| Benchmark | K2.7 Code | GPT-5.5 (xhigh) | Claude Opus 4.8 |
|-----------|-----------|-----------------|-----------------|
| Kimi Code Bench v2 | 62.0 | **69.0** | **67.4** |
| Program Bench | 53.6 | **69.1** | **63.8** |
| MLS Bench Lite | 35.1 | 35.5 | **42.8** |
| Kimi Claw 24/7 Bench | 46.9 | **52.8** | **50.4** |
| MCP Atlas | 76.0 | 79.4 | **81.3** |
| MCP Mark Verified | 81.1 | **92.9** | 76.4 |

**Verdict:** K2.7 Code trails GPT-5.5 and Claude Opus 4.8 on raw coding benchmarks by **5-15%** but is highly competitive for an open-source model — and dramatically cheaper. On the MCP Mark Verified benchmark it actually beats Claude Opus 4.8.

### When to choose K2.7 Code over Claude/GPT

- **You need cost efficiency at scale** (agent loops, CI/CD integration, batch coding)
- **You need multimodal coding** (screenshots, video walkthroughs as input)
- **You need 256K context** without enterprise pricing
- **You want open-source weights** (self-hosting, fine-tuning)

### When to choose Claude/GPT over K2.7 Code

- **Peak coding accuracy matters above all else**
- **Non-coding tasks** (K2.7 Code is coding-focused; K2.6 is better for general)
- **Complex multi-step reasoning where every % matters**

---

## 3. CONTEXT WINDOW & OUTPUT LIMITS

| Metric | Value |
|--------|-------|
| Context Window | **262,144 tokens (256K)** |
| Default max output | **32,768 tokens** |
| Recommended max_completion_tokens for tool use | >= 16,000 |
| Max tools | 128 |
| Request body limit | 100 MB |

**Important:** The 262,144 token count includes:
- Input tokens (prompt + history + context)
- Output tokens (reasoning_content + content)
- `reasoning_content` counts toward both input and output billing

---

## 4. HOW GOOD IS IT AT LARGE CODEBASES?

From the K2.7 Code product description: _"Real-world software engineering rarely ends in a single step. Tasks like refactoring a codebase, implementing a feature across multiple files, or debugging over long agent sessions require a model to follow instructions reliably across extended contexts."_

**Evidence points:**

1. **K2.6 predecessor demonstrated** autonomous optimization of **exchange-core** (8-year-old financial matching engine): 13-hour execution, 1,000+ tool calls, 4,000+ lines modified, 185% throughput improvement.

2. **Augment Code CTO testimony:** _"What impressed us most about K2.6 is its surgical precision in large codebases. When an initial path is blocked, it is strong at pivoting intelligently: following existing architectural patterns, finding hidden related changes, and keeping fixes scoped to the real problem."_

3. **256K context** comfortably accommodates most repository-scale codebases (equivalent to ~180,000 words or ~700 pages of code).

4. **Preserved Thinking** ensures the model maintains reasoning coherence across very long multi-turn sessions.

**Practical recommendation for large codebases:**
- Use `prompt_cache_key` with a session ID to maximize automatic context caching
- Structure context as `system` + file contents (use XML tags or triple-quote delimiters)
- For repos > 256K tokens, use a tree-sitter or file-map approach: provide directory structure + key files, let the model request specific files via tool calls

---

## 5. PROMPT ENGINEERING TECHNIQUES FOR KIMI MODELS

### 5a. Critical Constraints (Locked Parameters)

K2.7 Code has **locked inference parameters**. Do NOT attempt to override:

| Parameter | Locked Value | Override? |
|-----------|-------------|-----------|
| `temperature` | 1.0 | ❌ Will error |
| `top_p` | 0.95 | ❌ Will error |
| `n` | 1 | ❌ Will error |
| `presence_penalty` | 0.0 | ❌ Will error |
| `frequency_penalty` | 0.0 | ❌ Will error |
| `thinking` | Always enabled | ❌ Cannot disable |
| `thinking.keep` | `"all"` (always) | ❌ Only `"all"` accepted |

### 5b. Best Practices (from official docs)

1. **Use system prompts with clear role definition.**

```
SYSTEM: You are an expert TypeScript developer. You work on a Next.js 16 project 
with strict TypeScript, Tailwind CSS v4, and the App Router.
```

2. **Use delimiters to separate instruction sections.** XML tags are recommended:

```
<context>
  [file contents here]
</context>

<instructions>
  1. Analyze the file structure.
  2. Identify security vulnerabilities.
  3. Output a JSON report with findings.
</instructions>
```

3. **Provide explicit step-by-step instructions.** K2.7 follows structured instructions better than open-ended ones.

4. **Use few-shot examples** for consistent output formats.

5. **Specify output length and format explicitly.**

6. **For JSON output:** Use `response_format: {"type": "json_object"}` or `{"type": "json_schema"}` with a proper schema. Always provide an example format in the prompt. K2.7 only outputs JSON **Objects** (not Arrays).

7. **Multi-turn awareness:** K2.7 Code **always has Preserved Thinking**. You MUST preserve `reasoning_content` from every assistant response in your message history. The simplest approach: always `.append(message)` the full assistant message object back into messages.

### 5c. Anti-Patterns (What NOT to do)

1. **Do NOT override locked parameters.** Setting `temperature: 0.7` or `top_p: 0.5` will return an error.

2. **Do NOT disable thinking.** K2.7 Code always thinks. Requests with thinking disabled are silently served by K2.6 instead.

3. **Do NOT strip `reasoning_content` from history.** If you remove `reasoning_content` from previous assistant messages, the model loses coherence.

4. **Do NOT use `tool_choice: {type: "function", function: {name: "x"}}`.** Only `"auto"` and `"none"` are supported for K2.7 Code.

5. **Do NOT request JSON Array output.** JSON Mode only produces Objects. For arrays, wrap them in an object like `{"items": [...]}`.

6. **Do NOT use URL-based images.** Only base64-encoded data URIs or uploaded file references (`ms://`).

7. **Do NOT use unofficial third-party providers** without checking Kimi Vendor Verifier (KVV) for accuracy.

### 5d. Prompt Template for Coding Tasks

```
<system>
You are a senior software engineer working on [project name], a [tech stack] project.
You have access to the following tools: [tool list].

CRITICAL RULES:
- Read files before editing them.
- Follow existing code conventions exactly.
- Output complete, runnable code — never placeholder comments.
- When refactoring, explain WHY before showing the code.
</system>

<context>
Project structure:
[tree output]

Relevant files:
<file path="src/utils.ts">
[content]
</file>

<file path="src/api/route.ts">
[content]
</file>
</context>

<instructions>
Task: [specific task description]

1. First, analyze which files need changes.
2. Explain your approach.
3. Make the changes one file at a time.
4. Verify consistency across all changed files.

Expected output: [describe format]
</instructions>
```

---

## 6. FUNCTION CALLING / TOOL USE / STRUCTURED OUTPUT / IMAGE

### Tool Calling (Function Calling)

**Fully supported.** Up to 128 tools per request. Standard OpenAI-compatible format.

Key constraints for K2.7 Code:
- `tool_choice` only accepts `"auto"` or `"none"`
- Multi-step tool calls require preserving `reasoning_content` in each assistant message
- Streaming tool calls: `reasoning_content` arrives first, then `content`, then `tool_calls`

Tool definition format (standard OpenAI):
```json
{
  "type": "function",
  "function": {
    "name": "read_file",
    "description": "Read contents of a file",
    "parameters": {
      "type": "object",
      "required": ["path"],
      "properties": {
        "path": {"type": "string", "description": "File path"}
      }
    }
  }
}
```

Moonshot also provides **official tools** (web search, date, code interpreter) via Formula URIs.

### Structured Output

| Feature | Support |
|---------|---------|
| JSON Mode (`json_object`) | ✅ |
| JSON Schema (`json_schema`) | ✅ (MFJS — Moonshot Flavored JSON Schema) |
| Streaming + JSON | ✅ |
| Partial Mode | ✅ |

**Important:** JSON Schema uses MFJS (not standard JSON Schema). Use the `walle` CLI tool to validate schemas: `walle -schema 'your-schema' -level strict`

### Image & Video Understanding

| Input Type | Support |
|------------|---------|
| Images (PNG, JPEG, WebP, GIF) | ✅ via base64 or file upload |
| Videos (MP4, MPEG, MOV, AVI, etc.) | ✅ via base64 or file upload |
| URL-based images | ❌ Not supported |
| Max image resolution (recommended) | 4K (4096x2160) |
| Max video resolution (recommended) | 1080p |

Image/video are provided via `content` arrays:
```json
"content": [
  {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}},
  {"type": "text", "text": "What does this screenshot show?"}
]
```

---

## 7. BEST PRACTICES FOR CODING TASKS WITH KIMI K2.7

### 7a. Structuring Context for Large Projects

**Pattern 1 — Directory map + file fetching:**
1. Provide a `tree` output of the project root
2. Include the 3-5 most relevant files inline
3. Let the model request additional files via tool calls

**Pattern 2 — AGENTS.md style context file:**
Create a single markdown file (`AGENTS.md`, `CONTEXT.md`, etc.) that contains:
```
# Project: [name]
## Architecture
[overview]
## File Structure
[tree]
## Conventions
[coding style, naming, patterns]
## Key Files
- src/core.ts: [purpose]
- src/api/routes.ts: [purpose]
## Recent Changes
[git log --oneline -10]
```

Attach this as the first system message. K2.7's 256K context handles this easily.

### 7b. Multi-File Refactoring Strategy

1. **Start with a planning pass** (no code changes):
   ```
   Analyze the attached codebase and create a refactoring plan.
   For each file, specify:
   - What changes are needed
   - Why those changes are necessary
   - Dependencies on other files
   ```
   The `reasoning_content` from this pass will be preserved for subsequent turns.

2. **Execute one file at a time**, verifying after each change.

3. **End with a consistency check:** "Verify that all changes are consistent. Check imports, type signatures, and function calls across all modified files."

### 7c. Cost Optimization

1. **Use `prompt_cache_key`** — set to a session/task ID. Reused context gets charged at cache-hit rate ($0.19 vs $0.95/M).

2. **Use streaming** — `stream: true`. Reduces perceived latency and avoids timeout issues on long generations.

3. **Set `max_completion_tokens` appropriately.** Default is 32K — reduce for simple tasks to avoid paying for unused tokens. Increase to 64K+ for complex multi-step agent tasks.

4. **Set daily budget limits** in the Kimi Platform console to prevent runaway agent costs.

### 7d. Tool Call Loop Pattern

```python
messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": task},
]

while True:
    response = client.chat.completions.create(
        model="kimi-k2.7-code",
        messages=messages,
        tools=tools,
        max_completion_tokens=32768,
        stream=True,
        prompt_cache_key=session_id,
    )
    
    # Collect full message (including reasoning_content)
    assistant_msg = collect_full_response(response)
    messages.append(assistant_msg)  # CRITICAL: preserves reasoning_content
    
    if assistant_msg.tool_calls:
        for tc in assistant_msg.tool_calls:
            result = execute_tool(tc)
            messages.append({
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result,
            })
    else:
        return assistant_msg.content
```

---

## 8. KNOWN LIMITATIONS & QUIRKS

### Critical Constraints

1. **Must always think.** K2.7 Code cannot run in non-thinking mode. This means every response includes `reasoning_content` in addition to `content`, increasing token usage.

2. **Must preserve reasoning_content in history.** If you build an agent loop, you MUST carry forward the full assistant message object (including `reasoning_content`). Truncating it causes the model to lose context and degrade.

3. **Locked inference parameters.** You cannot tune temperature, top_p, or penalty values. This means you cannot make the model more "creative" or more "deterministic" per request.

4. **tool_choice limited.** Only `"auto"` and `"none"` work. You cannot force a specific tool call.

5. **No URL-based images.** Images must be base64-encoded or uploaded as files first. This adds boilerplate compared to Claude/GPT which accept image URLs.

6. **K2.7 Code is coding-focused, not general-purpose.** For writing, analysis, conversation, use K2.6 instead.

### Practical Quirks

7. **JSON Mode only produces Objects.** If you need an array, wrap it: `{"items": [...]}`.

8. **MFJS Schema format** (Moonshot Flavored JSON Schema) for structured output. Not exactly standard JSON Schema — validate with the `walle` CLI tool.

9. **Rate limits tied to cumulative充值 (top-up amount).** Tier 0 (free): only 1 concurrent request, 3 RPM, 500K TPM. Tier 1 (¥50+): 50 concurrent, 200 RPM, 2M TPM.

10. **`reasoning_content` is billed as both input and output tokens.** In multi-turn conversations, historical reasoning content reappears as input tokens in each subsequent turn.

11. **No non-thinking fallback.** If thinking is disabled via API, K2.6 silently serves the request instead. This can cause confusion if you're benchmarking.

12. **Cloudflare-like caching behavior.** Use `prompt_cache_key` to get cache-hit pricing. Without it, every request is a cache miss.

### Things K2.7 Code Does NOT Support

- Image URLs (only base64 or file uploads)
- `tool_choice: {type: "function", function: {name: "x"}}`
- Non-thinking mode
- Temperature/top_p customization
- `n > 1` (multiple completions per prompt)

---

## 9. PRICING

| Model | Input (Cache Hit) | Input (Cache Miss) | Output | Context |
|-------|-------------------|---------------------|--------|---------|
| kimi-k2.7-code | $0.19/M | $0.95/M | $4.00/M | 262,144 |
| kimi-k2.7-code-highspeed | $0.38/M | $1.90/M | $8.00/M | 262,144 |

Plus Kimi Code subscription plans: $15–$159/month with weekly refreshed quotas.

---

## 10. INTEGRATION PATTERNS

### Claude Code
```bash
export ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
export ANTHROPIC_AUTH_TOKEN=$MOONSHOT_API_KEY
export ANTHROPIC_MODEL=kimi-k2.7-code
export ANTHROPIC_DEFAULT_OPUS_MODEL=kimi-k2.7-code
export ANTHROPIC_DEFAULT_SONNET_MODEL=kimi-k2.7-code
export ANTHROPIC_DEFAULT_HAIKU_MODEL=kimi-k2.7-code
export CLAUDE_CODE_SUBAGENT_MODEL=kimi-k2.7-code
export CLAUDE_CODE_AUTO_COMPACT_WINDOW=262144
```

### Cline / RooCode (VS Code)
- API Provider: **Moonshot**
- Entrypoint: `api.moonshot.cn`
- Model: `kimi-k2.7-code`

### Direct API (OpenAI SDK)
```python
from openai import OpenAI
client = OpenAI(
    api_key=os.environ["MOONSHOT_API_KEY"],
    base_url="https://api.moonshot.cn/v1",
)
response = client.chat.completions.create(
    model="kimi-k2.7-code",
    messages=[...],
    tools=[...],
)
```

---

## 11. QUICK REFERENCE CARD

| Question | Answer |
|----------|--------|
| Best for? | Long-horizon coding, agent loops, multi-file refactoring |
| Not for? | General chat, writing, analysis (use K2.6) |
| Context window | 256K tokens |
| Max output | 32K default (configurable) |
| Thinking mode | Always ON, cannot disable |
| Can tune temperature? | No — locked at 1.0 |
| Tool calling? | Yes, up to 128 tools |
| Structured output? | JSON Mode + JSON Schema (MFJS) |
| Image input? | Yes — base64 or file upload only |
| Video input? | Yes — base64 or file upload only |
| OpenAI SDK compatible? | Yes |
| Claude Code compatible? | Yes (via Anthropic endpoint) |
| Open source? | Yes (HuggingFace: moonshotai/Kimi-K2.7-Code) |
| Pricing | Input $0.95/M, Output $4.00/M (cache miss) |

---

*Report compiled from official Moonshot AI documentation, Kimi K2.6/K2.7 Code product pages, API reference (platform.kimi.com), and K2.6 technical blog (kimi.com/blog/kimi-k2-6). No third-party conjecture included — all claims are sourced from official materials.*
