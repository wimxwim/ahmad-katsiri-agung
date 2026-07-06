---
name: system-design
description: >
  Master System Design dari nol ke Senior Engineer — mencakup: Single Server Setup, SQL/NoSQL/Graph Databases, Vertical vs Horizontal Scaling, Load Balancing, Health Checks, SPOF, API Design (REST/GraphQL/gRPC), API Protocols, TCP/UDP Transport, Authentication, Authorization, Security, Caching (Redis, Memcached), CDN, Message Queues (Kafka, RabbitMQ), Microservices, Sharding, Replication, CAP Theorem, Consistency Patterns, Monitoring (Prometheus, ELK Stack), dan Production Infrastructure. Berdasarkan kurikulum global terbaik 2026: ByteByteGo (Alex Xu), System Design Primer (Donne Martin 230K⭐), Hayk Simonyan, DesignGurus, Grokking System Design. Gunakan untuk: desain arsitektur sistem, interview prep FAANG/senior eng, review arsitektur yang ada, scaling strategy, debug production issues, membuat diagram sistem, atau belajar komponen infrastruktur. Trigger words: system design, arsitektur, scalability, load balancer, caching, CDN, database sharding, API design, microservices, production infra.
---

# System Design Master Skill
*Berdasarkan kurikulum global 2026: ByteByteGo • System Design Primer • Hayk Simonyan • DesignGurus*

---

## 🎯 PERTANYAAN UTAMA SYSTEM DESIGN

> **"Berapa banyak user? Berapa QPS? Berapa lama data disimpan? Konsistensi atau availability yang lebih penting?"**
>
> Selalu clarify requirements SEBELUM mendesain. Jangan asumsikan skala.

### Framework Interview (ByteByteGo Standard):
```
1. CLARIFY    → Functional & Non-functional requirements
2. ESTIMATE   → Scale: QPS, storage, bandwidth, latency
3. DESIGN     → High-level architecture diagram
4. DEEP DIVE  → Database schema, API, bottlenecks
5. TRADE-OFFS → Jelaskan kenapa pilih A bukan B
```

---

## 📐 FASE 1: FOUNDATIONS

### Single Server → Distributed System Evolution
```
[User] → [DNS] → [Web Server] → [Database]
         ↓ scale up
[User] → [DNS] → [Load Balancer] → [App Server 1]
                                 → [App Server 2]
                                 → [App Server N]
                                        ↓
                              [Primary DB] ←→ [Replica DB]
                                        ↓
                                [Cache Layer]
                                        ↓
                                    [CDN]
```

### Vertical vs Horizontal Scaling

| Aspek | Vertical (Scale Up) | Horizontal (Scale Out) |
|-------|--------------------|-----------------------|
| Cara | Tambah RAM/CPU/Disk | Tambah lebih banyak server |
| Batas | Ada hardware limit | Hampir tidak terbatas |
| Biaya | Mahal per unit | Lebih murah per unit |
| Downtime | Butuh restart | Zero downtime |
| Complexity | Sederhana | Butuh load balancer, session management |
| Use case | Database awal, MVP | Production high-traffic |

**Kapan scale vertical?** < 1M users, single-region, budget terbatas
**Kapan scale horizontal?** > 1M users, high availability, global

---

## 🗄️ FASE 2: DATABASES

### Pilih Database yang Tepat

#### SQL (Relational) — RDBMS
```
PostgreSQL / MySQL / SQLite

✅ Gunakan untuk:
  - Data terstruktur dengan relasi jelas
  - ACID transactions (keuangan, e-commerce)
  - Complex queries dengan JOIN
  - Data integrity kritis

❌ Hindari untuk:
  - Schema berubah-ubah cepat
  - Unstructured/semi-structured data besar
  - Horizontal scaling ekstrem
```

#### NoSQL — Document Store
```
MongoDB / DynamoDB / Firestore

✅ Gunakan untuk:
  - Flexible schema / schema-less
  - JSON-like documents (profile, catalog)
  - Horizontal scaling mudah
  - Rapid iteration / MVP

❌ Hindari untuk:
  - Complex transactions multi-collection
  - Strong consistency requirements
```

#### NoSQL — Key-Value Store
```
Redis / DynamoDB / Memcached

✅ Gunakan untuk:
  - Session storage
  - Caching
  - Leaderboards (Redis sorted sets)
  - Real-time counters

Struktur: key → value (string, hash, list, set)
```

#### NoSQL — Wide Column
```
Apache Cassandra / HBase / ScyllaDB

✅ Gunakan untuk:
  - Time-series data (IoT, metrics, logs)
  - Write-heavy workloads
  - Multi-datacenter replication
  - Billions of rows

Model: (row key, column key) → value
```

#### NoSQL — Graph Database
```
Neo4j / Amazon Neptune / ArangoDB

✅ Gunakan untuk:
  - Social networks (friends-of-friends)
  - Recommendation engines
  - Fraud detection
  - Knowledge graphs

Query: traversal (siapa yang terhubung dengan siapa)
```

### CAP Theorem
```
         Consistency
              △
              |
      CA      |      CP
              |
─────────────────────────
              |
      AP      |
              |
   Availability ─── Partition Tolerance

Hanya bisa pilih 2 dari 3:
• CA: Traditional RDBMS (no partition)
• CP: MongoDB, HBase, Redis (konsisten meski ada partition)
• AP: Cassandra, CouchDB (available meski ada partition)
```

### Database Scaling Strategies

#### Replication (Read Scaling)
```
[Primary] ──write──► [Replica 1] ──read──► Users
         └─────────► [Replica 2] ──read──► Users
         └─────────► [Replica 3] ──read──► Users

Master-Slave: primary handles writes, replicas handle reads
Master-Master: semua node bisa write (conflict resolution needed)
```

#### Sharding (Write Scaling)
```
Horizontal partitioning — data dibagi ke beberapa database

User ID 0-999     → Shard 1
User ID 1000-1999 → Shard 2
User ID 2000+     → Shard 3

Strategi sharding:
• Hash-based: hash(key) % N → shard ID
• Range-based: berdasarkan rentang nilai
• Directory-based: lookup table → shard mapping

⚠️ Masalah sharding:
  - Cross-shard joins kompleks
  - Resharding saat data tumbuh
  - Celebrity/hotspot problem
```

---

## ⚡ FASE 3: CACHING

### Cache Placement Strategy
```
Client Cache → CDN → API Gateway Cache → App Cache → DB Cache

L1: In-memory app cache (milliseconds)
L2: Redis/Memcached distributed cache (sub-millisecond)
L3: CDN edge cache (regional)
L4: Database query cache
```

### Cache Patterns

#### Cache-Aside (Lazy Loading) — PALING UMUM
```
Read:
1. App cek cache → HIT? return data
2. MISS → query DB
3. Write ke cache
4. Return data ke user

Write:
1. Write ke DB
2. Invalidate/delete cache entry

✅ Resilient: cache crash tidak down sistem
✅ Data di cache hanya yang diminta
❌ Cache miss = 3 steps (lebih lambat pertama kali)
❌ Stale data mungkin ada
```

#### Write-Through
```
Write: App → Cache → DB (synchronous)
Read: App → Cache → (DB jika miss)

✅ Data selalu konsisten
❌ Write latency lebih tinggi
❌ Cache penuh dengan data yang jarang dibaca
```

#### Write-Behind (Write-Back)
```
Write: App → Cache (async) → DB (delayed batch)

✅ Write performance tinggi
❌ Risk data loss jika cache crash sebelum persist ke DB
```

#### Read-Through
```
Read: App → Cache → (Cache fetch from DB jika miss)
Cache bertanggung jawab load data dari DB

✅ App code lebih simple
❌ First request selalu slow (cold start)
```

### Cache Eviction Policies
```
LRU  (Least Recently Used)  → Hapus yang paling lama tidak diakses
LFU  (Least Frequently Used) → Hapus yang paling jarang diakses
FIFO (First In, First Out)   → Hapus yang pertama masuk
TTL  (Time-To-Live)          → Expire otomatis setelah waktu tertentu
```

### Redis Use Cases
```
• Session storage:     SET session:userId "data" EX 3600
• Rate limiting:       INCR rate:ip:timestamp + TTL
• Leaderboard:         ZADD leaderboard score userId
• Pub/Sub messaging:   PUBLISH channel message
• Distributed lock:    SET lock:resource 1 NX EX 30
• Caching:             GET/SET dengan TTL
```

---

## 🌐 FASE 4: CDN (Content Delivery Network)

### Cara Kerja CDN
```
Tanpa CDN:
[User di Jakarta] ────────────────────► [Server di US] (200ms+)

Dengan CDN:
[User di Jakarta] ──► [CDN Edge di Singapore] ──► [Origin US]
                           (10ms)                   (cache hit)

CDN menyimpan static assets di edge servers dekat user
```

### Push vs Pull CDN

| | Push CDN | Pull CDN |
|--|---------|---------|
| Cara | Upload konten ke CDN manual | CDN fetch dari origin saat request |
| Kapan | Konten tidak sering berubah, traffic bisa diprediksi | Traffic tidak menentu, konten sering update |
| Contoh | File installer, video VOD besar | Website, images dinamis |
| TTL | Kamu kontrol kapan expire | CDN kontrol via Cache-Control header |
| Tools | AWS CloudFront (push mode), Akamai | Cloudflare, CloudFront (pull mode) |

### Cache-Control Headers (CDN)
```http
Cache-Control: public, max-age=86400          # Cache 1 hari
Cache-Control: private, no-cache              # Jangan cache (personal data)
Cache-Control: public, s-maxage=3600          # CDN cache 1 jam, browser tidak
ETag: "abc123"                                 # Validation token
Last-Modified: Wed, 27 May 2026 00:00:00 GMT  # Conditional requests
```

---

## ⚖️ FASE 5: LOAD BALANCING

### Load Balancing Algorithms
```
Round Robin:
  Request 1 → Server A
  Request 2 → Server B
  Request 3 → Server C
  Request 4 → Server A (loop)
  ✅ Simple, merata
  ❌ Tidak memperhitungkan beban server

Weighted Round Robin:
  Server A (weight=3): 3 requests
  Server B (weight=1): 1 request
  ✅ Server lebih kuat dapat lebih banyak traffic

Least Connections:
  Kirim ke server dengan active connections paling sedikit
  ✅ Baik untuk long-running requests (WebSocket, video)
  ❌ Overhead tracking connections

IP Hash:
  hash(client_IP) % N → server tertentu
  ✅ User selalu ke server yang sama (sticky sessions)
  ❌ Tidak merata jika traffic dari sedikit IP

Random:
  Pilih server secara acak
  ✅ Simple implementation
  ❌ Tidak predictable
```

### Layer 4 vs Layer 7 Load Balancing
```
L4 (Transport Layer):
  • Routing berdasarkan IP + TCP/UDP port
  • Tidak lihat content/payload
  • Lebih cepat, lebih sederhana
  • Tools: HAProxy, AWS NLB

L7 (Application Layer):
  • Routing berdasarkan HTTP headers, URL, cookies, content
  • Bisa termination SSL
  • Content-based routing (route /api ke API servers, /static ke CDN)
  • Tools: NGINX, AWS ALB, Traefik
```

### Health Checks
```
Active Health Check (Probing):
  Load balancer kirim request ke /health setiap N detik
  Response 200 → server healthy
  Timeout/500 → mark unhealthy, stop sending traffic

Passive Health Check (Observing):
  Monitor actual traffic
  Terlalu banyak errors/timeouts → mark unhealthy

Health Check Endpoint Best Practices:
  GET /health → { "status": "ok", "db": "ok", "cache": "ok" }
  
  Cek: database connection, cache connection, disk space, memory
  Response time < 100ms
  Return 200 (healthy) atau 503 (unhealthy)
```

### Single Point of Failure (SPOF)
```
Problem: Satu komponen mati = seluruh sistem mati

Solutions:
• Active-Active:   Semua node aktif, load dibagi
• Active-Passive:  Primary aktif, standby ready take over
• Redundancy:      Duplikasi komponen kritis

Komponen yang sering jadi SPOF:
✗ Single load balancer → gunakan redundant LB pair
✗ Single database → replication + failover
✗ Single availability zone → multi-AZ deployment
✗ Single region → multi-region + DNS failover
```

---

## 🔌 FASE 6: API DESIGN

### API Design Principles (Global Best Practices)
```
1. Consistency    → Naming convention seragam
2. Versioning     → /api/v1/, /api/v2/
3. Idempotency    → PUT/DELETE bisa di-retry aman
4. Pagination     → Jangan return 1M records sekaligus
5. Error handling → Standard error format
6. Rate limiting  → Protect dari abuse
7. Documentation  → OpenAPI/Swagger spec
```

### REST API Design
```http
# Resources (nouns, not verbs)
GET    /users              → List users
POST   /users              → Create user
GET    /users/{id}         → Get user
PUT    /users/{id}         → Update user (full)
PATCH  /users/{id}         → Update user (partial)
DELETE /users/{id}         → Delete user

# Nested resources
GET    /users/{id}/posts   → Posts milik user
POST   /users/{id}/posts   → Buat post untuk user

# Query params untuk filtering, sorting, pagination
GET /users?status=active&sort=created_at&page=1&limit=20

# HTTP Status Codes
200 OK              → Success
201 Created         → Resource created
204 No Content      → Success, no body (DELETE)
400 Bad Request     → Client error, invalid input
401 Unauthorized    → Auth required
403 Forbidden       → Auth valid tapi tidak ada akses
404 Not Found       → Resource tidak ada
409 Conflict        → Duplicate/conflict
422 Unprocessable   → Validation error
429 Too Many Req    → Rate limited
500 Internal Error  → Server error
503 Unavailable     → Service down/overloaded
```

### GraphQL
```graphql
# Query — ambil data yang dibutuhkan saja
query GetUser {
  user(id: "123") {
    name
    email
    posts {
      title
      createdAt
    }
  }
}

# Mutation — create/update/delete
mutation CreatePost {
  createPost(input: { title: "Hello", content: "World" }) {
    id
    title
  }
}

# Subscription — real-time updates
subscription OnNewMessage {
  newMessage(channelId: "456") {
    text
    sender { name }
  }
}

✅ Gunakan GraphQL untuk:
  - Complex frontend dengan banyak data requirements berbeda
  - Mobile apps (kurangi over-fetching)
  - Rapid iteration frontend

❌ Hindari untuk:
  - Simple CRUD APIs
  - File upload
  - Caching kompleks (tidak ada URL, susah di-cache CDN)
```

### gRPC
```protobuf
// Service definition
service UserService {
  rpc GetUser (UserRequest) returns (UserResponse);
  rpc StreamUsers (Empty) returns (stream UserResponse);
}

message UserRequest { string user_id = 1; }
message UserResponse {
  string id = 1;
  string name = 2;
  string email = 3;
}

✅ Gunakan gRPC untuk:
  - Microservice internal communication
  - Low latency critical paths
  - Streaming (bi-directional)
  - Polyglot systems (auto-generate client semua bahasa)

❌ Hindari untuk:
  - Public APIs (browser tidak support native)
  - Simple request-response
```

### API Protocols Comparison
```
Protocol    | Format  | Use Case              | Latency
------------|---------|----------------------|----------
REST        | JSON    | Public APIs, CRUD    | Medium
GraphQL     | JSON    | Complex queries      | Medium
gRPC        | Binary  | Microservices, speed | Low
WebSocket   | Any     | Real-time, chat      | Very Low
WebHook     | JSON    | Event notifications  | N/A
SSE         | Text    | Server-push (1-way)  | Low
MQTT        | Binary  | IoT devices          | Very Low
```

---

## 🔐 FASE 7: AUTHENTICATION & AUTHORIZATION

### Authentication Methods

#### JWT (JSON Web Token)
```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMiLCJleHAiOjE3OTAwMDB9.xxxxx

Payload:
{
  "userId": "123",
  "roles": ["user", "admin"],
  "exp": 1790000000,   // expiry
  "iat": 1720000000    // issued at
}

✅ Stateless — no server storage needed
✅ Scalable — works across microservices
❌ Cannot invalidate before expiry (use short TTL + refresh tokens)
❌ Payload exposed (base64, not encrypted) — jangan simpan sensitive data

Best Practice:
• Access token: 15 menit TTL
• Refresh token: 7-30 hari, stored httpOnly cookie
• Rotate refresh tokens on use
```

#### Session-Based Auth
```
1. User login → Server buat session → Simpan di Redis
2. Return session_id via Set-Cookie: session=abc123; HttpOnly
3. Request berikutnya: Cookie: session=abc123
4. Server lookup session di Redis → get user data

✅ Server bisa invalidate kapan saja (logout semua device)
✅ Sensitive data tidak di client
❌ Stateful — butuh shared session store (Redis)
❌ Harder to scale horizontally
```

#### OAuth 2.0 + OpenID Connect
```
Authorization Code Flow (paling aman):

[User] → [App] → redirect → [Auth Server]
                              ↓ login
[User] ← [App] ← code ← [Auth Server]
              ↓ exchange code
         access_token + id_token ← [Auth Server]

Gunakan untuk: "Login dengan Google/GitHub/Facebook"
PKCE: tambahkan untuk mobile/SPA (tidak bisa simpan client_secret)
```

### Authorization Patterns

#### RBAC (Role-Based Access Control)
```
User → Role → Permission

admin   → [read, write, delete, manage_users]
editor  → [read, write]
viewer  → [read]

if user.roles.includes('admin') → allow
```

#### ABAC (Attribute-Based Access Control)
```
Policy: user.department == resource.department AND user.clearance >= resource.sensitivity

More flexible than RBAC, evaluasi saat runtime
Gunakan untuk: complex enterprise access rules
```

---

## 🛡️ FASE 8: SECURITY

### Security Checklist Produksi
```
Transport:
✅ HTTPS everywhere (TLS 1.3)
✅ HSTS header: Strict-Transport-Security: max-age=31536000
✅ Certificate pinning untuk mobile apps

Input Validation:
✅ Validate & sanitize SEMUA input user
✅ Parameterized queries (prevent SQL injection)
✅ Content-Type validation untuk file upload
✅ Max file size & type whitelist

API Security:
✅ Rate limiting per IP + per user
✅ API key rotation policy
✅ Request signing untuk webhooks (HMAC-SHA256)
✅ CORS whitelist (tidak pakai *)

Infrastructure:
✅ Secrets di vault (AWS Secrets Manager / HashiCorp Vault)
✅ Principle of least privilege untuk IAM
✅ Network segmentation (database tidak expose ke public)
✅ Regular dependency vulnerability scanning

Monitoring:
✅ Log semua auth events (login, logout, failed attempts)
✅ Alert on anomalies (login dari lokasi baru, mass data export)
✅ Audit trail untuk data akses sensitif
```

### Rate Limiting Strategies
```
Fixed Window:   1000 req / 1 jam (per jam tepat)
Sliding Window: 1000 req / 1 jam terakhir (smooth)
Token Bucket:   Burst allowed up to bucket size
Leaky Bucket:   Smooth output rate (queue requests)

Implementation dengan Redis:
INCR rate:user123:2026052722   # key = user:hour
EXPIRE rate:user123:2026052722 3600
```

---

## 📨 FASE 9: MESSAGE QUEUES & EVENT-DRIVEN

### Kapan Pakai Message Queue?
```
✅ Decoupling services (producer tidak perlu tau siapa consumer)
✅ Async processing (email, notification, report generation)
✅ Load leveling (spike traffic → queue → process steady)
✅ Retry & dead letter queue untuk failed jobs
✅ Event streaming & audit trail
```

### Kafka vs RabbitMQ

| Aspek | Apache Kafka | RabbitMQ |
|-------|-------------|---------|
| Model | Distributed log (topic+partition) | Message broker (queue) |
| Retention | Configurable (default 7 hari) | Hapus setelah di-consume |
| Throughput | Sangat tinggi (millions/sec) | Lebih rendah |
| Ordering | Per partition | Per queue |
| Use case | Event streaming, audit log, CDC | Task queue, RPC, routing kompleks |
| Consumers | Consumer groups, replay possible | Competing consumers |
| Complexity | Lebih kompleks | Lebih mudah setup |

### Kafka Architecture
```
Producers → [Topic: orders] → Consumers
             Partition 0: [msg1][msg4][msg7]  → Consumer Group A
             Partition 1: [msg2][msg5][msg8]  → Consumer Group A
             Partition 2: [msg3][msg6][msg9]  → Consumer Group A
                                               → Consumer Group B (replay)

Key concepts:
• Offset: posisi message dalam partition
• Consumer Group: scale consumers, 1 partition = 1 consumer
• Replication Factor: berapa banyak replika partition
• Retention: berapa lama message disimpan
```

---

## 🏗️ FASE 10: MICROSERVICES & PRODUCTION INFRA

### Microservices vs Monolith

```
Monolith:
[Users] → [Auth] → [Orders] → [Payments] → [Notifications]
           ↑__________________________|
           Semua dalam 1 codebase/deployment

Microservices:
[API Gateway] → [Auth Service]
             → [Order Service]    → [Order DB]
             → [Payment Service]  → [Payment DB]
             → [Notification Service]

✅ Microservices: Independent deploy, scale, tech stack per service
❌ Microservices: Network complexity, distributed transactions, observability harder
```

### Service Communication
```
Synchronous:
  REST/gRPC → langsung response, simpel, tight coupling
  Gunakan untuk: user-facing requests yang butuh immediate response

Asynchronous:
  Message Queue (Kafka/RabbitMQ) → decoupled, resilient
  Gunakan untuk: background jobs, notifications, eventual consistency OK

Service Mesh (Istio/Linkerd):
  Mutual TLS, circuit breaking, retry, observability
  Gunakan untuk: mature microservices dengan banyak services
```

### Circuit Breaker Pattern
```
CLOSED (normal):
  Requests flow through
  Track failures
  
  If failures > threshold → OPEN

OPEN (tripped):
  Requests fail immediately (no timeout wait)
  After timeout → HALF-OPEN

HALF-OPEN (testing):
  Let few requests through
  If success → CLOSED
  If fail → OPEN again

Tools: Resilience4j (Java), Hystrix, Polly (.NET)
```

### API Gateway Pattern
```
[Clients] → [API Gateway] → [Auth Service]
                          → [User Service]
                          → [Order Service]
                          → [Product Service]

API Gateway handles:
• Authentication & Authorization
• Rate Limiting
• SSL Termination
• Request Routing
• Load Balancing
• Caching
• Logging & Monitoring
• Protocol Translation (REST → gRPC)

Tools: Kong, AWS API Gateway, Nginx, Traefik
```

---

## 📊 FASE 11: MONITORING & OBSERVABILITY

### Three Pillars of Observability
```
Metrics  → WHAT is happening (quantitative)
Logs     → WHAT happened (events, errors)
Traces   → WHERE and WHY it happened (distributed tracing)
```

### Metrics Stack (Prometheus + Grafana)
```
App → expose /metrics endpoint
   → [Prometheus] scrape every 15s
   → [Grafana] visualize + alert

Key metrics:
• RED Method:  Rate, Errors, Duration (for services)
• USE Method:  Utilization, Saturation, Errors (for resources)
• Latency:     p50, p95, p99 (not average!)
• Availability: uptime percentage

SLI/SLO/SLA:
• SLI: Actual measurement (p99 latency = 150ms)
• SLO: Target (p99 latency < 200ms, 99.9% uptime)
• SLA: Contract dengan customer (SLO - buffer)
• Error Budget: 100% - SLO = berapa error boleh terjadi
```

### Logging Stack (ELK Stack)
```
App Logs → [Logstash/Filebeat] → [Elasticsearch] → [Kibana]

Log Levels:
DEBUG   → Development only
INFO    → Normal operations
WARN    → Unexpected but not error
ERROR   → Error terjadi, perlu perhatian
FATAL   → System tidak bisa lanjut

Structured Logging (JSON):
{
  "timestamp": "2026-05-27T10:00:00Z",
  "level": "ERROR",
  "service": "order-service",
  "trace_id": "abc123",
  "user_id": "456",
  "message": "Payment failed",
  "error": "Card declined"
}
```

### Distributed Tracing
```
Request → Service A → Service B → Service C
  trace_id: xyz789
    span_id: 001 (A: 50ms)
      span_id: 002 (B: 30ms)
        span_id: 003 (C: 15ms)

Tools: Jaeger, Zipkin, AWS X-Ray, OpenTelemetry
```

---

## 🗺️ FASE 12: ESTIMASI SKALA (Back-of-Envelope)

### Angka Penting yang Harus Dihafal
```
Latency:
  Memory access:        ~100ns
  SSD random read:      ~100µs
  Network (same DC):    ~500µs
  SSD sequential:       ~1ms
  Network (cross-DC):   ~10ms
  Disk seek:            ~10ms
  Network (cross-ocean): ~150ms

Storage:
  1 KB  = 10^3 bytes
  1 MB  = 10^6 bytes
  1 GB  = 10^9 bytes
  1 TB  = 10^12 bytes
  1 PB  = 10^15 bytes

Traffic:
  1 million req/day = ~12 req/sec
  1 billion req/day = ~12,000 req/sec (12K QPS)
```

### Contoh Estimasi Twitter Scale
```
Asumsi:
• 300M daily active users (DAU)
• Avg 5 tweets/user/day
• 80% read, 20% write
• Media: 20% tweets punya gambar (300KB avg)

Write QPS:
  300M × 5 / 86400 = ~17,000 writes/sec
  
Read QPS:
  17,000 × 4 (80/20 ratio) = ~68,000 reads/sec

Storage:
  Text: 300M × 5 × 300 bytes = ~450 GB/day
  Media: 300M × 5 × 0.2 × 300KB = ~90 TB/day
  5 years: 90TB × 365 × 5 = ~164 PB (media only)

Kesimpulan:
• Need aggressive caching (read-heavy)
• CDN untuk media
• Sharded database
• Multi-region deployment
```

---

## 🎯 INTERVIEW FRAMEWORK (ByteByteGo + Hayk Simonyan)

### Step-by-Step Approach
```
STEP 1 — Clarify (5 menit):
  "Berapa DAU yang kita target?"
  "Apakah perlu real-time atau eventual consistency OK?"
  "Fitur apa yang paling penting untuk di-design dulu?"
  "Ada constraint teknologi tertentu?"

STEP 2 — Estimate (3 menit):
  QPS = DAU × requests_per_day / 86400
  Storage = QPS × object_size × retention_days
  Bandwidth = QPS × response_size

STEP 3 — High Level Design (10 menit):
  Gambar diagram dengan: Client → LB → App → Cache → DB
  Sebutkan komponen utama
  Minta feedback interviewer sebelum deep dive

STEP 4 — Deep Dive (20 menit):
  Database schema
  API endpoints
  Bottleneck analysis
  Scaling strategy

STEP 5 — Trade-offs (5 menit):
  "Saya pilih Cassandra karena write-heavy, trade-off adalah..."
  "Kita bisa improve dengan... tapi itu akan menambah complexity..."
```

### Common System Design Questions 2026

| System | Key Challenges |
|--------|---------------|
| URL Shortener | Hash collision, redirection speed, analytics |
| Twitter/Instagram | Fan-out write vs read, media storage, timeline |
| WhatsApp | WebSocket, message ordering, E2E encryption |
| YouTube | Video transcoding, CDN, recommendation |
| Uber/Lyft | Geospatial queries, real-time matching, surge pricing |
| Google Search | Crawling, indexing, ranking, autocomplete |
| Airbnb | Search (location + date), booking flow, availability |
| Rate Limiter | Algorithm choice, distributed counter, Redis |
| Notification System | Push (APNs/FCM), fan-out, priority queues |
| Key-Value Store | Consistent hashing, replication, CAP |
| Payment System | ACID transactions, idempotency, double-charge prevention |
| LLM/AI System (2026) | Vector DB, RAG pipeline, model serving, caching embeddings |

---

## 📚 SUMBER GLOBAL TERBAIK 2026

### Tier 1 — Wajib
- **ByteByteGo** (Alex Xu): [bytebytego.com](https://bytebytego.com) — Gold standard, visual diagrams
- **System Design Primer** (Donne Martin): [github.com/donnemartin/system-design-primer](https://github.com/donnemartin/system-design-primer) — 230K⭐ FREE
- **ByteByteGo GitHub**: [github.com/ByteByteGoHq/system-design-101](https://github.com/ByteByteGoHq/system-design-101) — Visual, FREE
- **Hayk Simonyan**: [hayksimonyan.substack.com](https://hayksimonyan.substack.com) — Newsletter + YouTube

### Tier 2 — Sangat Direkomendasikan
- **Grokking System Design** (DesignGurus): [designgurus.io](https://www.designgurus.io)
- **Designing Data-Intensive Applications** (Martin Kleppmann) — Buku wajib backend engineer
- **System Design Interview** Vol 1 & 2 (Alex Xu) — Buku

### Tier 3 — Supplement
- **Dev.to**: [dev.to/yakhilesh/system-design-in-2026-the-complete-guide-18500-words-3nn6](https://dev.to/yakhilesh/system-design-in-2026-the-complete-guide-18500-words-3nn6)
- **JavaRevisited**: [javarevisited.substack.com](https://javarevisited.substack.com)
- **systemdesignhandbook.com**: [systemdesignhandbook.com/guides/system-design-interview](https://www.systemdesignhandbook.com/guides/system-design-interview/)

### Komunitas Global
- **Reddit**: r/systemdesign, r/ExperiencedDevs
- **Discord**: CS Career Hub (1000+ online), Interview.me
- **GitHub**: System Design Primer (230K⭐), ByteByteGo-101
- **Newsletter**: Hayk Simonyan, systemdesign.one, ByteByteGo Newsletter

---

## 🚀 TOPIK ADVANCED 2026

### AI/LLM System Design (Tren Baru 2026)
```
RAG (Retrieval-Augmented Generation) Pipeline:
[User Query] → [Embedding Model] → [Vector DB Search]
             → [Retrieved Context + Query]
             → [LLM] → [Response]

Vector DB: Pinecone, Weaviate, pgvector (PostgreSQL extension)
Caching embeddings: Redis untuk sering-queried embeddings
Model serving: vLLM, TGI, Triton Inference Server
```

### Event Sourcing + CQRS
```
Event Sourcing:
  Simpan EVENTS, bukan state saat ini
  Account balance = replay semua transaction events
  
CQRS (Command Query Responsibility Segregation):
  Write side: Command → Event Store
  Read side:  Query → Read Model (optimized for reads)
  
  ✅ Perfect audit trail
  ✅ Time travel (replay to any point)
  ❌ Eventual consistency
  ❌ Complexity tinggi
```

### Consistent Hashing
```
Problem: Saat tambah/hapus server, minimal data yang harus di-redistribusi

Normal hashing: hash(key) % N
  → Ganti N = hampir semua key berpindah server ❌

Consistent hashing: key dan server pada lingkaran (ring)
  → Ganti 1 server = hanya sebagian kecil key berpindah ✅

Virtual nodes: setiap physical server punya banyak virtual nodes
  → Distribusi lebih merata

Digunakan oleh: Cassandra, DynamoDB, Amazon Load Balancer
```
