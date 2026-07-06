# Dockerfile Patterns for Railway

Railway auto-detects a `Dockerfile` in the repo root and uses Docker build instead of Railpack. This is necessary when your app needs native system deps, C++ compilation, or custom OS-level packages that Railpack/Nixpacks can't handle.

## Multi-stage Dockerfile (C++ native deps)

Use when your app links against compiled C++ binaries (whisper.cpp, ffmpeg, custom native modules).

```dockerfile
# Stage 1: Build C++ dependency
FROM node:20-bookworm AS builder
RUN apt-get update && apt-get install -y cmake build-essential
COPY native-dep/ /native-dep/
WORKDIR /native-dep/build
RUN cmake .. && make -j$(nproc)

# Stage 2: Runtime
FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y ffmpeg ca-certificates
WORKDIR /app

# Copy compiled binary from builder
COPY --from=builder /native-dep/build/bin/program /app/bin/program

# Install Node deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy app code
COPY src/ ./src/

EXPOSE 3000
CMD ["node", "src/index.js"]
```

## Git strategy for C++ deps

**Don't push compiled C++ source to git** — it's often 100MB+ and makes clone/deploy slow.

| Do | Don't |
|---|---|
| Add `cpp-dep/` to `.gitignore` | Push compiled binaries to git |
| Build from source in Docker | Vendor full C++ repos |
| Download model files via `curl` in Docker build | Store model files in git |

## Running multiple processes in one container

Railway exposes one port per service. If your app has a main server + background workers, run them in one container:

```dockerfile
CMD node src/index.js & node src/worker.js & wait -n
```

`wait -n` returns when the first process exits (container restarts). Railway health checks only need the main port.

**Alternative**: split into separate Railway services (one for each process) if they need independent scaling, restarts, or resource limits.

## Railway port exposure with Dockerfile

Railway auto-detects which port to route traffic to:
- If you set `PORT` env → uses that
- If you `EXPOSE` one port → uses that
- Defaults to 3000/8080

Internal ports (e.g., media processor on 3001) don't need exposure and aren't publicly accessible.

## Pitfalls

- **Docker builds are slow on first deploy** — Railway caches layers, so subsequent deploys only rebuild changed layers. Large C++ compilation only happens once unless the build stage changes.
- **No `docker compose` support** — Railway runs one container per service. If you need multiple containers locally, that's for local dev only.
- **Railpack env vars don't apply with Dockerfile** — `RAILPACK_*` variables are ignored. Use Dockerfile ARG/ENV instead.
- **Build context is the repo root** — files outside the repo can't be COPY'd. Everything must be committed (except .gitignored files are unavailable during build too).
