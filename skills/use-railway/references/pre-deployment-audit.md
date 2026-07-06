# Pre-Deployment Audit Methodology

Systematic checklist for assessing what breaks when moving a local multi-service app to Railway.

## Process

### 1. Service Dependency Map
Trace every external URL/port/host in the codebase starting from config files:

```
grep -rn 'localhost\|127.0.0.1\|0.0.0.0\|http://[^s]' src/config* src/**/*.config* --include='*.js' --include='*.ts'
```

Categorize each:
- **Plugins** — PostgreSQL, Redis, MySQL (Railway-native, just set `RAILWAY_*` env or DATABASE_URL)
- **Needs container** — Evolution API, custom services (deploy as separate Railway service)
- **Deprecated/unused** — config keys with no runtime code usage (verify with search)

### 2. Env Var Inventory
Map every `process.env.X` usage to its source:

| Env Var | Local Value | Railway Source | Changes Needed |
|---------|-------------|----------------|----------------|
| DATABASE_URL | localhost:5434 | Railway PG plugin | URL changes |
| REDIS_URL | localhost:6379 | Railway Redis plugin | URL changes |
| API_KEY | static value | Env var | Same value OK |

**Key insight**: localhost URLs in config WILL break. Every `http://localhost:PORT` must map to a Railway service URL or env var.

### 3. Code Usage Verification
Not all config keys are actually used at runtime. For each config entry:

```
grep -rn 'CONFIG_KEY\|configKey' src/ --include='*.js' --include='*.ts'
```

If a config key has zero runtime references, flag it as:
- **Deprecated** — safe to omit in Railway
- **Future use** — set to empty/null, document for later

### 4. Webhook URL Mapping
Apps with local webhook receivers break when URLs change. Audit:

- **Inbound webhooks** (external APIs → your app): URL changes with Railway domain
- **Outbound callbacks** (your app → external API): update callback URLs in external dashboards
- **Self-referencing URLs** (app calls its own webhook): update to Railway public URL

### 5. Docker Build Assessment

| Concern | Check | Railway Constraint |
|---------|-------|--------------------|
| Build time | `Dockerfile` layers | Railway 15min build timeout |
| Native deps | C++, Python extensions, whisper.cpp | Build once in multi-stage |
| Image size | `docker images` | Max 8GB compressed |
| Multi-stage | Existing `FROM ... AS builder` | Preferred pattern |

### 6. Ephemeral Storage Audit
Railway containers have ephemeral filesystems — data disappears on restart.

```
grep -rn 'tmp/\|uploads/\|session\|\.sqlite\|\.db' src/ --include='*.js' --include='*.ts'
```

Options for persistent data:
- Railway Volumes (single-replica only)
- S3-compatible buckets (Railway Buckets)
- External service (Supabase, Cloudflare R2)

### 7. Process Management
Check how multiple processes run locally (PM2, concurrently, separate terminals).

Local pattern:
```
pm2 start src/index.js --name app
pm2 start src/worker.js --name worker
```

Railway pattern:
- Docker CMD runs ONE foreground process
- Use `supervisord`, `s6-overlay`, or a wrapper script for multi-process
- Better: deploy as separate Railway services

### 8. API Key Inventory
Keys that stay vs keys that change URL:

| Key | Stays Same? | Rationale |
|-----|------------|-----------|
| Static API keys (OpenAI, etc.) | ✅ | Same endpoint, same key |
| Local-bound keys (localhost webhooks) | ❌ | Need Railway URL |
| Service discovery keys (service URLs) | ❌ | Need Railway internal URLs |

## Verification Steps

After mapping:
1. **Categorize blockers** — what truly blocks vs what's nice-to-have
2. **Order work** — plugins first (easy wins), then containers, then volume data
3. **Flag uncertainties** — dependencies on other running services that aren't on Railway
