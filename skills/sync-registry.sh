#!/usr/bin/env bash
# =============================================================================
# SYNC SKILLS REGISTRY — Auto-Discovery Engine v2026.1
# =============================================================================
set -e

REGISTRY="/home/ngome/agensi/skills/REGISTRY.json"
SCAN_SCRIPT="/tmp/scan_skills_poly_v3.py"

echo "═══ SKILLS REGISTRY SYNC v2026.1 ═══"
echo ""

cat > "$SCAN_SCRIPT" << 'PYEOF'
import os, sys, json, re
from datetime import datetime

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML not installed. Run: pip install pyyaml", file=sys.stderr)
    sys.exit(1)

LOG = []
def log(msg):
    LOG.append(msg)
    print(f"  {msg}", file=sys.stderr)

def fix_yaml_frontmatter(raw_yaml):
    """Pre-process YAML to fix unquoted strings containing colons"""
    lines = raw_yaml.split('\n')
    fixed = []
    for line in lines:
        # Skip empty lines and list items
        if not line.strip() or line.strip().startswith('- '):
            fixed.append(line)
            continue
        
        # Check if this is a key: value line
        m = re.match(r'^(\s*[\w][\w_-]*)\s*:\s*(.*)', line)
        if m:
            key = m.group(1)
            value = m.group(2).strip()
            
            # If value is already quoted, keep as is
            if (value.startswith('"') and value.endswith('"')) or \
               (value.startswith("'") and value.endswith("'")):
                fixed.append(line)
            # If value is empty or a boolean/null, keep as is
            elif not value or value.lower() in ('true', 'false', 'null', 'none', 'yes', 'no'):
                fixed.append(line)
            # If value contains a colon but is NOT a list/object → needs quoting
            elif ':' in value and not value.startswith('{') and not value.startswith('['):
                # Escape double quotes inside
                escaped = value.replace('"', '\\"')
                fixed.append(f'{key}: "{escaped}"')
            else:
                fixed.append(line)
        else:
            fixed.append(line)
    
    return '\n'.join(fixed)


def parse_frontmatter(path):
    """Parse YAML frontmatter from SKILL.md with PyYAML"""
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            raw = f.read()
    except Exception as e:
        return {}, '', str(e)
    
    if not raw.startswith('---'):
        return {}, raw[:500], 'no frontmatter'
    
    end_idx = raw.find('\n---', 3)
    if end_idx == -1:
        return {}, raw[:500], 'no closing ---'
    
    yaml_str = raw[3:end_idx].strip()
    yaml_fixed = fix_yaml_frontmatter(yaml_str)
    content = raw[end_idx+4:].strip()
    
    try:
        data = yaml.safe_load(yaml_fixed)
        if not isinstance(data, dict):
            data = {}
    except yaml.YAMLError as e:
        # Last resort: manual parse
        log(f"YAML fallback for {os.path.basename(path)}: {e}")
        data = manual_parse(yaml_str)
    
    return data, content, 'ok'


def manual_parse(yaml_str):
    """Fallback: manual key-value extraction"""
    data = {}
    lines = yaml_str.split('\n')
    in_list_key = None
    list_vals = []
    in_nested = False
    nested_key = None
    
    for line in lines:
        # Top-level key: value
        m = re.match(r'^(\w[\w_-]*)\s*:\s*(.*)', line)
        if m and not line.startswith(' ') and not line.startswith('\t'):
            if in_list_key and list_vals:
                data[in_list_key] = list_vals
                list_vals = []
            in_list_key = None
            
            key = m.group(1).strip()
            val = m.group(2).strip()
            
            if val == '':
                if key == 'metadata':
                    in_nested = True
                    nested_key = 'metadata'
                    data[key] = {}
                else:
                    in_list_key = key
                    list_vals = []
            elif val.startswith('"') and val.endswith('"'):
                data[key] = val[1:-1]
            elif val.startswith("'") and val.endswith("'"):
                data[key] = val[1:-1]
            else:
                data[key] = val
        # Nested under metadata
        elif in_nested and line.startswith('  ') and ':' in line:
            nm = re.match(r'  (\w[\w_-]*)\s*:\s*(.*)', line)
            if nm:
                k = nm.group(1).strip()
                v = nm.group(2).strip()
                if v.startswith('"') and v.endswith('"'):
                    v = v[1:-1]
                elif v.startswith("'") and v.endswith("'"):
                    v = v[1:-1]
                if isinstance(data.get(nested_key), dict):
                    data[nested_key][k] = v
        # List items
        elif line.strip().startswith('- '):
            list_vals.append(line.strip()[2:])
    
    if in_list_key and list_vals:
        data[in_list_key] = list_vals
    
    return data


def detect_description(fm, content):
    desc = fm.get('description', '')
    if desc and isinstance(desc, str):
        return desc[:500]
    for line in content.split('\n'):
        line = line.strip()
        if line and not line.startswith('#') and not line.startswith('>') and len(line) > 20:
            return line[:500]
    return ''


def classify_skill(name, fm, content):
    desc = str(fm.get('description', ''))
    full_text = (desc + ' ' + content[:2000]).lower()
    name_lower = name.lower()
    
    domains = set()
    platforms = set()
    tags = set()
    categories = set()
    
    # ─── DOMAINS ────────────────────────────────────────────────────────
    domain_patterns = {
        'security': ['xss', 'sqli', 'ssrf', 'idor', 'csrf', 'rce', 'xxe', 'ssti',
                     'vulnerability', 'cve', 'exploit', 'pentest', 'bug bounty',
                     'red team', 'malware', 'forensic', 'injection', 'firebase',
                     'zeroize', 'constant-time', 'overflow', 'security audit',
                     'codeql', 'semgrep', 'sast', 'waf', 'auth bypass',
                     'account takeover', 'hunt-', 'security', 'attack',
                     'bypass', 'shellcode', 'payload', 'exploitation',
                     'privilege escalation', 'vulnerability scanner'],
        'web3': ['solidity', 'solana', 'cosmos', 'substrate', 'cairo', 'ton',
                 'smart contract', 'defi', 'token', 'nft', 'blockchain',
                 'meme coin', 'evm', 'wallet', 'staking', 'liquidity',
                 'web3', 'erc20', 'erc721', 'swap', 'dex'],
        'crypto': ['cryptographic', 'cipher', 'encryption', 'signature',
                   'key exchange', 'tls', 'zero-knowledge', 'proverif',
                   'wycheproof', 'tamarin', 'protocol', 'mermaid-to-proverif',
                   'diffie-hellman', 'aes', 'rsa', 'ecc', 'elliptic curve'],
        'ai-ml': ['llm', 'rag', 'chatbot', 'agent', 'prompt injection',
                  'openai', 'claude', 'gemini', 'vectorize', 'workers ai',
                  'hunt-llm', 'hunt-agentic', 'hunt-ai', 'ai seo',
                  'machine learning', 'deep learning', 'neural network',
                  'nlp', 'training', 'inference'],
        'marketing': ['seo', 'cro', 'copywriting', 'cold email', 'ads',
                      'social media', 'content strategy', 'referral', 'launch',
                      'pricing', 'marketing', 'lead magnet', 'prospecting',
                      'public relation', 'aso', 'sms marketing',
                      'community marketing', 'co-marketing',
                      'conversion', 'growth', 'retention', 'acquisition',
                      'analytics', 'ga4', 'utm', 'a/b test', 'split test'],
        'frontend': ['react', 'vue', 'svelte', 'css', 'tailwind', 'design system',
                     'ui/ux', 'frontend', 'component', 'landing page',
                     'web design', 'responsive', 'untitledui',
                     'javascript', 'typescript', 'html', 'dom'],
        'backend': ['api', 'server', 'database', 'worker', 'hono',
                    'next.js route', 'rest api', 'graphql', 'microservice',
                    'backend', 'middleware', 'endpoint', 'route handler'],
        'cloud': ['cloudflare', 'aws', 'gcp', 'azure', 'kubernetes',
                  'docker', 'deploy', 'cloud infrastructure', 's3', 'lambda',
                  'cloud-iam', 'container', 'orchestration'],
        'devops': ['ci/cd', 'monitoring', 'observability', 'sre', 'terraform',
                   'pulumi', 'docker compose', 'github actions',
                   'devops', 'continuous integration', 'deployment pipeline'],
        'mobile': ['android', 'apk', 'ios', 'swift', 'react native', 'flutter',
                   'mobile app', 'firebase-apk', 'kotlin', 'dart'],
        'testing': ['fuzz', 'mutation test', 'property test', 'coverage',
                    'qa', 'regression', 'test', 'harness', 'fuzzer',
                    'libfuzzer', 'afl', 'atheris', 'ruzzy', 'cargo-fuzz', 'ossfuzz'],
        'data': ['database', 'analytics', 'migration', 'etl', 'sql',
                 'warehouse', 'd1', 'supabase', 'postgres',
                 'data modeling', 'schema', 'query'],
        'business': ['sales', 'prospecting', 'client', 'invoice', 'proposal',
                     'billing', 'pricing', 'revops', 'sales enablement',
                     'business', 'contract', 'sow'],
        'documentation': ['docx', 'pptx', 'xlsx', 'pdf', 'report writing',
                          'copy editing', 'document', 'presentation', 'spreadsheet'],
    }
    
    for domain, patterns in domain_patterns.items():
        for p in patterns:
            if p in full_text:
                domains.add(domain)
                break
    
    # Domain from name
    name_domain_map = {
        'hunt-': 'security', 'audit': 'security', 'fuzz': 'testing',
        'semgrep': 'testing', 'codeql': 'testing', 'wycheproof': 'crypto',
        'proverif': 'crypto', 'solidity': 'web3', 'solana': 'web3',
        'cosmos': 'web3', 'substrate': 'web3', 'cairo': 'web3',
        'ton-': 'web3', 'meme-coin': 'web3', 'web3': 'web3',
        'cloudflare': 'cloud', 'workers-': 'cloud', 'wrangler': 'cloud',
        'design': 'frontend', 'frontend': 'frontend', 'ui-ux': 'frontend',
        'copy': 'marketing', 'seo': 'marketing', 'market': 'marketing',
        'ads': 'marketing', 'email': 'marketing', 'social': 'marketing',
        'referral': 'marketing', 'launch': 'marketing', 'pricing': 'marketing',
        'prospect': 'business', 'sales': 'business', 'invoice': 'business',
        'billing': 'business', 'docx': 'documentation', 'pptx': 'documentation',
        'xlsx': 'documentation', 'pdf': 'documentation', 'debug': 'testing',
        'forensic': 'security', 'malware': 'security', 'apk': 'mobile',
        'android': 'mobile', 'whatsapp': 'mobile', 'red-team': 'security',
    }
    for kw, domain in name_domain_map.items():
        if kw in name_lower:
            domains.add(domain)
    
    # ─── PLATFORMS ──────────────────────────────────────────────────────
    platform_patterns = {
        'github': ['github', 'git', 'gh-cli', 'git workflow'],
        'cloudflare': ['cloudflare', 'workers', 'pages', 'wrangler', 'd1', 'r2', 'kv', 'durable object'],
        'vercel': ['vercel', 'next.js deployment', 'vercel react'],
        'supabase': ['supabase'],
        'wordpress': ['wordpress', 'wp-', 'woocommerce', 'yoast', 'elementor'],
        'google': ['google', 'ga4', 'search console', 'gcp', 'analytics', 'chrome'],
        'aws': ['aws', 's3', 'lambda', 'ec2', 'iam', 'cloudfront'],
        'microsoft': ['azure', 'microsoft', 'entra', 'sharepoint', 'm365', '.net', 'iis'],
        'meta': ['facebook', 'instagram', 'meta ads', 'whatsapp business'],
    }
    for platform, patterns in platform_patterns.items():
        for p in patterns:
            if p in full_text:
                platforms.add(platform)
                break
    
    # ─── CATEGORIES ─────────────────────────────────────────────────────
    for kw, cat in [('debug', 'debugging'), ('forensic', 'debugging'),
                    ('audit', 'audit'), ('review', 'audit'),
                    ('hunt', 'vulnerability-hunting'), ('bounty', 'vulnerability-hunting'),
                    ('design', 'design'), ('fuzz', 'fuzzing'), ('fuzzer', 'fuzzing'),
                    ('deploy', 'infrastructure'), ('infra', 'infrastructure'),
                    ('cloud', 'infrastructure'), ('copy', 'content-creation'),
                    ('write', 'content-creation'), ('docx', 'content-creation'),
                    ('pptx', 'content-creation'), ('pdf', 'content-creation'),
                    ('scan', 'scanning'), ('recon', 'scanning'),
                    ('test', 'testing'), ('agent', 'automation'), ('workflow', 'automation')]:
        if kw in name_lower:
            categories.add(cat)
    
    for kw in ['testing', 'qa', 'coverage', 'regression']:
        if kw in full_text: categories.add('testing')
    for kw in ['marketing', 'seo', 'ads', 'email', 'social', 'copywriting']:
        if kw in full_text: categories.add('marketing')
    for kw in ['develop', 'code', 'programming', 'framework', 'library']:
        if kw in full_text: categories.add('development')
    for kw in ['security', 'vulnerability', 'exploit', 'attack']:
        if kw in full_text: categories.add('security')
    
    if not categories:
        categories = {list(domains)[0]} if domains else {'general'}
    
    # Tags
    for kw in ['xss','sqli','ssrf','idor','csrf','rce','xxe','ssti',
               'cloudflare','workers','pages','github','api','rest',
               'graphql','docker','kubernetes','react','vue','angular',
               'python','javascript','typescript','rust','go','solidity',
               'postgres','mysql','redis','sqlite','mongodb']:
        if kw in full_text:
            tags.add(kw)
    
    return {
        'domains': sorted(domains) if domains else ['general'],
        'platforms': sorted(platforms),
        'tags': sorted(tags),
        'categories': sorted(categories)
    }


# ═══════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════
print("Starting polymorphic skills scan...", file=sys.stderr)

DIRS = [
    ('/home/ngome/agensi/skills/', 'agensi'),
    ('/home/ngome/.agents/skills/', 'agents'),
]

all_skills = {}
errors = []

for base_dir, source_name in DIRS:
    if not os.path.isdir(base_dir):
        log(f"SKIP: {base_dir}")
        continue
    
    count = 0
    for d in sorted(os.listdir(base_dir)):
        skill_dir = os.path.join(base_dir, d)
        if not os.path.isdir(skill_dir) or d.startswith('.'):
            continue
        
        skill_md = os.path.join(skill_dir, 'SKILL.md')
        has_md = os.path.exists(skill_md)
        
        fm = {}
        content = ''
        parse_status = 'unread'
        
        if has_md:
            fm, content, parse_status = parse_frontmatter(skill_md)
        
        if not isinstance(fm, dict): fm = {}
        
        desc = fm.get('description', '') or detect_description(fm, content)
        version = 'unknown'
        author = 'unknown'
        updated = 'unknown'
        
        md = fm.get('metadata', {})
        if isinstance(md, dict):
            version = md.get('version', version)
            author = md.get('author', author)
            updated = md.get('updated', updated)
        
        classification = classify_skill(d, fm, content)
        
        # Relations — handle both list and comma-separated string
        relations = []
        if isinstance(md, dict):
            raw_pairs = md.get('pairs_with', [])
            if isinstance(raw_pairs, str):
                raw_pairs = [x.strip() for x in raw_pairs.split(',') if x.strip()]
            if isinstance(raw_pairs, list):
                for pair in raw_pairs:
                    p = str(pair).strip() if pair else ''
                    if p:
                        relations.append({
                            "type": "pairs_with",
                            "target": p,
                            "target_type": "document" if p.endswith('.md') else "skill"
                        })
        
        raw_refs = fm.get('references', [])
        if isinstance(raw_refs, str):
            raw_refs = [x.strip() for x in raw_refs.split(',') if x.strip()]
        if isinstance(raw_refs, list):
            for ref in raw_refs:
                r = str(ref).strip() if ref else ''
                if r and r != d:
                    relations.append({"type": "references", "target": r, "target_type": "skill"})
        
        raw_ext = fm.get('extends', [])
        if isinstance(raw_ext, str):
            raw_ext = [x.strip() for x in raw_ext.split(',') if x.strip()]
        if isinstance(raw_ext, list):
            for ext in raw_ext:
                e = str(ext).strip() if ext else ''
                if e:
                    relations.append({"type": "extends", "target": e, "target_type": "skill"})
        
        if d in all_skills and source_name == 'agents':
            continue
        
        all_skills[d] = {
            "id": f"skill:{d}",
            "name": d,
            "description": str(desc)[:500] if desc else '',
            "version": str(version) if version else 'unknown',
            "author": str(author) if author else 'unknown',
            "updated": str(updated) if updated else 'unknown',
            "source": source_name,
            "has_skillemd": has_md,
            "polymorphic": classification,
            "relations": relations,
            "dependencies": {
                "extends": fm.get('extends', []),
                "requires": []
            },
            "trigger_keywords": [d, d.replace('-', ' ')]
        }
        count += 1
    
    log(f"Scanned {count} skills from {source_name}")

log(f"\nTotal unique skills: {len(all_skills)}")
sources = {}
for s in all_skills.values():
    sources[s['source']] = sources.get(s['source'], 0) + 1
for src, cnt in sorted(sources.items()):
    log(f"  From {src}: {cnt}")
log(f"  With SKILL.md: {sum(1 for s in all_skills.values() if s['has_skillemd'])}")
log(f"  Total relations: {sum(len(s.get('relations', [])) for s in all_skills.values())}")

all_domains, all_platforms, all_categories = set(), set(), set()
for s in all_skills.values():
    all_domains.update(s['polymorphic']['domains'])
    all_platforms.update(s['polymorphic']['platforms'])
    all_categories.update(s['polymorphic']['categories'])

# ═══════════════════════════════════════════════
# MERGE with existing enrichments
# ═══════════════════════════════════════════════
EXISTING = {}
try:
    EXISTING = json.load(open(sys.argv[1])) if len(sys.argv) > 1 and os.path.exists(sys.argv[1]) else {}
except: pass

# Fields to preserve from existing registry (enrichments not produced by scan)
ENRICHED_FIELDS = ['status', 'identity', 'weak_entities', 'inheritance', 'temporal', 'ontology', 'graph']

for name in sorted(all_skills.keys()):
    new_sk = all_skills[name]
    if name in EXISTING.get('skills', {}):
        old_sk = EXISTING['skills'][name]
        for field in ENRICHED_FIELDS:
            if field in old_sk and old_sk[field]:
                new_sk[field] = old_sk[field]

# Recalculate totals
total_relations = sum(len(s.get('relations', [])) for s in all_skills.values())

registry = {
    "version": "2026.2",
    "schema": "polymorphic-v2",
    "generated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "meta": {
        "total_skills": len(all_skills),
        "total_relations": total_relations,
        "total_tags": sum(len(s['polymorphic']['tags']) for s in all_skills.values()),
        "sources": sources
    },
    "polymorphic_taxonomies": {
        "domains": sorted(all_domains),
        "platforms": sorted(all_platforms),
        "categories": sorted(all_categories),
        "relation_types": sorted(set(
            list(rt for s in all_skills.values() for rt in [r['type'] for r in s.get('relations', [])]) +
            ['pairs_with', 'requires', 'extends', 'references', 'supersedes',
             'similar_to', 'conflicts_with', 'complementary_to', 'prerequisite_of',
             'alternative_to', 'specializes', 'integrated_with', 'part_of', 'version_of']
        )),
        "taggable_types": ['domain', 'platform', 'category', 'custom', 'framework',
                           'language', 'tool', 'standard', 'vendor'],
        "statuses": ['active', 'abstract', 'deprecated', 'draft', 'archived']
    },
    "skills": {k: all_skills[k] for k in sorted(all_skills.keys())}
}

print(json.dumps(registry, indent=2))
PYEOF

# ─── Execute ────────────────────────────────────────────────────────────────
python3 "$SCAN_SCRIPT" "$REGISTRY" > /tmp/registry_new.json 2>/tmp/sync_registry.log

if [ $? -eq 0 ] && [ -s /tmp/registry_new.json ]; then
    mv /tmp/registry_new.json "$REGISTRY"
    SKILL_COUNT=$(python3 -c "import json; print(len(json.load(open('$REGISTRY'))['skills']))")
    REL_COUNT=$(python3 -c "import json; r=json.load(open('$REGISTRY')); print(sum(len(s.get('relations',[])) for s in r['skills'].values()))")
    echo ""
    echo "✅ REGISTRY SYNC COMPLETE"
    echo "   Skills: $SKILL_COUNT"
    echo "   Relations: $REL_COUNT"
    echo "   Registry: $REGISTRY"
else
    echo "❌ REGISTRY SYNC FAILED"
    cat /tmp/sync_registry.log
    exit 1
fi
