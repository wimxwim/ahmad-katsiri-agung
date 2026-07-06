# XenForo Recon & Vulnerability Guide

XenForo (XF) is a popular PHP forum software (v2.x series). Version 2.3 is current as of 2026.

## Version Fingerprinting

XenForo does NOT expose its minor version in HTML unless a patch explicitly adds it. Instead, use asset version params:

```bash
# CSS/JS files have ?v=UNIX_TIMESTAMP params
# Decode to get approximate deployment date:
date -d @1778864862
# → 2026-05-15 (patch deployed AFTER CVE-2026-35057 release on 2026-03-06)

# Compare with known release dates:
curl -sI "https://forum.example.com/styles/yourstyle/xenforo/logo.og" | grep -i "location\|x-robots-tag"
```

### Quick Version Check

```bash
# Look for data-xf attribute in HTML
curl -s "https://forum.com/" | grep -oP 'data-xf="\K[^"]+'
# Returns "2.3" — no minor version. Need asset timestamps.

# JS version params differ between deployments
curl -s "https://forum.com/" | grep -oP 'v=\K[0-9]{10,}' | sort -u
# Compare with known data:
# v=1778864862 = 2026-05-15 (post-CVE patch)
# v=1735750495 = 2025-01-01 (older deployment)

# SVG icon versions (different from JS/CSS versions)
curl -s "https://forum.com/styles/fontawesome/metadata/icons.json" | head -1
# Or check favicon timestamp
```

## Subdomain Deviation Detection

XenForo forums on Cloudflare behave distinctly:

```bash
# Random subdomain → 530 (Cloudflare origin DNS error)
curl -sI "https://xyz123abc456.forum.com/" | head -5
# → HTTP 530

# Known non-production subdomain → 403 with LiteSpeed + XF login page
curl -sI "https://dev-subdomain.forum.com/" | head -10
# → HTTP 403 but returns LiteSpeed Server header + <title>Login | Forum</title>

# Main forum → 200 with XenForo
curl -sI "https://forum.com/" | head -5
```

This pattern helps identify intentional subdomains (dev/staging) vs random noise.

## CVE-2026-35057: Stored XSS via Structured Mentions

**Severity:** Critical (CVE-2026-35057)
**Affects:** XenForo < 2.3.10 and < 2.2.19
**Released:** 6 March 2026
**Status:** Actively exploited in the wild (confirmed on linux.org)

### Detection

```bash
# Check if structured mentions feature is present
curl -sI "https://forum.com/help/mentions/" | head -5
# → 200 OK = mentions feature active

# Check if profile posts feature exists
curl -sI "https://forum.com/profile-posts/" | head -5
# → 200 = profile post feature active

# Check for CSP (mitigating factor)
curl -sI "https://forum.com/" | grep -i "content-security-policy"
# No CSP header = full impact
```

### Vector
Structured text mentions (`@username`) in profile posts. Stored XSS triggers when:
1. Attacker crafts mention with embedded JS in profile post
2. Victim views the profile post (admin panel or regular view)
3. XSS executes in victim's session context

### Verification (requires authenticated account)
```
Create a profile post containing crafted mention → check if sanitized
```

## Third-Party JS Supply Chain

XenForo forums frequently load JS from external domains for monetization:

### Common External Domains
- `gambar123.com` (common Indonesian forum ad network)
- Various CDN/ad servers

### Audit Commands

```bash
# Extract all external JS from homepage
curl -s "https://forum.com/" | grep -oP 'src="\Khttps?://[^"]*\.js[^"]*' | sort -u

# Check all inline scripts for external requests
curl -s "https://forum.com/" | grep -oP 'https?://[^"]+' | sort -u | grep -v forum.com

# Verify JS integrity (SRI)
curl -s "https://forum.com/" | grep -oP 'integrity="\K[^"]+' | sort -u
# Empty = no SRI = supply chain risk
```

### Risk Assessment
- No SRI (subresource integrity) on third-party JS:
  - Any compromise of the external domain = XSS on ALL forum pages
  - Cookie theft, session hijacking, page defacement
- File hash monitoring: compare `?v=` param + file hash over time

## Anti-Blocker Patterns

Indonesian XenForo forums often have alternative access methods for ISP-blocked users:

```bash
# Check for alternative domains in footer/about page
curl -s "https://forum.com/help/terms/" | grep -oP 'https?://[^"]+' | sort -u
# Look for URL shorteners or alternative TLDs

# common patterns:
# - smallurl.top/<name> → redirect to main forum
# - Multiple TLDs: .com, .net, .org
# - Twitter/X for status updates
```

## XenForo Info Leakage Endpoints

```bash
# Check these common XF paths:
curl -sI "https://forum.com/install/"          # Installer should 404/403
curl -sI "https://forum.com/admin.php"          # Admin panel (should 401/403)
curl -sI "https://forum.com/.git/config"        # Git exposure
curl -s "https://forum.com/sitemap.xml"         # Content enumeration
curl -s "https://forum.com/robots.txt"          # Hidden paths

# Version from JS config
curl -s "https://forum.com/js/xf/core-compiled.js" | grep -oP 'xf\.(version|build)=\K[^;]+'
```

## Custom XenForo Add-on Audit

XenForo forums often have custom add-ons. Look for:

```bash
# Extract custom JS (not vendor)
curl -s "https://forum.com/" | grep -oP 'src="\K[^"]*\.js[^"]*' | sort -u
# Filter out: js/xf/, js/vendor/, js/theme/ → remaining = custom add-ons

# Check for custom cookies
curl -sI "https://forum.com/" | grep -i "set-cookie"
# Custom cookies = custom add-on functionality

# Common custom features to test:
# - User notes/usernote system
# - Popup/modal system
# - Spoiler auto-open
# - Custom reputation/reaction systems
```

## Email Delivery Issues as Info Leak

When forums report "Gmail cannot receive emails from forum":
- Check SPF/DKIM/DMARC records
- SMTP server IP may be blacklisted
- Password reset functionality may be unreliable
- Alternative email providers may still work

## XenForo Quick Win Checklist

```bash
# 1. Version check
date -d @$(curl -s "https://forum.com/" | grep -oP 'v=\K[0-9]{10}' | head -1)

# 2. CVE-2026-35057 (stored XSS through mentions)
# Requires auth - check version first

# 3. Third-party JS audit
curl -s "https://forum.com/" | grep -oP 'src="\Khttps?://[^"]*"' | grep -v forum.com

# 4. Admin panel
curl -sI "https://forum.com/admin.php" | head -5

# 5. Subdomain audit
for sub in dev staging admin api test; do
  curl -sI "https://$sub.forum.com/" | head -1 | grep -v "530"
done

# 6. Alternative domains
curl -s "https://forum.com/" | grep -oP 'https?://[^"]+' | sort -u | grep -v "forum.com"

# 7. XF version disclosure
curl -s "https://forum.com/" | grep -oP 'data-xf="\K[^"]+' 2>/dev/null || echo "Not found in HTML"
```

## References
- CVE-2026-35057: GHSA-vrhx-2966-qqfp (GHSA) / vulncheck.com advisories
- XenForo HYS (Have You Seen) threads for patch notes
