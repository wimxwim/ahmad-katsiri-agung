# Deploy Hermes Agent on Railway (Gateway Mode)

Run Hermes 24/7 as a Railway service — connected to Telegram, Discord, WhatsApp,
or any messaging platform Hermes supports.

## When This Reference is Needed

- User wants Hermes online 24/7 without keeping their local machine on
- User wants to use a fresh Railway account's free trial ($5 credit / 30 days)
- User wants a separate Hermes instance for different tasks / profiles
- User asks "can I run Hermes on Railway?"

## Approach

Hermes runs in **gateway mode** (`hermes gateway run`) — a long-lived process
that stays connected to messaging platforms. Railway auto-restarts services that
exit, so even if Hermes crashes, it comes back automatically.

## Quick Start

### 1. Create a new Railway account

New accounts get $5 free credit (~30 days of light usage). No credit card
required for the trial tier.

### 2. Project structure

```
hermes-railway/
├── Dockerfile
├── hermes-config.yaml
└── .env              # OR use Railway Variables dashboard
```

### 3. Dockerfile

```dockerfile
FROM node:20-slim

# Install Hermes CLI
RUN npm install -g @hermes-agent/cli

# Create config directory
RUN mkdir -p /root/.hermes

# Copy configuration
COPY hermes-config.yaml /root/.hermes/config.yaml

# .env is injected via Railway Variables — don't COPY it here

# Gateway port (if using HTTP-based platforms)
EXPOSE 8080

# Start gateway
CMD ["hermes", "gateway", "run"]
```

### 4. Hermes config

`hermes-config.yaml` — minimal working config:

```yaml
model:
  default: anthropic/claude-sonnet-4
  provider: openrouter

gateway:
  platforms:
    telegram:
      enabled: true
    discord:
      enabled: false

terminal:
  backend: local
  timeout: 180
```

### 5. Environment variables

Set these via Railway Variables dashboard (**more secure** than committing .env):

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | LLM provider key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (if using Telegram) |
| `DISCORD_BOT_TOKEN` | Discord bot token (if using Discord) |
| `HERMES_GATEWAY_SECRET` | Gateway webhook secret |
| `HERMES_HOME` | Set to `/root/.hermes` |

### 6. Deploy

```bash
# Via Railway CLI
railway login
railway init --name hermes-bot
railway up --detach

# Or connect GitHub repo → Railway auto-deploys on push
```

## Key Considerations

- **Railway free tier**: $5 credit, enough for ~1-2 months for a lightweight
  Hermes gateway instance. After credit runs out, services are paused — no
  surprise charges.
- **Restart behavior**: Hermes gateway connects to Telegram/Discord via
  long-polling or WebSocket. If the connection drops, Railway restarts the
  container and Hermes reconnects. This is usually seamless.
- **Logs**: `railway logs --service <svc> --lines 200` to debug startup.
- **Updates**: Push to GitHub repo → Railway auto-deploys. Gateway drains and
  restarts within seconds.

## Limitations

- Railway containers are **ephemeral** — any local file changes outside the
  repo are lost on restart. Skills, sessions, and memory don't persist unless
  backed up to external storage (S3 bucket, GitHub, etc.).
- Railway **cannot run Docker in Docker** — tools that need `docker` CLI won't
  work.
- Output is limited — Railway captures stdout/stderr, but interactive CLI
  sessions (PTY) don't work well in containers.
