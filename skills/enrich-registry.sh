#!/usr/bin/env bash
# =============================================================================
# ENRICH REGISTRY — Add Inheritance + Graph + Ontology + Identity + Temporal
# v2026.2 — Run AFTER sync-registry.sh
# =============================================================================
set -e
REGISTRY="/home/ngome/agensi/skills/REGISTRY.json"

echo "═══ ENRICH REGISTRY v2026.2 ═══"
echo ""

if [ ! -f "$REGISTRY" ]; then
    echo "ERROR: REGISTRY.json not found. Run sync-registry.sh first."
    exit 1
fi

TMPF=$(mktemp /tmp/enrich-registry-XXXXXX.py)
cat > "$TMPF" << 'PYEOF'
import json, sys
from collections import defaultdict

REG_PATH = sys.argv[1]
r = json.load(open(REG_PATH))
skills = r['skills']

# ─── 1. ABSTRACT PARENTS ───────────────────────────────────────────────────
ABSTRACT_PARENTS = {
    'security-skill': 'hunt-|security-|firebase-|burpsuite|codeql|semgrep',
    'cloud-platform': 'cloudflare|aws|gcp|azure-',
    'fuzzing-engine': 'fuzz-|afl|libfuzzer|atheris|ruzzy|cargo-fuzz|libafl|ossfuzz',
    'testing-framework': 'wycheproof|mutation-test|coverage|property-based-test|harness',
    'deployment-platform': 'vercel|wrangler|devcontainer|use-railway',
    'protocol-standard': 'proverif|tamarin|crypto-protocol|mermaid-to-proverif|zeroize|constant-time',
}

# Create abstract skills that exist only in registry
for abs_name, _ in ABSTRACT_PARENTS.items():
    if abs_name not in skills:
        skills[abs_name] = {
            "id": f"skill:{abs_name}",
            "name": abs_name,
            "description": f"Abstract parent for {abs_name.replace('-',' ')} skills",
            "version": "1.0.0",
            "author": "agensi",
            "updated": "2026-06",
            "source": "abstract",
            "has_skillemd": False,
            "polymorphic": {"domains": [], "platforms": [], "tags": [], "categories": []},
            "relations": [],
            "dependencies": {"extends": [], "requires": []},
            "trigger_keywords": [abs_name],
            "status": "abstract",
            "identity": {"composite_key": ["name", "source", "version"], "aliases": [], "is_weak": False},
            "weak_entities": {"versions": [], "aliases": []},
            "inheritance": {"parent": None, "is_abstract": True, "children": [], "depth": 0},
            "temporal": {"timeline": [{"date": "2026-06", "event": "created", "tag": "registry-v2026.2"}]},
            "ontology": {"owl_class": None, "owl_superclass": None, "semantic_properties": {}},
            "graph": {"node_degree": 0, "in_degree": 0, "out_degree": 0, "centrality_score": 0, "neighbors": []}
        }

# ─── 2. INHERITANCE DETECTION ─────────────────────────────────────────────
# Build parent → children mapping
for name, s in skills.items():
    if 'inheritance' not in s:
        s['inheritance'] = {"parent": None, "is_abstract": False, "children": [], "depth": 0}
    if 'status' not in s:
        s['status'] = 'active'

for abs_name, pattern in ABSTRACT_PARENTS.items():
    import re
    for name in skills:
        if name == abs_name:
            continue
        if re.search(pattern, name):
            existing_parent = skills[name]['inheritance'].get('parent')
            if not existing_parent:
                skills[name]['inheritance']['parent'] = abs_name
                if name not in skills[abs_name]['inheritance']['children']:
                    skills[abs_name]['inheritance']['children'].append(name)

# Compute depth via BFS from each root
def compute_depth(name):
    s = skills[name]
    if s['inheritance']['is_abstract']:
        s['inheritance']['depth'] = 0
        return
    depth = 0
    cur = s['inheritance'].get('parent')
    visited = set()
    while cur and cur in skills and cur not in visited:
        visited.add(cur)
        depth += 1
        cur = skills[cur]['inheritance'].get('parent')
    s['inheritance']['depth'] = depth

for name in skills:
    compute_depth(name)

# Add extends relations for inheritance chains
for name, s in skills.items():
    parent = s['inheritance'].get('parent')
    if parent and parent in skills:
        # Check if extends relation already exists
        exists = any(r['type'] == 'extends' and r['target'] == parent for r in s.get('relations', []))
        if not exists:
            s['relations'].append({
                "type": "extends",
                "target": parent,
                "target_type": "skill",
                "attributes": {"strength": "strong", "context": "inheritance"}
            })

# ─── 3. GRAPH METRICS ─────────────────────────────────────────────────────
for name, s in skills.items():
    if 'graph' not in s:
        s['graph'] = {"node_degree": 0, "in_degree": 0, "out_degree": 0, "centrality_score": 0, "neighbors": []}

# Reset graph
for s in skills.values():
    s['graph']['node_degree'] = 0
    s['graph']['in_degree'] = 0
    s['graph']['out_degree'] = 0
    s['graph']['neighbors'] = []

# Build adjacency (directed, from relations)
for name, s in skills.items():
    outbound = set()
    for rel in s.get('relations', []):
        if rel['target_type'] == 'skill' and rel['target'] in skills:
            outbound.add(rel['target'])
    s['graph']['neighbors'] = sorted(outbound)
    s['graph']['out_degree'] = len(outbound)

# Count inbound
in_counts = defaultdict(int)
for name, s in skills.items():
    for nb in s['graph']['neighbors']:
        in_counts[nb] += 1

for name, s in skills.items():
    s['graph']['in_degree'] = in_counts.get(name, 0)
    s['graph']['node_degree'] = s['graph']['in_degree'] + s['graph']['out_degree']

# Centrality = degree / total_skills
total_skills = len(skills)
for s in skills.values():
    s['graph']['centrality_score'] = round(s['graph']['node_degree'] / max(total_skills, 1), 4)

# ─── 4. ONTOLOGY ──────────────────────────────────────────────────────────
DOMAIN_TO_OWL = {
    'ai-ml': 'AISkill', 'backend': 'BackendSkill', 'business': 'BusinessSkill',
    'cloud': 'CloudSkill', 'crypto': 'CryptoSecuritySkill', 'data': 'DataSkill',
    'devops': 'DevOpsSkill', 'documentation': 'DocumentationSkill',
    'frontend': 'FrontendSkill', 'marketing': 'MarketingSkill',
    'mobile': 'MobileSkill', 'security': 'SecuritySkill',
    'testing': 'TestingSkill', 'web3': 'Web3Skill',
}

for name, s in skills.items():
    if 'ontology' not in s:
        s['ontology'] = {"owl_class": None, "owl_superclass": None, "semantic_properties": {}}
    doms = s['polymorphic'].get('domains', [])
    # Most specific domain first -> assigns more descriptive OWL class
    priority = ['crypto', 'mobile', 'web3', 'devops', 'cloud', 'data', 'security',
                'frontend', 'backend', 'testing', 'documentation', 'business',
                'marketing', 'ai-ml']
    chosen = None
    for p in priority:
        if p in doms:
            chosen = DOMAIN_TO_OWL.get(p)
            break
    if not chosen:
        chosen = 'AISkill'
    s['ontology']['owl_class'] = chosen
    s['ontology']['owl_superclass'] = 'Skill'
    sp = {'difficulty': 'intermediate', 'learning_time_minutes': 736}
    if s['inheritance'].get('depth', 0) > 0:
        sp['inheritance_depth'] = s['inheritance']['depth']
    s['ontology']['semantic_properties'] = sp

# ─── 5. IDENTITY & WEAK ENTITIES ─────────────────────────────────────────
for name, s in skills.items():
    if 'identity' not in s:
        s['identity'] = {"composite_key": ["name", "source", "version"], "aliases": [], "is_weak": False}
    if 'weak_entities' not in s:
        s['weak_entities'] = {"versions": [], "aliases": []}
    
    # Generate alias from name
    if not s['identity']['aliases']:
        alias = name.replace('-', ' ')
        s['identity']['aliases'] = [alias]
    
    # Ensure weak_entities has version entry
    if not s['weak_entities']['versions']:
        ver = s.get('version', 'unknown')
        s['weak_entities']['versions'] = [{"id": f"{name}@current", "version": ver, "date": s.get('updated', '')}]

# ─── 6. TEMPORAL ──────────────────────────────────────────────────────────
for name, s in skills.items():
    if 'temporal' not in s:
        updated = s.get('updated', '')
        if updated and updated != 'unknown':
            s['temporal'] = {"timeline": [{"date": updated, "event": "last updated", "tag": "update"}]}
        else:
            s['temporal'] = {"timeline": []}
    if not s['temporal'].get('timeline'):
        s['temporal'] = {"timeline": [{"date": "2026-06", "event": "registered", "tag": "initial"}]}

# ─── 7. RECALCULATE TOTALS ────────────────────────────────────────────────
sources = defaultdict(int)
for s in skills.values():
    sources[s.get('source', '?')] += 1
r['meta']['total_skills'] = len(skills)
r['meta']['sources'] = dict(sources)
r['meta']['total_relations'] = sum(len(s.get('relations', [])) for s in skills.values())
r['meta']['total_tags'] = sum(len(s['polymorphic']['tags']) for s in skills.values())

# Write back
json.dump(r, open(REG_PATH, 'w'), indent=2)
print(f"✅ Enriched registry: {len(skills)} skills")
print(f"   Abstract parents: {sum(1 for s in skills.values() if s.get('status')=='abstract')}")
print(f"   Inheritance chains: {sum(1 for s in skills.values() if s['inheritance'].get('parent'))}")
print(f"   Total relations: {r['meta']['total_relations']}")
print(f"   Ontology classes: {len(set(s['ontology']['owl_class'] for s in skills.values()))}")
PYEOF
python3 "$TMPF" "$REGISTRY"
rm -f "$TMPF"
