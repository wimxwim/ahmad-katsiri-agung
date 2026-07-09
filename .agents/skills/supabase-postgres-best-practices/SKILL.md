---
name: supabase-postgres-best-practices
description: Comprehensive Postgres performance optimization guide for Supabase projects. Covers RLS policies, connection pooling, query optimization, index strategies, and schema design. Use when working with Supabase Postgres, implementing RLS, optimizing queries, or designing database schema.
allowed-tools: []
metadata:
  author: Supabase Engineering
  version: "2026.1"
  scope: database-optimization
  pairs_with: schema-evolution-and-contract-migrations, data-quality-and-contract-testing
  updated: "2026-07-08"
  sources:
    - https://supabase.com/docs/guides/database/postgres/row-level-security
    - https://www.postgresql.org/docs/current/
---

# Supabase Postgres Best Practices

Comprehensive performance optimization guide for Postgres, maintained by Supabase. Contains rules across 8 categories, prioritized by impact to guide automated query optimization and schema design.

## When to Apply

Reference these guidelines when:
- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
- Working with Row-Level Security (RLS)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Query Performance | CRITICAL | `query-` |
| 2 | Connection Management | CRITICAL | `conn-` |
| 3 | Security & RLS | CRITICAL | `security-` |
| 4 | Schema Design | HIGH | `schema-` |
| 5 | Concurrency & Locking | MEDIUM-HIGH | `lock-` |
| 6 | Data Access Patterns | MEDIUM | `data-` |
| 7 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` |
| 8 | Advanced Features | LOW | `advanced-` |

---

## 1. Query Performance (CRITICAL)

### query-missing-indexes: Add Indexes on WHERE and JOIN Columns

**Impact:** 100-1000x faster queries on large tables

Queries filtering or joining on unindexed columns cause full table scans, which become exponentially slower as tables grow.

**Incorrect (sequential scan on large table):**

```sql
-- No index on customer_id causes full table scan
select * from orders where customer_id = 123;

-- EXPLAIN shows: Seq Scan on orders (cost=0.00..25000.00 rows=100 width=85)
```

**Correct (index scan):**

```sql
-- Create index on frequently filtered column
create index orders_customer_id_idx on orders (customer_id);

select * from orders where customer_id = 123;

-- EXPLAIN shows: Index Scan using orders_customer_id_idx (cost=0.42..8.44 rows=100 width=85)
```

For JOIN columns, always index the foreign key side:

```sql
-- Index the referencing column
create index orders_customer_id_idx on orders (customer_id);

select c.name, o.total
from customers c
join orders o on o.customer_id = c.id;
```

### query-composite-indexes: Use Composite Indexes for Multi-Column Filters

**Impact:** 10-100x faster for queries filtering multiple columns

When queries frequently filter on multiple columns together, a composite index is more efficient than multiple single-column indexes.

**Incorrect (multiple single-column indexes):**

```sql
create index orders_customer_id_idx on orders (customer_id);
create index orders_status_idx on orders (status);

-- Query filters both columns but can only use one index efficiently
select * from orders where customer_id = 123 and status = 'ACTIVE';
```

**Correct (composite index):**

```sql
-- Composite index covers both columns
create index orders_customer_status_idx on orders (customer_id, status);

select * from orders where customer_id = 123 and status = 'ACTIVE';
```

**Column order matters:** Put the most selective column first (the one with more distinct values).

### query-covering-indexes: Use Covering Indexes to Avoid Table Lookups

**Impact:** 2-10x faster for read-heavy queries

A covering index includes all columns needed by a query, allowing Postgres to return results directly from the index without accessing the table.

**Incorrect (requires table lookup):**

```sql
create index orders_customer_id_idx on orders (customer_id);

-- Query needs columns not in index
select customer_id, total, created_at from orders where customer_id = 123;
```

**Correct (covering index):**

```sql
-- Include all needed columns
create index orders_customer_covering_idx on orders (customer_id) include (total, created_at);

-- Query can be satisfied entirely from index
select customer_id, total, created_at from orders where customer_id = 123;
```

### query-partial-indexes: Use Partial Indexes for Filtered Queries

**Impact:** Smaller indexes, faster writes, faster reads for filtered queries

When queries frequently filter on a specific condition, a partial index only indexes rows matching that condition.

**Example:**

```sql
-- Only index active orders
create index orders_active_idx on orders (customer_id) where status = 'ACTIVE';

-- Query uses partial index
select * from orders where customer_id = 123 and status = 'ACTIVE';
```

---

## 2. Connection Management (CRITICAL)

### conn-pooling: Use Connection Pooling for All Applications

**Impact:** Handle 10-100x more concurrent users

Postgres connections are expensive (1-3MB RAM each). Without pooling, applications exhaust connections under load.

**Incorrect (new connection per request):**

```sql
-- Each request creates a new connection
-- Application code: db.connect() per request
-- Result: 500 concurrent users = 500 connections = crashed database

-- Check current connections
select count(*) from pg_stat_activity;  -- 487 connections!
```

**Correct (connection pooling):**

```sql
-- Use a pooler like PgBouncer between app and database
-- Application connects to pooler, pooler reuses a small pool to Postgres

-- Configure pool_size based on: (CPU cores * 2) + spindle_count
-- Example for 4 cores: pool_size = 10

-- Result: 500 concurrent users share 10 actual connections
select count(*) from pg_stat_activity;  -- 10 connections
```

Pool modes:
- **Transaction mode**: connection returned after each transaction (best for most apps)
- **Session mode**: connection held for entire session (needed for prepared statements, temp tables)

### conn-limits: Set Connection Limits

**Impact:** Prevent connection exhaustion

Always set `max_connections` in `postgresql.conf` and configure pooler limits.

```sql
-- Check current limits
show max_connections;

-- Monitor active connections
select count(*) from pg_stat_activity where state = 'active';
```

---

## 3. Security & RLS (CRITICAL)

### security-rls-basics: Enable Row Level Security for Multi-Tenant Data

**Impact:** Database-enforced tenant isolation, prevent data leaks

Row Level Security (RLS) enforces data access at the database level, ensuring users only see their own data.

**Incorrect (application-level filtering only):**

```sql
-- Relying only on application to filter
select * from orders where user_id = $current_user_id;

-- Bug or bypass means all data is exposed!
select * from orders;  -- Returns ALL orders
```

**Correct (database-enforced RLS):**

```sql
-- Enable RLS on the table
alter table orders enable row level security;

-- Create policy for users to see only their orders
create policy orders_user_policy on orders
  for all
  using (user_id = current_setting('app.current_user_id')::bigint);

-- Force RLS even for table owners
alter table orders force row level security;

-- Set user context and query
set app.current_user_id = '123';
select * from orders;  -- Only returns orders for user 123
```

Policy for authenticated role:

```sql
create policy orders_user_policy on orders
  for all
  to authenticated
  using (user_id = auth.uid());
```

### security-rls-performance: RLS Performance Recommendations

**Impact:** 90-99% faster RLS queries

#### Add indexes on policy columns

```sql
-- Policy uses user_id
create policy "rls_test_select" on test_table
to authenticated
using ( (select auth.uid()) = user_id );

-- Add index on user_id
create index userid on test_table using btree (user_id);
```

**Benchmark:** 171ms → <0.1ms (99.94% improvement)

#### Call functions with `select`

```sql
-- Incorrect (function called per row)
using ( auth.uid() = user_id );

-- Correct (function cached per statement)
using ( (select auth.uid()) = user_id );
```

**Benchmark:** 179ms → 9ms (94.97% improvement)

#### Add filters to every query

```js
// Incorrect (no filter, relies only on RLS)
const { data } = supabase.from('table').select();

// Correct (explicit filter helps query planner)
const { data } = supabase.from('table').select().eq('user_id', userId);
```

**Benchmark:** 171ms → 9ms (94.74% improvement)

#### Specify roles in policies

```sql
// Incorrect (policy runs for all users)
create policy "rls_test_select" on rls_test
using ( auth.uid() = user_id );

// Correct (policy only runs for authenticated)
create policy "rls_test_select" on rls_test
to authenticated
using ( (select auth.uid()) = user_id );
```

**Benchmark:** 170ms → <0.1ms (99.78% improvement)

### security-privileges: Manage Postgres Roles and Privileges

**Impact:** Principle of least privilege

Always grant minimum necessary privileges:

```sql
-- Read-only role
create role readonly;
grant select on all tables in schema public to readonly;

-- App user role
create role app_user;
grant select, insert, update, delete on all tables in schema public to app_user;

-- Revoke unnecessary privileges
revoke create on schema public from public;
```

---

## 4. Schema Design (HIGH)

### schema-foreign-key-indexes: Index Foreign Key Columns

**Impact:** 10-100x faster JOINs and CASCADE operations

Postgres does not automatically index foreign key columns. Missing indexes cause slow JOINs and CASCADE operations.

**Incorrect (unindexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- No index on customer_id!
-- JOINs and ON DELETE CASCADE both require full table scan
select * from orders where customer_id = 123;  -- Seq Scan
delete from customers where id = 123;          -- Locks table, scans all orders
```

**Correct (indexed foreign key):**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  total numeric(10,2)
);

-- Always index the FK column
create index orders_customer_id_idx on orders (customer_id);

-- Now JOINs and cascades are fast
select * from orders where customer_id = 123;  -- Index Scan
delete from customers where id = 123;          -- Uses index, fast cascade
```

Find missing FK indexes:

```sql
select
  conrelid::regclass as table_name,
  a.attname as fk_column
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f'
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid and a.attnum = any(i.indkey)
  );
```

### schema-data-types: Choose Appropriate Data Types

**Impact:** Reduced storage, faster queries

Use the smallest data type that fits your needs:

| Use Case | Recommended Type | Avoid |
|----------|-----------------|-------|
| Small integers | `smallint` | `bigint` |
| UUIDs | `uuid` | `varchar(36)` |
| Short strings (<255) | `varchar(n)` | `text` |
| Long strings | `text` | `varchar` without limit |
| Timestamps | `timestamptz` | `timestamp` (no timezone) |
| Boolean flags | `boolean` | `integer` |
| JSON data | `jsonb` | `json` |

### schema-primary-keys: Use Appropriate Primary Key Strategy

**Impact:** Performance and scalability

**Recommended: Use `bigint generated always as identity`**

```sql
create table orders (
  id bigint generated always as identity primary key,
  customer_id bigint not null,
  total numeric(10,2) not null
);
```

**Avoid: UUID primary keys for high-write tables**

UUIDs cause index fragmentation and are larger than bigints. Use UUIDs only when you need globally unique identifiers (e.g., distributed systems).

---

## 5. Concurrency & Locking (MEDIUM-HIGH)

### lock-short-transactions: Keep Transactions Short

**Impact:** Reduced lock contention, better concurrency

Long transactions hold locks and block other operations.

**Incorrect:**

```sql
begin;
-- Long-running operation
update orders set status = 'PROCESSED' where created_at < now() - interval '30 days';
-- More operations...
commit;
```

**Correct:**

```sql
-- Process in batches
update orders set status = 'PROCESSED'
where id in (
  select id from orders
  where created_at < now() - interval '30 days'
  limit 1000
);
```

### lock-skip-locked: Use SKIP LOCKED for Queue Processing

**Impact:** Better concurrency for queue-like operations

When multiple workers process items from a queue, use `SKIP LOCKED` to avoid blocking.

```sql
-- Worker 1
select * from jobs
where status = 'PENDING'
order by created_at
limit 1
for update skip locked;

-- Worker 2 (runs concurrently, skips rows locked by Worker 1)
select * from jobs
where status = 'PENDING'
order by created_at
limit 1
for update skip locked;
```

---

## 6. Data Access Patterns (MEDIUM)

### data-n-plus-one: Eliminate N+1 Queries

**Impact:** 10-100x fewer database roundtrips

N+1 queries occur when you fetch a list of items, then fetch related data for each item individually.

**Incorrect (N+1 queries):**

```js
// Fetch 100 orders
const orders = await db.select().from(orders);

// For each order, fetch customer (100 additional queries!)
for (const order of orders) {
  const customer = await db.select().from(customers).where(eq(customers.id, order.customerId));
}
```

**Correct (single query with JOIN):**

```js
const ordersWithCustomers = await db
  .select()
  .from(orders)
  .leftJoin(customers, eq(orders.customerId, customers.id));
```

### data-batch-inserts: Use Batch Inserts

**Impact:** 10-50x faster for bulk inserts

Insert multiple rows in a single statement.

**Incorrect (row-by-row):**

```js
for (const item of items) {
  await db.insert(orders).values(item);
}
```

**Correct (batch insert):**

```js
await db.insert(orders).values(items);
```

### data-pagination: Use Cursor-Based Pagination

**Impact:** Consistent performance regardless of page number

Offset-based pagination becomes slow for large offsets.

**Incorrect (offset pagination):**

```sql
-- Slow for large offsets
select * from orders order by created_at desc limit 20 offset 10000;
```

**Correct (cursor pagination):**

```sql
-- First page
select * from orders order by created_at desc limit 20;

-- Next page (use last created_at from previous page)
select * from orders
where created_at < '2024-01-15 10:30:00'
order by created_at desc
limit 20;
```

---

## 7. Monitoring & Diagnostics (LOW-MEDIUM)

### monitor-explain-analyze: Use EXPLAIN ANALYZE

**Impact:** Identify slow queries and missing indexes

Always use `EXPLAIN ANALYZE` to understand query performance.

```sql
explain analyze
select * from orders where customer_id = 123;
```

Look for:
- **Seq Scan** on large tables → missing index
- **Nested Loop** with large row counts → consider hash join
- **High actual rows vs estimated rows** → outdated statistics

### monitor-pg-stat-statements: Track Query Performance

**Impact:** Identify slowest queries in production

Enable `pg_stat_statements` extension to track query statistics.

```sql
-- Enable extension
create extension if not exists pg_stat_statements;

-- View top 10 slowest queries
select
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows
from pg_stat_statements
order by total_exec_time desc
limit 10;
```

### monitor-vacuum-analyze: Monitor Vacuum and Analyze

**Impact:** Prevent table bloat, keep statistics fresh

Postgres needs regular vacuum to reclaim space and analyze to update statistics.

```sql
-- Check table bloat
select
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_dead_tup,
  n_live_tup,
  last_vacuum,
  last_analyze
from pg_stat_user_tables
order by n_dead_tup desc;

-- Manual vacuum and analyze
vacuum analyze orders;
```

---

## 8. Advanced Features (LOW)

### advanced-full-text-search: Use Postgres Full-Text Search

**Impact:** Fast text search without external services

Postgres has built-in full-text search capabilities.

```sql
-- Add tsvector column
alter table articles add column search_vector tsvector;

-- Create index
create index articles_search_idx on articles using gin(search_vector);

-- Populate tsvector
update articles set search_vector = to_tsvector('english', title || ' ' || content);

-- Search
select * from articles
where search_vector @@ plainto_tsquery('english', 'database optimization');
```

### advanced-jsonb-indexing: Index JSONB Data

**Impact:** Fast queries on JSONB columns

Use GIN indexes for JSONB data.

```sql
-- Index entire JSONB column
create index orders_metadata_idx on orders using gin(metadata);

-- Query JSONB
select * from orders
where metadata @> '{"status": "active"}';
```

---

## Verification Checklist

Before deploying database changes, verify:

- [ ] All WHERE and JOIN columns are indexed
- [ ] Foreign key columns are indexed
- [ ] RLS is enabled on all multi-tenant tables
- [ ] RLS policies use `(select auth.uid())` pattern
- [ ] Connection pooling is configured
- [ ] Queries use explicit filters (not relying solely on RLS)
- [ ] EXPLAIN ANALYZE shows index scans (not seq scans) on large tables
- [ ] No N+1 query patterns in application code
- [ ] Batch inserts used for bulk operations
- [ ] Vacuum and analyze are running regularly

---

## References

- [Supabase RLS Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [PostgreSQL Performance Optimization](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [RLS Performance Benchmarks](https://github.com/GaryAustin1/RLS-Performance)
