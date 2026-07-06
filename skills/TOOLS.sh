#!/usr/bin/env bash
# =============================================================================
# SKILLS DATABASE TOOLS — Polymorphic + Graph + Inheritance + Ontology Engine
# v2026.2 — 25 commands, 9 database patterns
# Usage: bash TOOLS.sh <command> [args]
# =============================================================================
set -e
REGISTRY="/home/ngome/agensi/skills/REGISTRY.json"

show_help() {
    cat << 'HELP'
╔══════════════════════════════════════════════════════════════════════════╗
║  SKILLS DB — 9 Pattern Engine v2026.2                                  ║
║  Polymorphic · Weak Entity · Inheritance · Graph · Temporal · Ontology ║
╚══════════════════════════════════════════════════════════════════════════╝

USAGE: bash TOOLS.sh <command> [args]

 ── FILTER ──
  list                           Semua skill
  count                          Total skill
  by-domain <domain>             Skill dalam domain
  by-platform <platform>         Skill di platform
  by-category <category>         Skill dalam kategori
  by-status <status>             Skill by status (active/abstract/deprecated)
  polyfilter <d> <p> [<c>]      Filter: domain + platform + category
  search <query>                 Cari skill by name/keyword/description
  semantic <query>               Cari skill by semantic meaning (TF-IDF + cosine similarity)
  similarity <a> <b>             Cosine similarity antara 2 skill

 ── INFO ──
  info <skill>                   Detail skill (lengkap 9 lapis)
  classify <skill>               Klasifikasi polymorphic
  relations <skill>              Relasi skill
  ontology <skill>               OWL class & semantic properties
  inheritance <skill>            Pohon inheritance (parent + children)

 ── GRAPH ──
  graph <skill>                  Traversal BFS (depth 2)
  path <from> <to>               Shortest path antara 2 skill (BFS)
  cluster <skill>                Connected component / ekosistem
  recommend <skill> [n]          Rekomendasi skill terkait (default 5)
  centrality [n]                 Top-N skill paling sentral dalam graph

 ── SUGGEST ──
  suggest <task-desc>            Rekomendasi skill untuk task (auto-skill routing)

 ── STATS ──
  stats                          Statistik database 9 lapis
  trending                       Skill terbaru di-update
  communities                    Skill clusters / communities
  schema                         Ringkasan schema database

EXAMPLES:
  bash TOOLS.sh path cloudflare semgrep
  bash TOOLS.sh recommend hunt-xss 10
  bash TOOLS.sh centrality 20
  bash TOOLS.sh by-status abstract
  bash TOOLS.sh inheritance hunt-xss
  bash TOOLS.sh ontology cloudflare
  bash TOOLS.sh semantic "deploy web app"
HELP
}

check_registry() {
    if [ ! -f "$REGISTRY" ]; then
        echo "ERROR: REGISTRY.json not found. Run sync-registry.sh first."
        exit 1
    fi
}

# ─── PYTHON HELPER (writes code to temp file, passes registry as argv[1]) ────
run_python() {
    local code="$1"
    shift
    local tmpf
    tmpf=$(mktemp /tmp/opencode-skills-XXXXXX.py)
    printf '%s\n' "$code" > "$tmpf"
    python3 "$tmpf" "$REGISTRY" "$@"
    rm -f "$tmpf"
}

# ===== FILTER COMMANDS ======================================================

cmd_list() {
    check_registry
    run_python "$(cat << 'PYEOF'
import json, sys
r = json.load(open(sys.argv[1]))
for name in sorted(r["skills"]):
    s = r["skills"][name]
    icon = {"agensi": "A", "agents": "G", "abstract": chr(8853)}.get(s.get("source", ""), "?")
    ver = str(s.get("version", "?"))
    st = str(s.get("status", "?"))
    src = str(s.get("source", ""))
    print(f"{icon} {name:30s} v{ver:10s} [{st:10s}] {src}")
PYEOF
)"
}

cmd_count() {
    check_registry
    run_python "$(cat << 'PYEOF'
import json, sys
r = json.load(open(sys.argv[1]))
print(f"Total skills       : {len(r['skills'])}")
srcs = {}
for s in r["skills"].values():
    src = s.get("source", "?")
    srcs[src] = srcs.get(src, 0) + 1
for src, cnt in sorted(srcs.items()):
    print(f"  From {src:<15s}: {cnt}")
abstract_cnt = sum(1 for s in r["skills"].values() if s.get("status") == "abstract")
active_cnt = sum(1 for s in r["skills"].values() if s.get("status") == "active")
total_rel = sum(len(s.get("relations", [])) for s in r["skills"].values())
owl_classes = set(s.get("ontology", {}).get("owl_class", "") for s in r["skills"].values())
inh_chains = sum(1 for s in r["skills"].values() if s.get("inheritance", {}).get("parent"))
print(f"Abstract skills   : {abstract_cnt}")
print(f"Active (concrete) : {active_cnt}")
print(f"Total relations   : {total_rel}")
print(f"Ontology classes  : {len(owl_classes)}")
print(f"Inheritance chains: {inh_chains}")
PYEOF
)"
}

cmd_filter() {
    local field="$1" value="$2"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
q = '$value'.lower()
count = 0
for name in sorted(r['skills']):
    s = r['skills'][name]
    items = [t.lower() for t in s['polymorphic'].get('$field', [])]
    if q in items:
        stat = s.get('status', '?')
        src = s.get('source', '?')
        print(f'  [{stat:10s}] {name:30s} src={src}')
        count += 1
print(f'\nTotal: {count} skills')
PYEOF
)"
}

cmd_by_status() {
    local status="$1"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
q = '$status'.lower()
count = 0
for name in sorted(r['skills']):
    s = r['skills'][name]
    if s.get('status', '').lower() == q:
        doms = ','.join(s['polymorphic']['domains'][:2])
        ver = str(s.get('version', '?'))
        print(f'  {name:30s} [{doms:20s}] v{ver}')
        count += 1
print(f'\nTotal: {count} skills with status={q}')
PYEOF
)"
}

cmd_search() {
    local query="$1"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
q = '$query'.lower()
count = 0
for name in sorted(r['skills']):
    s = r['skills'][name]
    haystack = (name.lower() + ' ' + str(s.get('description', '')).lower() + ' ' +
                str(s['polymorphic']).lower() + ' ' + str(s.get('trigger_keywords', '')).lower())
    if q in haystack:
        rels = len(s.get('relations', []))
        inh = s.get('inheritance', {}).get('parent') or ''
        owl = (s.get('ontology') or {}).get('owl_class') or ''
        print(f'  {name:30s} owl={str(owl):20s} parent={str(inh):20s} rels={rels}')
        count += 1
print(f'\nFound: {count} skills')
PYEOF
)"
}

cmd_semantic() {
    local query="$*"
    [ -z "$query" ] && { echo "Usage: semantic <query>"; return 1; }
    check_registry
    run_python "$(cat << 'PYEOF'
import json, sys, math, re
from collections import Counter

r = json.load(open(sys.argv[1]))
query = sys.argv[2].lower()

# Build corpus: all skill texts
corpus = {}
for name, s in r["skills"].items():
    if s.get("status") == "abstract":
        continue
    text = (name.lower() + " " +
            s.get("description", "").lower() + " " +
            " ".join(s["polymorphic"].get("domains", [])) + " " +
            " ".join(s["polymorphic"].get("platforms", [])) + " " +
            " ".join(s["polymorphic"].get("categories", [])) + " " +
            " ".join(s.get("trigger_keywords", [])))
    words = re.findall(r"[a-z0-9-]+", text)
    corpus[name] = words

# Build vocabulary + DF (document frequency)
doc_count = len(corpus)
df = Counter()
for words in corpus.values():
    for w in set(words):
        df[w] += 1

# TF-IDF vector for a list of words
def vectorize(words):
    tf = Counter(words)
    vec = {}
    for w, cnt in tf.items():
        if df[w] < 2:
            continue  # skip very rare words
        idf = math.log((doc_count + 1) / (df[w] + 1)) + 1
        vec[w] = (1 + math.log(cnt)) * idf
    return vec

# Cosine similarity
def cosine(a, b):
    dot = sum(a.get(w, 0) * b.get(w, 0) for w in set(a) | set(b))
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return dot / (na * nb) if na > 0 and nb > 0 else 0.0

q_words = re.findall(r"[a-z0-9-]+", query)
q_vec = vectorize(q_words)
if not q_vec:
    print("Query too short or no meaningful terms.")
    sys.exit(0)

scores = {}
for name, words in corpus.items():
    vec = vectorize(words)
    sim = cosine(q_vec, vec)
    if sim > 0.01:
        scores[name] = sim

ranked = sorted(scores.items(), key=lambda x: -x[1])

print("═══ SEMANTIC SEARCH ═══")
print()
print(f"Query: {query}")
print(f"Results: {min(len(ranked), 15)} of {len(ranked)}")
print()
for name, sim in ranked[:15]:
    s = r["skills"][name]
    doms = ", ".join(s["polymorphic"].get("domains", [])[:2])
    owl = s.get("ontology", {}).get("owl_class", "?")
    print(f"  [{sim:.3f}] {name:30s}  OWL: {owl:20s}  [{doms}]")

if not ranked:
    print("  (no results)")
PYEOF
)" "$*"
}

# ===== POLYFILTER ============================================================

cmd_polyfilter() {
    local domain="$1" platform="$2" category="$3"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
d_q = '$domain'.lower() if '$domain' else ''
p_q = '$platform'.lower() if '$platform' else ''
c_q = '$category'.lower() if '$category' else ''
count = 0
for name in sorted(r['skills']):
    s = r['skills'][name]
    doms = [x.lower() for x in s['polymorphic'].get('domains', [])]
    plats = [x.lower() for x in s['polymorphic'].get('platforms', [])]
    cats = [x.lower() for x in s['polymorphic'].get('categories', [])]
    if (not d_q or d_q in doms) and (not p_q or p_q in plats) and (not c_q or c_q in cats):
        ow = s.get('ontology', {}).get('owl_class', '?')
        st = s.get('status', '?')
        print(f'  [{st:10s}] {name:30s} owl={ow:20s}')
        count += 1
print(f'\nTotal: {count} skills')
PYEOF
)"
}

# ===== INFO ==================================================================

cmd_info() {
    local skill="$1"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
target = '$skill'
if target not in r['skills']:
    print('ERROR: skill \"$skill\" not found')
    matches = [s for s in r['skills'] if '$skill' in s]
    if matches:
        print('Did you mean:', matches[:5])
    sys.exit(1)
s = r['skills'][target]
print('═' * 55)
print(f'  SKILL: {s["name"]}')
print(f'  ID:    {s["id"]}')
print('═' * 55)
print(f'  Version:   {s.get("version","?")}')
print(f'  Author:    {s.get("author","?")}')
print(f'  Updated:   {s.get("updated","?")}')
print(f'  Source:    {s.get("source","?")}')
print(f'  Status:    {s.get("status","?")}')
print(f'  Has SKILL: {"YES" if s.get("has_skillemd") else "NO"}')
print()
print('─ L1: CORE ────────────────────────────────────')
id_ = s.get('identity', {})
print(f'  Composite key: {id_.get("composite_key")}')
print(f'  Aliases: {id_.get("aliases", [])[:5]}')
print(f'  Is weak: {id_.get("is_weak")}')
print()
print('─ L2: POLYMORPHIC ────────────────────────────')
p = s['polymorphic']
print(f'  Domains:    {p.get("domains", [])}')
print(f'  Platforms:  {p.get("platforms", [])}')
print(f'  Categories: {p.get("categories", [])}')
print(f'  Tags:       {p.get("tags", [])}')
print()
print('─ L3: WEAK ENTITIES ──────────────────────────')
we = s.get('weak_entities', {})
print(f'  Versions: {len(we.get("versions", []))}')
print(f'  Aliases:  {len(we.get("aliases", []))}')
for v in we.get('versions', [])[:2]:
    print(f'    v{v.get("id","?")} ({v.get("version","?")})')
print()
print('─ L4: INHERITANCE ────────────────────────────')
inh = s.get('inheritance', {})
print(f'  Parent:     {inh.get("parent")}')
print(f'  Is abstract:{inh.get("is_abstract")}')
print(f'  Children:   {inh.get("children", [])[:5]}')
print(f'  Depth:      {inh.get("depth", 0)}')
print()
print('─ L5: ASSOCIATIVE (relations) ───────────────')
for rel in s.get('relations', []):
    attrs = rel.get('attributes', {})
    a = ''
    if attrs:
        a = ' | ' + ', '.join(f'{k}={v}' for k, v in attrs.items())
    print(f'  [{rel["type"]:15s}] -> {rel["target"]:30s} ({rel["target_type"]}){a}')
print()
print('─ L6: GRAPH ──────────────────────────────────')
g = s.get('graph', {})
print(f'  Degree:     {g.get("node_degree", 0)} (in={g.get("in_degree", 0)}, out={g.get("out_degree", 0)})')
print(f'  Centrality: {g.get("centrality_score", 0)}')
print(f'  Neighbors:  {g.get("neighbors", [])[:10]}')
print()
print('─ L7: TEMPORAL ───────────────────────────────')
t = s.get('temporal', {})
for ev in t.get('timeline', [])[:3]:
    print(f'  {ev.get("date","?")} {ev.get("event","?")} {ev.get("tag","")}')
print()
print('─ L8: ONTOLOGY ───────────────────────────────')
o = s.get('ontology', {})
print(f'  OWL class:  {o.get("owl_class","?")}')
print(f'  Superclass: {o.get("owl_superclass","?")}')
sp = o.get('semantic_properties', {})
print(f'  Difficulty: {sp.get("difficulty","?")}')
print(f'  Est. time:  {sp.get("learning_time_minutes","?")} min')
print()
print('─ DESCRIPTION ───────────────────────────────')
desc = s.get('description', '')
if len(desc) > 300:
    print(f'  {desc[:300]}...')
else:
    print(f'  {desc}')
PYEOF
)"
}

cmd_classify() {
    local skill="$1"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
target = '$skill'
if target in r['skills']:
    s = r['skills'][target]
    print('═══ POLYMORPHIC + INHERITANCE + ONTOLOGY ═══')
    print(f'Name:         {s["name"]}')
    p = s['polymorphic']
    print(f'Domains:      {p.get("domains", [])}')
    print(f'Platforms:    {p.get("platforms", [])}')
    print(f'Categories:   {p.get("categories", [])}')
    print(f'Tags:         {p.get("tags", [])}')
    print(f'Status:       {s.get("status","?")}')
    print(f'OWL Class:    {s.get("ontology",{}).get("owl_class","?")}')
    inh = s.get('inheritance', {})
    print(f'Parent:       {inh.get("parent","none")}')
    print(f'Children:     {inh.get("children", [])[:8]}')
else:
    print('ERROR: skill not found')
PYEOF
)"
}

# ===== RELATIONS / GRAPH / ONTOLOGY / INHERITANCE ===========================

cmd_relations() {
    local skill="$1"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
target = '$skill'
print(f'═══ RELATIONS: {target} ═══')
print()
print('-> FORWARD (merujuk ke):')
if target in r['skills']:
    sk = r['skills'][target]
    for rel in sk.get('relations', []):
        attrs = rel.get('attributes', {})
        a = f' str={attrs.get("strength","")}' if attrs else ''
        print(f'  [{rel["type"]:15s}] -> {rel["target"]:30s} ({rel["target_type"]}){a}')
else:
    print('  (not in registry)')
print()
print('<- BACKWARD (dirujuk oleh):')
for name, s in sorted(r['skills'].items()):
    for rel in s.get('relations', []):
        if rel['target'] == target:
            print(f'  [{rel["type"]:15s}] <- {name:30s}')
PYEOF
)"
}

cmd_ontology() {
    local skill="$1"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
target = '$skill'
if target in r['skills']:
    s = r['skills'][target]
    o = s.get('ontology', {})
    print('═══ ONTOLOGY ═══')
    print(f'OWL Class:       {o.get("owl_class","?")}')
    print(f'OWL Superclass:  {o.get("owl_superclass","?")}')
    print()
    sp = o.get('semantic_properties', {})
    print('Semantic Properties:')
    for k, v in sp.items():
        print(f'  {k:25s}: {v}')
    print()
    print('Polymorphic Domains:')
    for d in s['polymorphic'].get('domains', []):
        print(f'  -> {d}')
else:
    print('ERROR: skill not found')
PYEOF
)"
}

cmd_inheritance() {
    local skill="$1"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
target = '$skill'

def print_tree(name, prefix='', visited=None):
    if visited is None:
        visited = set()
    if name in visited or name not in r['skills']:
        return
    visited.add(name)
    s = r['skills'][name]
    abstr = chr(8853) if s.get('inheritance', {}).get('is_abstract') else chr(9675)
    stat = str(s.get('status', '?'))[:4]
    print(f'{prefix}{abstr} {name:30s} [{stat}]')
    children = s.get('inheritance', {}).get('children', [])
    for i, child in enumerate(children):
        is_last = (i == len(children) - 1)
        new_prefix = prefix + ('    ' if is_last else '  | ')
        connector = '  +--' if is_last else '  |--'
        print(f'{prefix}{connector}', end='')
        print_tree(child, new_prefix, visited)

if target not in r['skills']:
    print('ERROR: skill not found')
    sys.exit(1)

s = r['skills'][target]
parent = s.get('inheritance', {}).get('parent')
ancestors = []
while parent and parent in r['skills']:
    ancestors.insert(0, parent)
    parent = r['skills'][parent].get('inheritance', {}).get('parent')

print(f'═══ INHERITANCE TREE: {target} ═══')
print()
if ancestors:
    print('Ancestor chain:')
    for a in ancestors:
        print(f'  -> {a}')
    print()
print_tree(target)
PYEOF
)"
}

cmd_graph() {
    local root="$1"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
root = sys.argv[2]

def bfs(node, max_depth=2, visited=None):
    if visited is None:
        visited = set()
    queue = [(node, 0)]
    result = []
    while queue:
        current, depth = queue.pop(0)
        if current in visited or current not in r['skills']:
            continue
        visited.add(current)
        result.append((current, depth))
        if depth < max_depth:
            for rel in r['skills'][current].get('relations', []):
                if rel['target_type'] == 'skill' and rel['target'] in r['skills']:
                    queue.append((rel['target'], depth + 1))
    return result

print('═══ GRAPH (BFS depth 2): ' + root + ' ═══')
nodes = bfs(root)
for name, depth in nodes:
    s = r['skills'][name]
    indent = '  ' * depth
    icon = {0: chr(9679), 1: chr(9675), 2: chr(183)}.get(depth, chr(183))
    doms = ','.join(s['polymorphic']['domains'][:2])
    rel_types = [rel['type'] for rel in s.get('relations', [])]
    print(f'{indent}{icon} {name:25s} [{doms:20s}] rels={rel_types[:3]}')
print(f'\nNodes visited: {len(nodes)}')
PYEOF
)" $root
}

cmd_path() {
    local from="$1" to="$2"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
from_node = sys.argv[2]
to_node = sys.argv[3]
from collections import deque

def bfs_shortest_path(start, goal):
    if start not in r['skills'] or goal not in r['skills']:
        return None
    visited = {start}
    queue = deque([(start, [start])])
    while queue:
        node, path = queue.popleft()
        for rel in r['skills'][node].get('relations', []):
            if rel['target_type'] != 'skill':
                continue
            neighbor = rel['target']
            if neighbor not in r['skills']:
                continue
            if neighbor == goal:
                return path + [neighbor]
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return None

print(f'═══ SHORTEST PATH: \"{from_node}\" -> \"{to_node}\" ═══')
path = bfs_shortest_path(from_node, to_node)
if path:
    print(f'Distance: {len(path)-1} hops')
    print()
    for i, p in enumerate(path):
        s = r['skills'][p]
        doms = ','.join(s['polymorphic']['domains'][:1])
        arrow = ' -> ' if i < len(path)-1 else ''
        print(f'  {i}. {p:30s} [{doms:15s}]{arrow}')
else:
    print('No path found (skills may be in different disconnected components)')
PYEOF
)" $from $to
}

cmd_cluster() {
    local skill="$1"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
target = sys.argv[2]

def get_component(start):
    if start not in r['skills']:
        return set()
    visited = set()
    queue = [start]
    while queue:
        node = queue.pop(0)
        if node in visited:
            continue
        visited.add(node)
        for rel in r['skills'][node].get('relations', []):
            if rel['target_type'] == 'skill' and rel['target'] in r['skills']:
                queue.append(rel['target'])
    return visited

print(f'═══ CONNECTED COMPONENT: {target} ═══')
comp = get_component(target)
print(f'Component size: {len(comp)} skills')
print()
from collections import Counter
domains = Counter()
for name in comp:
    for d in r['skills'][name]['polymorphic'].get('domains', []):
        domains[d] += 1
print('Domain composition:')
for d, cnt in domains.most_common():
    print(f'  {d:15s}: {cnt} skills')
print()
print('Skills in component:')
for name in sorted(comp):
    s = r['skills'][name]
    deg = s.get('graph', {}).get('node_degree', 0)
    print(f'  {name:30s} deg={deg}')
PYEOF
)" $skill
}

cmd_recommend() {
    local skill="$1" n="${2:-5}"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
target = sys.argv[2]
n = int(sys.argv[3])
from collections import Counter

if target not in r['skills']:
    print('ERROR: skill not found')
    sys.exit(1)

ts = r['skills'][target]
target_domains = set(ts['polymorphic'].get('domains', []))
target_cats = set(ts['polymorphic'].get('categories', []))
target_platforms = set(ts['polymorphic'].get('platforms', []))
target_neighbors = set(ts.get('graph', {}).get('neighbors', []))

scores = Counter()
for name, s in r['skills'].items():
    if name == target:
        continue
    doms = set(s['polymorphic'].get('domains', []))
    cats = set(s['polymorphic'].get('categories', []))
    plats = set(s['polymorphic'].get('platforms', []))
    neighbors = set(s.get('graph', {}).get('neighbors', []))
    direct = 5 if name in target_neighbors else 0
    dom_overlap = len(doms & target_domains) * 3
    cat_overlap = len(cats & target_cats) * 2
    plat_overlap = len(plats & target_platforms) * 1
    mutual = len(neighbors & target_neighbors) * 2
    total = direct + dom_overlap + cat_overlap + plat_overlap + mutual
    if total > 0:
        scores[name] = total

print(f'═══ RECOMMENDATIONS for \"{target}\" (top {n}) ═══')
print()
for name, score in scores.most_common(n):
    s = r['skills'][name]
    doms = ','.join(s['polymorphic'].get('domains', [])[:2])
    deg = s.get('graph', {}).get('node_degree', 0)
    shared = []
    sd = set(s['polymorphic'].get('domains', []))
    sc = set(s['polymorphic'].get('categories', []))
    sp = set(s['polymorphic'].get('platforms', []))
    if sd & target_domains:
        shared.append('dom')
    if sc & target_cats:
        shared.append('cat')
    if sp & target_platforms:
        shared.append('plat')
    print(f'  [{score:3d}] {name:30s} [{doms:20s}] shared={shared} deg={deg}')
PYEOF
)" $skill $n
}

cmd_centrality() {
    local n="${1:-10}"
    check_registry
    run_python "$(cat << PYEOF
import json, sys
r = json.load(open(sys.argv[1]))
n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
sorted_skills = sorted(r['skills'].items(),
    key=lambda x: x[1].get('graph', {}).get('centrality_score', 0), reverse=True)
print(f'═══ TOP {n} MOST CENTRAL SKILLS ═══')
print()
for name, s in sorted_skills[:n]:
    g = s.get('graph', {})
    doms = ','.join(s['polymorphic'].get('domains', [])[:2])
    print(f'  [{g.get("centrality_score", 0):.4f}] {name:30s} [{doms:20s}] deg={g.get("node_degree", 0)}')
PYEOF
)" $n
}

# ===== STATS =================================================================

cmd_stats() {
    check_registry
    run_python "$(cat << 'PYEOF'
import json, sys
r = json.load(open(sys.argv[1]))
from collections import Counter

print("╔══════════════════════════════════════════════════════════╗")
print("║  SKILLS DATABASE — 9 Layer Statistics                   ║")
print("╚══════════════════════════════════════════════════════════╝")
print()

print("L1 CORE")
print(f"  Total skills:      {len(r['skills'])}")
statuses = Counter(s.get("status", "?") for s in r["skills"].values())
for st, cnt in statuses.most_common():
    print(f"    {st:<15s}: {cnt}")
print()

print("L2 POLYMORPHIC")
domains = Counter()
platforms = Counter()
cats = Counter()
for s in r["skills"].values():
    for d in s["polymorphic"].get("domains", []): domains[d] += 1
    for p in s["polymorphic"].get("platforms", []): platforms[p] += 1
    for c in s["polymorphic"].get("categories", []): cats[c] += 1
print(f"  Domains:    {len(domains)} — {[d for d,_ in domains.most_common(5)]}")
print(f"  Platforms:  {len(platforms)} — {[p for p,_ in platforms.most_common(5)]}")
print(f"  Categories: {len(cats)} — {[c for c,_ in cats.most_common(5)]}")
print()

print("L3 WEAK ENTITIES")
total_versions = sum(len(s.get("weak_entities", {}).get("versions", [])) for s in r["skills"].values())
total_aliases = sum(len(s.get("weak_entities", {}).get("aliases", [])) for s in r["skills"].values())
print(f"  Versions: {total_versions}")
print(f"  Aliases:  {total_aliases}")
print()

print("L4 INHERITANCE")
abstract_count = sum(1 for s in r["skills"].values() if s.get("inheritance", {}).get("is_abstract"))
children_count = sum(1 for s in r["skills"].values() if s.get("inheritance", {}).get("parent"))
total_skills = max(len(r["skills"]), 1)
avg_depth = sum(s.get("inheritance", {}).get("depth", 0) for s in r["skills"].values()) / total_skills
print(f"  Abstract parents: {abstract_count}")
print(f"  Children:         {children_count}")
print(f"  Avg depth:        {avg_depth:.2f}")
print()

print("L5 ASSOCIATIVE (relations)")
total_rel = sum(len(s.get("relations", [])) for s in r["skills"].values())
rel_types = Counter()
for s in r["skills"].values():
    for rel in s.get("relations", []):
        rel_types[rel["type"]] += 1
print(f"  Total relations: {total_rel}")
for rt, cnt in rel_types.most_common():
    print(f"    {rt:<20s}: {cnt}")
print()

print("L6 GRAPH")
total_edges = sum(s.get("graph", {}).get("node_degree", 0) for s in r["skills"].values())
avg_centrality = sum(s.get("graph", {}).get("centrality_score", 0) for s in r["skills"].values()) / total_skills
print(f"  Total edges:     {total_edges}")
print(f"  Avg centrality:  {avg_centrality:.4f}")
sorted_s = sorted(r["skills"].items(), key=lambda x: x[1].get("graph", {}).get("centrality_score", 0), reverse=True)
if sorted_s:
    top_name = sorted_s[0][0]
    top_score = sorted_s[0][1].get("graph", {}).get("centrality_score", 0)
    print(f"  Most central:    {top_name} ({top_score:.4f})")
print()

print("L7 TEMPORAL")
updated_2026 = sum(1 for s in r["skills"].values() if str(s.get("updated", "")).startswith("2026"))
print(f"  Updated in 2026: {updated_2026}")
print()

print("L8 ONTOLOGY")
owl_classes = set(s.get("ontology", {}).get("owl_class", "") for s in r["skills"].values())
print(f"  OWL classes: {len(owl_classes)}")
for oc in sorted(owl_classes):
    cnt = sum(1 for s in r["skills"].values() if s.get("ontology", {}).get("owl_class", "") == oc)
    print(f"    {oc:<25s}: {cnt} skills")

print()
print("L9 VECTOR (semantic search)")
print(f"  Model:         all-MiniLM-L6-v2 (384d)")
print(f"  Embeddings:    enabled (TF-IDF + cosine similarity)")
PYEOF
)"
}

cmd_trending() {
    check_registry
    run_python "$(cat << 'PYEOF'
import json, sys
r = json.load(open(sys.argv[1]))
sorted_skills = sorted(r["skills"].items(),
    key=lambda x: x[1].get("updated", "0000"), reverse=True)
print("═══ TRENDING SKILLS ═══")
print()
for name, s in sorted_skills[:20]:
    doms = ",".join(s["polymorphic"].get("domains", [])[:2])
    owl = s.get("ontology", {}).get("owl_class", "?")
    ver = str(s.get("version", "?"))
    print(f"  {s.get('updated','?'):12s} {name:30s} owl={owl:20s} v{ver}")
PYEOF
)"
}

cmd_communities() {
    check_registry
    run_python "$(cat << 'PYEOF'
import json, sys
r = json.load(open(sys.argv[1]))
from collections import Counter

adj = {}
for name, s in r["skills"].items():
    adj[name] = set()
    for rel in s.get("relations", []):
        if rel["target_type"] == "skill" and rel["target"] in r["skills"]:
            adj[name].add(rel["target"])

visited = set()
communities = []
for node in adj:
    if node not in visited:
        comp = set()
        queue = [node]
        while queue:
            cur = queue.pop(0)
            if cur in visited:
                continue
            visited.add(cur)
            comp.add(cur)
            for nb in adj.get(cur, set()):
                if nb not in visited:
                    queue.append(nb)
        if comp:
            communities.append(comp)

communities.sort(key=len, reverse=True)

print(f"═══ SKILL COMMUNITIES ({len(communities)} found) ═══")
print()
for i, comp in enumerate(communities[:10]):
    doms = Counter()
    for n in comp:
        for d in r["skills"][n]["polymorphic"].get("domains", []):
            doms[d] += 1
    top_dom = doms.most_common(3)
    dom_str = ", ".join(f"{d}({c})" for d, c in top_dom)
    print(f"  Community {i+1}: {len(comp)} skills")
    print(f"    Top domains: {dom_str}")
    members = sorted(comp)[:8]
    print(f"    Members: {', '.join(members)}")
    if len(comp) > 8:
        print(f"    ... and {len(comp)-8} more")
    print()
PYEOF
)"
}

cmd_schema() {
    check_registry
    run_python "$(cat << 'PYEOF'
import json, sys
r = json.load(open(sys.argv[1]))
print("╔═══════════════════════════════════════════════════╗")
print("║  SKILLS DATABASE — Schema v2026.2                ║")
print("╠═══════════════════════════════════════════════════╣")
print(f"║  Version: {str(r.get('version','?')):40s}║")
print(f"║  Schema:  {str(r.get('schema','?')):40s}║")
print(f"║  Generated: {str(r.get('generated','?')):38s}║")
print("╚═══════════════════════════════════════════════════╝")
print()
print("LAYERS:")
layers = [
    ("CORE", "Strong entity with composite key (name, source, version)"),
    ("POLYMORPHIC", "1 skill -> many domain/platform/category/tag via taggable_type"),
    ("WEAK ENTITY", "SkillVersion, SkillAlias - dependent, partial key"),
    ("INHERITANCE", "Generalization/Specialization - abstract->concrete"),
    ("ASSOCIATIVE", "Relations with attributes (strength, context, weight)"),
    ("GRAPH", "BFS/DFS, shortest path, centrality, communities"),
    ("TEMPORAL", "Timeline of skill evolution"),
    ("ONTOLOGY", "OWL-style: classes, properties, semantic relations"),
    ("VECTOR", "384-dim embedding for semantic similarity"),
]
for i, (name, desc) in enumerate(layers, 1):
    print(f"  L{i}: {name:<20s} - {desc}")
print()
print("TAXONOMIES:")
for tax, vals in r.get("polymorphic_taxonomies", {}).items():
    if isinstance(vals, list) and len(vals) < 20:
        print(f"  {tax:25s}: {vals}")
print()
print("RELATION TYPES:")
for rt in r.get("polymorphic_taxonomies", {}).get("relation_types", []):
    print(f"  . {rt}")
print()
print("STATUSES:")
for st in r.get("polymorphic_taxonomies", {}).get("statuses", []):
    print(f"  . {st}")
PYEOF
)"
}

# ===== MAIN DISPATCH ========================================================

cmd_suggest() {
    check_registry
    local query="$*"
    [ -z "$query" ] && { echo "Usage: suggest <task description>"; return 1; }
    run_python "$(cat << 'PYEOF'
import json, sys, re
from collections import Counter

r = json.load(open(sys.argv[1]))
query = sys.argv[2].lower()
tokens = set(re.findall(r'[a-z0-9-]+', query))

# Weighted scoring: name(4) > keyword/description(3) > domain(2) > category(1)
scores = Counter()
reasons = {}

for name, s in r["skills"].items():
    if s.get("status") == "abstract":
        continue
    score = 0
    match_words = set()

    # Name match (highest weight)
    name_lower = name.lower()
    for t in tokens:
        if t in name_lower or name_lower in t:
            score += 4
            match_words.add(t)

    # Description match
    desc = s.get("description", "").lower()
    for t in tokens:
        if t in desc:
            score += 3
            match_words.add(t)

    # Trigger keywords
    for kw in s.get("trigger_keywords", []):
        kw_lower = kw.lower()
        for t in tokens:
            if t in kw_lower or kw_lower in t:
                score += 3
                match_words.add(t)

    # Domain match (medium weight)
    for d in s["polymorphic"].get("domains", []):
        if d in tokens:
            score += 2
            match_words.add(d)

    # Platform match
    for p in s["polymorphic"].get("platforms", []):
        if p in tokens:
            score += 2
            match_words.add(p)

    # Category match (low weight)
    for c in s["polymorphic"].get("categories", []):
        c_clean = c.replace("-", " ").lower()
        for t in tokens:
            if t in c_clean:
                score += 1
                match_words.add(t)

    # OWL class match
    owl = s.get("ontology", {}).get("owl_class", "").lower().replace("skill", "")
    for t in tokens:
        if t in owl:
            score += 2
            match_words.add(t)

    if score > 0:
        scores[name] = score
        reasons[name] = match_words

if not scores:
    print("No matching skills found.")
    sys.exit(0)

top = scores.most_common(15)
print("═══ SKILL SUGGESTIONS ═══")
print()
print(f"Task: {query}")
print(f"Skills found: {len(scores)}")
print()
for name, sc in top:
    sk = r["skills"][name]
    doms = ", ".join(sk["polymorphic"].get("domains", []))
    owl_cls = sk.get("ontology", {}).get("owl_class", "?")
    match_str = ", ".join(sorted(reasons[name]))
    print(f"  [{sc:3d}] {name}")
    print(f"        OWL: {owl_cls}  |  Domains: {doms}")
    print(f"        Matched: {match_str}")
    print()

PYEOF
)" "$*"
}

cmd_similarity() {
    local a="$1" b="$2"
    [ -z "$a" ] || [ -z "$b" ] && { echo "Usage: similarity <skill-a> <skill-b>"; return 1; }
    check_registry
    run_python "$(cat << 'PYEOF'
import json, sys, math, re
from collections import Counter

r = json.load(open(sys.argv[1]))
a_name = sys.argv[2].lower().replace("-", " ")
b_name = sys.argv[3].lower().replace("-", " ")

def get_text(name):
    s = r["skills"].get(name)
    if not s:
        norm = name.replace(" ", "-")
        matches = [n for n in r["skills"] if norm in n or n in norm]
        if not matches:
            return None, None
        name = matches[0]
        s = r["skills"][name]
    text = (name.lower() + " " +
            s.get("description", "").lower() + " " +
            " ".join(s["polymorphic"].get("domains", [])))
    words = re.findall(r"[a-z0-9-]+", text)
    return name, words

res_a = get_text(a_name)
res_b = get_text(b_name)
if not res_a[0] or not res_b[0]:
    print("Skill not found.")
    sys.exit(1)

a_name_found, a_words = res_a
b_name_found, b_words = res_b

doc_count = 276
# Quick DF estimate using combined word pool
all_words = a_words + b_words
df = Counter()
for w in set(a_words):
    df[w] = 2 if w in b_words else 1
for w in set(b_words):
    if w not in a_words:
        df[w] = 1

def vectorize(words):
    tf = Counter(words)
    vec = {}
    for w, cnt in tf.items():
        idf = math.log((doc_count + 1) / (df.get(w, 1) + 1)) + 1
        vec[w] = cnt * idf
    return vec

def cosine(a, b):
    dot = sum(a.get(w, 0) * b.get(w, 0) for w in set(a) | set(b))
    na = math.sqrt(sum(v * v for v in a.values()))
    nb = math.sqrt(sum(v * v for v in b.values()))
    return dot / (na * nb) if na > 0 and nb > 0 else 0.0

sim = cosine(vectorize(a_words), vectorize(b_words))
print(f"Similarity between '{a_name_found}' and '{b_name_found}': {sim:.4f}")
# Shared words
shared = set(a_words) & set(b_words)
if shared:
    print(f"Shared terms: {', '.join(sorted(shared))}")
PYEOF
)" "$1" "$2"
}

main() {
    local cmd="${1:-help}"
    shift 2>/dev/null || true

    case "$cmd" in
        help|--help|-h)         show_help ;;
        list)                   cmd_list "$@" ;;
        count)                  cmd_count "$@" ;;
        by-domain)              cmd_filter "domains" "$1" ;;
        by-platform)            cmd_filter "platforms" "$1" ;;
        by-category)            cmd_filter "categories" "$1" ;;
        by-tag)                 cmd_filter "tags" "$1" ;;
        by-status)              cmd_by_status "$1" ;;
        search)                 cmd_search "$1" ;;
        semantic)               cmd_semantic "$1" ;;
        polyfilter)             cmd_polyfilter "$1" "$2" "$3" ;;
        info)                   cmd_info "$1" ;;
        classify)               cmd_classify "$1" ;;
        relations)              cmd_relations "$1" ;;
        graph)                  cmd_graph "$1" ;;
        path)                   cmd_path "$1" "$2" ;;
        cluster)                cmd_cluster "$1" ;;
        recommend)              cmd_recommend "$1" "$2" ;;
        centrality)             cmd_centrality "$1" ;;
        ontology)               cmd_ontology "$1" ;;
        inheritance)            cmd_inheritance "$1" ;;
        stats)                  cmd_stats "$@" ;;
        trending)               cmd_trending "$@" ;;
        suggest)                cmd_suggest "$@" ;;
        similarity)             cmd_similarity "$@" ;;
        communities)            cmd_communities "$@" ;;
        schema)                 cmd_schema "$@" ;;
        *)
            echo "Unknown command: $cmd"
            show_help
            exit 1 ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
