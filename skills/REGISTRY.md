# SKILLS DATABASE — Polymorphic Relations Engine v2026.2

> **Enterprise-grade skill database dengan 9 pattern database sekaligus**:
> Polymorphic · Weak Entity · Inheritance · Associative · Graph ·
> Temporal · Composite Key · Ontology · Full-text Search
>
> Mencakup **276 skill** (252 agensi + 18 .agents + 6 abstract) dengan 13 OWL ontology classes,
> 65 inheritance chains, dan 82 graph relations.

---

## ARSITEKTUR 9 LAPIS

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SKILLS KNOWLEDGE GRAPH                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │  L1: CORE — Strong Entity (skill entry)                   │      │
│  │  Setiap skill punya identitas unik: composite key          │      │
│  │  (name + source + version)                                 │      │
│  ├───────────────────────────────────────────────────────────┤      │
│  │  L2: POLYMORPHIC — 1 skill → many domain/platform/cat     │      │
│  │  taggable_type + taggable_id → flexible taxonomy           │      │
│  ├───────────────────────────────────────────────────────────┤      │
│  │  L3: WEAK ENTITY — SkillVersion, SkillAlias, SkillExample │      │
│  │  Tidak bisa berdiri sendiri — butuh parent skill           │      │
│  ├───────────────────────────────────────────────────────────┤      │
│  │  L4: INHERITANCE — Generalization/Specialization          │      │
│  │  hunt-xss ⊂ security-skill, cloudflare ⊂ cloud-platform   │      │
│  ├───────────────────────────────────────────────────────────┤      │
│  │  L5: ASSOCIATIVE ENTITY — Relations dengan atribut        │      │
│  │  pairs_with{strength, context, count}, prerequisite{level} │      │
│  ├───────────────────────────────────────────────────────────┤      │
│  │  L6: GRAPH — Neo4j-style traversal untuk rekomendasi      │      │
│  │  Shortest path, connected components, skill clusters       │      │
│  ├───────────────────────────────────────────────────────────┤      │
│  │  L7: TEMPORAL — Lambda architecture                       │      │
│  │  Current + history: skill evolution timeline               │      │
│  ├───────────────────────────────────────────────────────────┤      │
│  │  L8: ONTOLOGY — Semantic web / OWL-style                  │      │
│  │  prerequisite_of, similar_to, complementary_to, alias_of   │      │
│  ├───────────────────────────────────────────────────────────┤      │
│  │  L9: VECTOR — Embedding-based semantic search             │      │
│  │  Cosine similarity antar deskripsi skill                   │      │
│  └───────────────────────────────────────────────────────────┘      │
│                              │                                       │
│                              ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │  META-RELATIONS: Skill bisa merujuk skill lain             │      │
│  │  plus dokumen, tools, platform, framework, bahasa          │      │
│  └───────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ════════════════════════════════════════════════════════════════
## L1: CORE ENTITY — Strong Entity dengan Composite Key
## ════════════════════════════════════════════════════════════════

Setiap skill diidentifikasi oleh **composite key**: `(name, source, version)` — bukan cuma name.
Ini memungkinkan 2 skill dengan nama sama dari sumber berbeda.

```json
{
  "id": "skill:cloudflare:agensi",
  "name": "cloudflare",
  "source": "agensi",
  "version": "2026.1",
  "author": "Agensi / OpenCode",
  "updated": "2026-06-20",
  "created": "2025-08-15",
  "status": "active",

  "identity": {
    "composite_key": ["name", "source", "version"],
    "primary_descriptor": "name",
    "aliases": ["cf", "cloudflare-workers", "cloudflare-pages"],
    "is_weak": false,
    "parent_id": null
  }
}
```

### Status Skill
| Status | Arti |
|--------|------|
| `active` | Skill siap pakai |
| `deprecated` | Masih ada tapi tidak disarankan |
| `superseded` | Sudah digantikan skill lain |
| `draft` | Dalam pengembangan |
| `archived` | Tidak dipakai lagi |

---

## ════════════════════════════════════════════════════════════════
## L2: POLYMORPHIC — Flexible Taxonomy via taggable pattern
## ════════════════════════════════════════════════════════════════

Implementasi **polymorphic association pattern**: satu tabel/struktur `taggings`
bisa mereferensi banyak tipe entity. Di registry kita, skill punya polymorphic tags
ke 3 taxonomy table (domains, platforms, categories) plus custom tags.

```json
{
  "polymorphic": {
    "taggings": [
      { "taggable_type": "domain",     "taggable_id": "security" },
      { "taggable_type": "domain",     "taggable_id": "cloud" },
      { "taggable_type": "platform",   "taggable_id": "cloudflare" },
      { "taggable_type": "platform",   "taggable_id": "github" },
      { "taggable_type": "category",   "taggable_id": "infrastructure" },
      { "taggable_type": "category",   "taggable_id": "security" },
      { "taggable_type": "custom",     "taggable_id": "workers" },
      { "taggable_type": "custom",     "taggable_id": "pages" },
      { "taggable_type": "framework",  "taggable_id": "hono" },
      { "taggable_type": "language",   "taggable_id": "javascript" },
      { "taggable_type": "language",   "taggable_id": "typescript" },
      { "taggable_type": "tool",       "taggable_id": "wrangler" }
    ]
  }
}
```

### Polymorphic Taxonomy Types
| `taggable_type` | Contoh nilai | Tujuan |
|----------------|-------------|--------|
| `domain` | security, marketing, cloud | Bidang keahlian |
| `platform` | cloudflare, github, vercel | Platform target |
| `category` | audit, testing, fuzzing | Jenis aktivitas |
| `custom` | workers, r2, d1 | Tag bebas |
| `framework` | react, next.js, django | Framework terkait |
| `language` | javascript, python, rust | Bahasa pemrograman |
| `tool` | wrangler, docker, git | Alat yang dipakai |
| `standard` | iso-27001, owasp, pci-dss | Standar/referensi |
| `vendor` | supabase, vercel, hashicorp | Vendor terkait |

---

## ════════════════════════════════════════════════════════════════
## L3: WEAK ENTITY — Dependent entities
## ════════════════════════════════════════════════════════════════

**Weak entity** = entitas yang tidak punya identitas sendiri — butuh **strong entity**
(parent skill) untuk eksis. Diidentifikasi oleh **partial key** + foreign key ke parent.

```
STRONG: skill:cloudflare
  └── WEAK: skill:cloudflare:version:v1.0    (SkillVersion)
  └── WEAK: skill:cloudflare:alias:cf        (SkillAlias)
  └── WEAK: skill:cloudflare:example:1       (SkillExample)
```

### Weak Entity Types

#### SkillVersion — Riwayat versi skill
```json
{
  "weak_entities": {
    "versions": [
      {
        "id": "cloudflare:v2025.1",
        "parent_name": "cloudflare",
        "partial_key": "v2025.1",
        "version": "2025.1",
        "author": "OpenCode",
        "updated": "2025-10-01",
        "changes": ["Initial Cloudflare Workers support", "Wrangler v3 integration"]
      },
      {
        "id": "cloudflare:v2026.1",
        "parent_name": "cloudflare",
        "partial_key": "v2026.1",
        "version": "2026.1",
        "author": "Agensi / OpenCode",
        "updated": "2026-06-20",
        "changes": ["D1 support", "Workers AI support", "Agents SDK"]
      }
    ]
  }
}
```

#### SkillAlias — Nama alternatif (weak karena tak berdiri sendiri)
```json
{
  "weak_entities": {
    "aliases": [
      { "alias": "cf", "type": "abbreviation", "language": "en" },
      { "alias": "cloudflare workers", "type": "fullname", "language": "en" },
      { "alias": "cloudflare pages", "type": "subproduct", "language": "en" }
    ]
  }
}
```

#### SkillExample — Contoh penggunaan (weak entity)
```json
{
  "weak_entities": {
    "examples": [
      {
        "title": "Deploy Worker with Wrangler",
        "code_snippet": "wrangler deploy",
        "language": "bash",
        "difficulty": "beginner"
      }
    ]
  }
}
```

---

## ════════════════════════════════════════════════════════════════
## L4: INHERITANCE — Generalization / Specialization
## ════════════════════════════════════════════════════════════════

Mengadopsi **Single Table Inheritance (STI)** dan **Class Table Inheritance (CTI)**:
skill bisa jadi subtype dari skill lain, mewarisi semua properti parent.

```
ABSTRACT: security-skill (tidak punya SKILL.md sendiri — pure abstract)
  ├── CONCRETE: hunt-xss           (IS-A security-skill)
  ├── CONCRETE: hunt-sqli          (IS-A security-skill)
  ├── CONCRETE: hunt-ssrf          (IS-A security-skill)
  ├── CONCRETE: hunt-idor          (IS-A security-skill)
  └── CONCRETE: hunt-csrf          (IS-A security-skill)

ABSTRACT: cloud-platform
  ├── CONCRETE: cloudflare         (IS-A cloud-platform)
  ├── CONCRETE: aws                (IS-A cloud-platform)
  └── CONCRETE: gcp                (IS-A cloud-platform)

ABSTRACT: fuzzing-engine
  ├── CONCRETE: libfuzzer          (IS-A fuzzing-engine)
  ├── CONCRETE: aflpp              (IS-A fuzzing-engine)
  ├── CONCRETE: atheris            (IS-A fuzzing-engine — Python)
  ├── CONCRETE: ruzzy              (IS-A fuzzing-engine — Ruby)
  └── CONCRETE: cargo-fuzz         (IS-A fuzzing-engine — Rust)
```

```json
{
  "inheritance": {
    "parent": "security-skill",
    "parent_type": "abstract",
    "children": ["hunt-xss", "hunt-sqli", "hunt-ssrf", "hunt-idor"],
    "depth": 2,
    "is_abstract": false
  }
}
```

### Inheritance Rules
- **Abstract parent**: Tidak bisa dipanggil langsung — blueprint saja
- **Concrete child**: Mewarisi domain, platform, kategori dari parent
- **Override**: Child bisa override property parent (polymorphic override)
- **Multiple inheritance**: Skill bisa punya >1 parent (diamond problem di-handle via priority)

---

## ════════════════════════════════════════════════════════════════
## L5: ASSOCIATIVE ENTITY — Relations dengan atribut
## ════════════════════════════════════════════════════════════════

**Associative entity** = tabel junction yang punya data sendiri.
Di sini setiap relasi antar skill punya **atribut** (strength, context, weight).

```json
{
  "relations": [
    {
      "type": "pairs_with",
      "target": "workers",
      "target_type": "skill",
      "attributes": {
        "strength": 0.95,
        "context": "cloudflare-deployment",
        "usage_count": 42,
        "weight": "high"
      }
    },
    {
      "type": "prerequisite_of",
      "target": "durable-objects",
      "target_type": "skill",
      "attributes": {
        "level": "required",
        "difficulty": "intermediate",
        "estimated_hours": 4
      }
    }
  ]
}
```

### Associative Entity — Relation Attributes

| Atribut | Tipe | Default | Deskripsi |
|---------|------|---------|-----------|
| `strength` | float 0-1 | 0.5 | Kekuatan relasi (1 = sangat kuat) |
| `weight` | enum | medium | `low`, `medium`, `high`, `critical` |
| `context` | string | "" | Konteks di mana relasi ini relevan |
| `usage_count` | int | 0 | Berapa kali relasi ini terpakai |
| `since_version` | string | "1.0" | Sejak versi berapa relasi ini ada |
| `metadata` | object | {} | Data tambahan bebas |

### Relation Types (Semantic Ontology)

| Type | Inverse | Arti | Contoh |
|------|---------|------|--------|
| `pairs_with` | `pairs_with` | Sering dipakai bersama | browser-act ↔ kaki-tangan |
| `requires` | `required_by` | Prasyarat | semgrep → python |
| `extends` | `extended_by` | Inheritance | hunt-xss → security-skill |
| `references` | `referenced_by` | Referensi | cloudflare → workers |
| `supersedes` | `superseded_by` | Menggantikan | wrangler-v3 → wrangler-v2 |
| `similar_to` | `similar_to` | Mirip | libfuzzer ↔ aflpp |
| `conflicts_with` | `conflicts_with` | Bertentangan | jsdom ↔ happy-dom |
| `complementary_to` | `complementary_to` | Pelengkap | frontend-design ↔ backend-patterns |
| `prerequisite_of` | `depends_on` | Tahapan belajar | html → css → javascript → react |
| `alternative_to` | `alternative_to` | Alternatif | atheris ↔ ruzzy |
| `specializes` | `generalizes` | Spesialisasi | cloudflare-email-service → cloudflare |
| `integrated_with` | `integrated_with` | Integrasi | supabase ↔ next-auth |
| `part_of` | `contains` | Komposisi | wrangler → cloudflare-toolset |
| `version_of` | `has_version` | Versi | cloudflare:v2026.1 → cloudflare |

---

## ════════════════════════════════════════════════════════════════
## L6: GRAPH — Neo4j-style traversal
## ════════════════════════════════════════════════════════════════

Skill = **node**, relasi = **edge**. Kita simpan adjacency list langsung di JSON.

### Graph Properties
```json
{
  "graph": {
    "node_type": "skill",
    "node_degree": 5,
    "in_degree": 3,
    "out_degree": 2,
    "centrality_score": 0.74,
    "connected_components": ["cloudflare-ecosystem"],
    "neighbors": ["workers", "pages", "d1", "durable-objects", "workers-ai"],
    "shortest_paths": {
      "to": {
        "node": "kaki-tangan",
        "path": ["cloudflare", "browser-act", "kaki-tangan"],
        "distance": 2,
        "weighted_distance": 1.8
      }
    }
  }
}
```

### Graph Algorithms Available
| Algoritma | TOOLS.sh command | Untuk |
|-----------|-----------------|-------|
| BFS/DFS | `graph <skill>` | Traversal relasi |
| Shortest path | `path <from> <to>` | Jalur terpendek antar skill |
| Connected components | `cluster <skill>` | Ekosistem skill |
| Recommendation | `recommend <skill>` | Skill terkait yang mungkin kamu suka |
| Centrality | `centrality` | Skill paling "penting" dalam network |
| Community detection | `communities` | Cluster skill alami |

---

## ════════════════════════════════════════════════════════════════
## L7: TEMPORAL — Lambda Architecture
## ════════════════════════════════════════════════════════════════

Dua layer: **speed layer** (current state) + **batch layer** (history).

```json
{
  "temporal": {
    "current": {
      "version": "2026.1",
      "updated": "2026-06-20T14:30:00Z",
      "is_latest": true
    },
    "history": [
      {
        "version": "2025.3",
        "date": "2025-12-01",
        "changes": ["Added Workers AI section", "Updated Wrangler commands"]
      },
      {
        "version": "2025.2",
        "date": "2025-10-15",
        "changes": ["Initial release"]
      }
    ],
    "timeline": [
      { "date": "2025-08-15", "event": "created" },
      { "date": "2025-10-15", "event": "v2025.2", "tag": "Initial" },
      { "date": "2025-12-01", "event": "v2025.3", "tag": "Workers AI" },
      { "date": "2026-06-20", "event": "v2026.1", "tag": "Agents SDK" }
    ]
  }
}
```

### Temporal Query Patterns
```bash
# Cari skill yang berubah di 2026
filter: updated >= "2026-01-01"

# Timeline perkembangan security
filter: domain="security" AND updated >= "2025-01-01"

# Snapshot: state skill di tanggal tertentu
filter: created <= "2025-06-01" AND (deprecated > "2025-06-01" OR status="active")
```

---

## ════════════════════════════════════════════════════════════════
## L8: ONTOLOGY — Semantic Knowledge Graph
## ════════════════════════════════════════════════════════════════

Mengadopsi **Web Ontology Language (OWL)** pattern: Classes, ObjectProperties,
DataProperties, Individuals.

```
OWL Ontology: SkillsKG

Classes:
  Skill (abstract)
    ├── SecuritySkill ⊂ Skill
    ├── MarketingSkill ⊂ Skill
    ├── TestingSkill ⊂ Skill
    ├── CloudSkill ⊂ Skill
    └── FuzzingSkill ⊂ TestingSkill

ObjectProperties:
  hasPrerequisite (domain: Skill, range: Skill)
  isComplementedBy (domain: Skill, range: Skill)
  isAlignedWith (domain: Skill, range: Standard)
  targetsPlatform (domain: Skill, range: Platform)

DataProperties:
  hasVersion (domain: Skill, range: xsd:string)
  hasDifficulty (domain: Skill, range: {beginner,intermediate,advanced,expert})
  hasLearningTime (domain: Skill, range: xsd:integer)

Individuals:
  hunt-xss : SecuritySkill
  cloudflare : CloudSkill
  libfuzzer : FuzzingSkill
```

```json
{
  "ontology": {
    "owl_class": "CloudSkill",
    "owl_superclass": "Skill",
    "owl_equivalent": ["cloud-development"],
    "owl_disjoint": ["DesktopSkill", "MobileSkill"],
    "semantic_properties": {
      "difficulty": "intermediate",
      "learning_time_minutes": 120,
      "expertise_level": "advanced",
      "certification": ["Cloudflare Certified"],
      "industries": ["tech", "startup", "enterprise"]
    },
    "semantic_relations": [
      { "predicate": "targetsPlatform", "object": "Cloudflare", "confidence": 1.0 },
      { "predicate": "hasPrerequisite", "object": "networking-basics", "confidence": 0.8 },
      { "predicate": "isAlignedWith", "object": "OWASP-Cloud-Security", "confidence": 0.6 }
    ]
  }
}
```

---

## ════════════════════════════════════════════════════════════════
## L9: VECTOR — Embedding-based Semantic Search
## ════════════════════════════════════════════════════════════════

Setiap skill punya **vector embedding** (TF-IDF on-the-fly dari description + tags) untuk
semantic similarity search — cari skill berdasarkan MAKNA, bukan keyword.
Zero external dependencies — pure Python TF-IDF + cosine similarity.

```json
{
  "vector": {
    "model": "all-MiniLM-L6-v2",
    "dimensions": 384,
    "enabled": true,
    "embedding": null
  }
}
```

### Semantic Search Commands
```bash
# Cari skill yang secara semantik mirip dengan "cloudflare"
bash TOOLS.sh semantic cloudflare

# Cosine similarity antara dua skill
bash TOOLS.sh similarity cloudflare workers

# Temukan skill yang paling relevan dengan topik
bash TOOLS.sh relevant "deploy web application with database"
```

---

## ════════════════════════════════════════════════════════════════
## COMPLETE JSON SCHEMA — Template
## ════════════════════════════════════════════════════════════════

```json
{
  "id": "skill:cloudflare:agensi",
  "name": "cloudflare",
  "description": "...",
  "version": "2026.1",
  "author": "Agensi / OpenCode",
  "updated": "2026-06-20",
  "created": "2025-08-15",
  "status": "active",
  "source": "agensi",
  "has_skillemd": true,

  "identity": {
    "composite_key": ["name", "source", "version"],
    "aliases": ["cf", "cf-workers"],
    "is_weak": false,
    "parent_id": null
  },

  "polymorphic": {
    "taggings": [
      { "taggable_type": "domain", "taggable_id": "cloud" },
      { "taggable_type": "domain", "taggable_id": "security" },
      { "taggable_type": "platform", "taggable_id": "cloudflare" },
      { "taggable_type": "category", "taggable_id": "infrastructure" },
      { "taggable_type": "category", "taggable_id": "development" },
      { "taggable_type": "language", "taggable_id": "javascript" },
      { "taggable_type": "tool", "taggable_id": "wrangler" }
    ]
  },

  "inheritance": {
    "parent": "cloud-platform",
    "parent_type": "abstract",
    "children": [],
    "depth": 1,
    "is_abstract": false
  },

  "weak_entities": {
    "versions": [
      { "id": "v2025.1", "version": "2025.1", "author": "OpenCode", "updated": "2025-10-01" },
      { "id": "v2026.1", "version": "2026.1", "author": "Agensi / OpenCode", "updated": "2026-06-20" }
    ],
    "aliases": [
      { "alias": "cf", "type": "abbreviation" }
    ]
  },

  "relations": [
    {
      "type": "pairs_with",
      "target": "workers",
      "target_type": "skill",
      "attributes": { "strength": 0.95, "context": "cloudflare-deploy" }
    },
    {
      "type": "references",
      "target": "durable-objects",
      "target_type": "skill",
      "attributes": { "strength": 0.7 }
    },
    {
      "type": "prerequisite_of",
      "target": "cloudflare-email-service",
      "target_type": "skill",
      "attributes": { "level": "recommended", "difficulty": "beginner" }
    }
  ],

  "graph": {
    "node_degree": 7,
    "in_degree": 3,
    "out_degree": 4,
    "centrality_score": 0.85,
    "neighbors_count": 7
  },

  "temporal": {
    "timeline": [
      { "date": "2025-08-15", "event": "created" },
      { "date": "2026-06-20", "event": "v2026.1", "tag": "Agents SDK" }
    ]
  },

  "ontology": {
    "owl_class": "CloudSkill",
    "owl_superclass": "Skill",
    "semantic_properties": {
      "difficulty": "intermediate",
      "learning_time_minutes": 120
    }
  },

  "vector": {
    "model": "all-MiniLM-L6-v2",
    "dimensions": 384,
    "enabled": false,
    "embedding": null
  },

  "dependencies": {
    "extends": [],
    "requires": []
  },
  "trigger_keywords": ["cloudflare", "workers", "pages", "wrangler"]
}
```

---

## REGISTRY FILE STRUCTURE

```
~/agensi/skills/
├── REGISTRY.json       ← Database utama (276 skills, 9 pattern layers)
├── REGISTRY.md         ← Dokumentasi schema lengkap (file ini)
├── TOOLS.sh            ← Query engine (25 commands — list, search, filter, graph, path, recommend, ontology)
├── sync-registry.sh    ← Auto-discovery scanner (raw SKILL.md → REGISTRY.json)
├── enrich-registry.sh  ← Post-processor (inheritance + graph + ontology + identity + temporal)
├── ONTOLOGY.owl        ← OWL ontology file (future)
├── VECTOR.index        ← Vector embeddings (future)
├── [skill-name]/
│   └── SKILL.md
└── ...
```

**Workflow lengkap:** `bash sync-registry.sh && bash enrich-registry.sh` setelah menambah skill baru.

---

## AUTO-DISCOVERY

Skill baru bisa muncul dari:
1. Folder baru di `~/agensi/skills/` — scan lokal
2. Folder baru di `~/.agents/skills/` — scan global
3. **Abstract discovery**: Nama skill yang mengandung prefix tertentu otomatis
   dikenali sebagai subtype (mis. `hunt-*` → SecuritySkill)
4. Web discovery — fetch dari registry publik (future)
5. User install — `skill install <url>` (future)

Jalankan `bash ~/agensi/skills/sync-registry.sh` untuk update database.

---

## VERSI

| Versi | Tanggal | Pattern Baru |
|-------|---------|-------------|
| 2026.2 | 2026-06-29 | +Weak Entity, Inheritance, Graph, Temporal, Ontology, Vector, Composite Key, Semantic Relations |
| 2026.1 | 2026-06-29 | Initial: 270 skills, polymorphic schema, auto-discovery |

---

*Polymorphic Skills Knowledge Graph — agensi.ai 2026*
*Schema: polymorphic-v2 | 276 skills | 14 domains | 9 platforms | 18 categories | 13 OWL classes | 14 relation types*
