# Extract Credentials from Railway Projects

Use when you need admin passwords, API keys, or DB credentials from a Railway-deployed service to access its dashboard or API.

## Quick method: full environment dump

```bash
railway link -p <project-name>
railway env config --json
```

This returns the **entire environment configuration** as JSON — all services, all variables, plus volume mounts, networking, build config, and source repo info. No need to know service IDs upfront.

Example output shape:

```json
{
  "services": {
    "<service-uuid>": {
      "source": { "repo": "...", "branch": "..." },
      "variables": {
        "ADMIN_USERNAME": { "value": "wimx" },
        "ADMIN_PASSWORD": { "value": "Ipaw123" },
        "PORT": { "value": "8642" }
      }
    }
  }
}
```

## Per-service variables

If you already know the service name:

```bash
railway variable list --service <service-name> --json
```

## Credential flow for dashboard access

1. `railway list` → identify the project (check `deletedAt` — deleted projects still show in list)
2. `railway link -p <project>` → link to get context
3. `railway env config --json` → extract `ADMIN_USERNAME`, `ADMIN_PASSWORD` (or whatever cred vars the service uses)
4. Navigate browser to the service URL (from `railway service list` → `url` field)
5. Login with extracted credentials
6. Navigate to target path (`/plugins`, `/admin`, `/api`, etc.)

## Common credential variable names

| Variable | Likely contains |
|----------|----------------|
| `ADMIN_USERNAME` / `ADMIN_EMAIL` | Dashboard login user |
| `ADMIN_PASSWORD` | Dashboard login pass |
| `DATABASE_URL` / `PG_URL` | Full connection string |
| `REDIS_URL` | Redis connection |
| `API_KEY` / `SECRET_KEY` | API auth |
| `JWT_SECRET` | Token signing key |

## Pitfall: credentials in upstream template

The env vars come from the template the project was created from. If the user deployed from a public template (e.g. `praveen-ks-2001/hermes-agent-template`), admin credentials are default values from that template. **Change them after first login.**
