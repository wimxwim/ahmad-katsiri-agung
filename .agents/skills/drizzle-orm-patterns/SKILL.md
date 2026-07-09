---
name: drizzle-orm-patterns
description: Drizzle ORM best practices for TypeScript-first database operations. Covers schema declaration, relational queries, migrations, type safety, and performance patterns. Use when implementing database operations with Drizzle ORM in Next.js applications.
allowed-tools: []
metadata:
  author: Drizzle Team + Community Best Practices
  version: "2026.1"
  scope: database-orm
  pairs_with: supabase-postgres-best-practices, schema-evolution-and-contract-migrations
  updated: "2026-07-08"
  sources:
    - https://orm.drizzle.team/docs/overview
    - https://orm.drizzle.team/docs/sql-schema-declaration
    - https://orm.drizzle.team/docs/rqb
---

# Drizzle ORM Patterns

Drizzle ORM is a headless TypeScript ORM that provides both relational and SQL-like query APIs. It's lightweight, performant, typesafe, and serverless-ready by design.

## Core Principles

1. **SQL-like syntax**: If you know SQL, you know Drizzle
2. **Type safety**: Full TypeScript inference from schema to queries
3. **Zero dependencies**: Minimal bundle size, serverless-ready
4. **Dual query APIs**: Relational queries (nested data) + SQL-like queries (full control)
5. **Automatic migrations**: Schema-first development with Drizzle Kit

---

## 1. Schema Declaration (CRITICAL)

### schema-table-definition: Define Tables with pgTable

**Impact:** Type-safe schema that generates SQL migrations

**Correct pattern:**

```typescript
import { pgTable, uuid, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash'),
  role: varchar('role', { length: 20 }).notNull().default('siswa'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
```

**Key rules:**
- Use `uuid` for primary keys (globally unique, works with distributed systems)
- Always specify `{ length: n }` for `varchar` (prevents unlimited text storage)
- Use `timestamp` with `{ withTimezone: true }` (avoids timezone bugs)
- Mark nullable fields explicitly (Drizzle infers TypeScript types)
- Use `.defaultNow()` for timestamps (database-level default)

### schema-relations: Define Relations Explicitly

**Impact:** Enables relational queries with proper type inference

**Correct pattern:**

```typescript
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many, one }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
  school: one(schools, {
    fields: [users.schoolId],
    references: [schools.id],
  }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(users, {
    fields: [courses.teacherId],
    references: [users.id],
    relationName: 'teacherCourses',
  }),
  enrollments: many(enrollments),
  modules: many(modules),
}));
```

**Key rules:**
- Define relations in separate `*Relations` exports
- Use `relationName` when multiple relations exist between same tables
- Specify `fields` and `references` explicitly (type-safe foreign keys)
- Use `one()` for belongs-to, `many()` for has-many

### schema-enums: Use Enums for Constrained Values

**Impact:** Type-safe constrained values at database level

**Correct pattern:**

```typescript
import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['owner', 'admin_sekolah', 'guru', 'siswa', 'orang_tua']);
export const statusEnum = pgEnum('status', ['draft', 'published', 'archived']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: roleEnum('role').notNull().default('siswa'),
  // ...
});
```

**Key rules:**
- Define enums with `pgEnum()` before using in tables
- Use lowercase snake_case for enum values (consistent with SQL conventions)
- Enums are type-safe in TypeScript (inferred from schema)

---

## 2. Query Patterns (CRITICAL)

### query-relational: Use Relational Queries for Nested Data

**Impact:** Single query fetches nested data (no N+1 problem)

**Correct pattern:**

```typescript
// Fetch user with all their courses and enrollments
const userWithCourses = await db.query.users.findMany({
  where: eq(users.id, userId),
  with: {
    courses: {
      with: {
        teacher: true,
      },
      where: eq(courses.status, 'published'),
      limit: 10,
    },
    enrollments: {
      with: {
        course: true,
      },
    },
  },
});
```

**Key rules:**
- Use `db.query.*` for relational queries (not `db.select()`)
- Nest `with` objects to fetch related data
- Apply `where`, `limit`, `orderBy` within each relation
- Drizzle generates a single optimized SQL query

### query-sql-like: Use SQL-like Queries for Complex Operations

**Impact:** Full control over query structure, better for complex joins

**Correct pattern:**

```typescript
import { eq, and, or, desc, sql } from 'drizzle-orm';

// Complex query with joins and aggregations
const courseStats = await db
  .select({
    courseId: courses.id,
    courseName: courses.name,
    enrollmentCount: sql<number>`count(${enrollments.id})`.as('enrollment_count'),
    avgProgress: sql<number>`avg(${enrollments.progress})`.as('avg_progress'),
  })
  .from(courses)
  .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
  .where(eq(courses.teacherId, teacherId))
  .groupBy(courses.id, courses.name)
  .orderBy(desc(sql`enrollment_count`))
  .limit(10);
```

**Key rules:**
- Use `db.select()` for SQL-like queries
- Import operators: `eq`, `and`, `or`, `like`, `inArray`, `between`
- Use `sql` template tag for raw SQL expressions
- Chain `.leftJoin()`, `.where()`, `.groupBy()`, `.orderBy()`, `.limit()`

### query-insert: Use Batch Inserts for Multiple Rows

**Impact:** 10-50x faster than row-by-row inserts

**Incorrect (row-by-row):**

```typescript
for (const student of students) {
  await db.insert(enrollments).values({
    userId: student.id,
    courseId,
    enrolledAt: new Date(),
  });
}
```

**Correct (batch insert):**

```typescript
await db.insert(enrollments).values(
  students.map(student => ({
    userId: student.id,
    courseId,
    enrolledAt: new Date(),
  }))
);
```

### query-update: Use Conditional Updates

**Impact:** Prevent unnecessary writes, better concurrency

**Correct pattern:**

```typescript
// Update only if conditions met
const updated = await db
  .update(users)
  .set({ name, updatedAt: new Date() })
  .where(and(eq(users.id, userId), eq(users.role, 'siswa')))
  .returning();

if (updated.length === 0) {
  throw new Error('User not found or invalid role');
}
```

**Key rules:**
- Always use `.where()` to target specific rows
- Use `.returning()` to get updated rows (avoids extra query)
- Check `updated.length` to verify operation succeeded

### query-delete: Use Soft Deletes for Audit Trail

**Impact:** Preserves data history, enables recovery

**Correct pattern:**

```typescript
// Add deletedAt column
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  // ...
});

// Soft delete
await db
  .update(users)
  .set({ deletedAt: new Date() })
  .where(eq(users.id, userId));

// Query active users only
const activeUsers = await db.query.users.findMany({
  where: isNull(users.deletedAt),
});
```

---

## 3. Type Safety (CRITICAL)

### types-inference: Leverage TypeScript Inference

**Impact:** Catch errors at compile time, not runtime

**Correct pattern:**

```typescript
// Schema defines types
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('siswa'),
});

// Types are inferred
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

// Use inferred types
const getUser = async (id: string): Promise<User | undefined> => {
  return db.query.users.findFirst({ where: eq(users.id, id) });
};

const createUser = async (data: NewUser): Promise<User> => {
  const [user] = await db.insert(users).values(data).returning();
  return user;
};
```

**Key rules:**
- Use `$inferSelect` for query result types
- Use `$inferInsert` for insert data types
- Let TypeScript infer types from schema (don't duplicate)
- Use inferred types in function signatures

### types-operators: Use Type-Safe Operators

**Impact:** Prevent SQL injection, ensure type correctness

**Correct pattern:**

```typescript
import { eq, and, or, like, inArray, between, isNull } from 'drizzle-orm';

// Type-safe operators
const results = await db.query.users.findMany({
  where: and(
    eq(users.role, 'siswa'),
    or(
      like(users.email, '%@gmail.com'),
      like(users.email, '%@yahoo.com')
    ),
    isNull(users.deletedAt)
  ),
});
```

**Key rules:**
- Always use Drizzle operators (never string concatenation)
- Operators are type-checked (TypeScript catches mismatches)
- Combine with `and()`, `or()` for complex conditions

---

## 4. Migrations (HIGH)

### migrations-generate: Generate Migrations from Schema

**Impact:** Automatic migration scripts, version-controlled schema changes

**Workflow:**

```bash
# 1. Generate migration from schema changes
npx drizzle-kit generate

# 2. Review generated SQL in drizzle/ folder
# 3. Apply migration
npx drizzle-kit migrate

# 4. (Optional) Push directly to dev database
npx drizzle-kit push
```

**Key rules:**
- Always review generated SQL before applying
- Commit migration files to version control
- Use `push` only for development (not production)
- Use `migrate` for production deployments

### migrations-custom: Write Custom Migrations

**Impact:** Handle complex schema changes not covered by Drizzle Kit

**Correct pattern:**

```sql
-- drizzle/0001_add_rls_policies.sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_self_policy ON users
  FOR ALL
  USING (id = current_setting('app.current_user_id')::uuid);
```

**Key rules:**
- Place custom migrations in `drizzle/` folder
- Number migrations sequentially
- Use custom migrations for RLS policies, indexes, triggers
- Test custom migrations in staging before production

---

## 5. Performance Patterns (HIGH)

### perf-prepared: Use Prepared Statements for Repeated Queries

**Impact:** 20-50% faster for frequently executed queries

**Correct pattern:**

```typescript
// Prepare statement once
const getUserById = db.query.users
  .findFirst({ where: eq(users.id, sql.placeholder('userId')) })
  .prepare('getUserById');

// Execute multiple times (faster after first call)
const user1 = await getUserById.execute({ userId: '123' });
const user2 = await getUserById.execute({ userId: '456' });
```

**Key rules:**
- Use `.prepare()` for queries executed multiple times
- Use `sql.placeholder()` for dynamic values
- Prepared statements are cached by connection pooler

### perf-batch: Use Batch Operations for Multiple Queries

**Impact:** Reduce round trips, better transaction handling

**Correct pattern:**

```typescript
import { batch } from 'drizzle-orm';

// Execute multiple queries in single round trip
const [users, courses, enrollments] = await batch([
  db.query.users.findMany({ limit: 10 }),
  db.query.courses.findMany({ limit: 10 }),
  db.query.enrollments.findMany({ limit: 10 }),
]);
```

### perf-transactions: Use Transactions for Atomic Operations

**Impact:** Data consistency, rollback on failure

**Correct pattern:**

```typescript
try {
  await db.transaction(async (tx) => {
    // Create enrollment
    const [enrollment] = await tx
      .insert(enrollments)
      .values({ userId, courseId })
      .returning();

    // Update course enrollment count
    await tx
      .update(courses)
      .set({ enrollmentCount: sql`${courses.enrollmentCount} + 1` })
      .where(eq(courses.id, courseId));

    // Create notification
    await tx
      .insert(notifications)
      .values({ userId, type: 'enrollment_created' });
  });
} catch (error) {
  // Transaction automatically rolled back
  console.error('Enrollment failed:', error);
}
```

**Key rules:**
- Use `db.transaction()` for atomic operations
- Pass `tx` (transaction context) to all queries within
- If any query fails, entire transaction rolls back
- Keep transactions short (avoid long-running operations)

---

## 6. Common Pitfalls (MEDIUM)

### pitfall-n-plus-one: Avoid N+1 Query Problem

**Incorrect (N+1 queries):**

```typescript
// Fetch 100 courses
const courses = await db.query.courses.findMany();

// For each course, fetch teacher (100 additional queries!)
for (const course of courses) {
  const teacher = await db.query.users.findFirst({
    where: eq(users.id, course.teacherId),
  });
}
```

**Correct (single query with relational):**

```typescript
const coursesWithTeachers = await db.query.courses.findMany({
  with: {
    teacher: true,
  },
});
```

### pitfall-raw-sql: Avoid Raw SQL String Concatenation

**Incorrect (SQL injection risk):**

```typescript
const query = `SELECT * FROM users WHERE email = '${email}'`;
const result = await db.execute(sql.raw(query));
```

**Correct (parameterized query):**

```typescript
const result = await db.query.users.findFirst({
  where: eq(users.email, email),
});
```

### pitfall-missing-returning: Don't Forget .returning()

**Incorrect (extra query needed):**

```typescript
await db.insert(users).values({ email, name });
const user = await db.query.users.findFirst({ where: eq(users.email, email) });
```

**Correct (single query):**

```typescript
const [user] = await db.insert(users).values({ email, name }).returning();
```

---

## 7. Integration with Next.js (MEDIUM)

### nextjs-server-components: Use Drizzle in Server Components

**Correct pattern:**

```typescript
// app/courses/page.tsx (Server Component)
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';

export default async function CoursesPage() {
  const allCourses = await db.query.courses.findMany({
    where: eq(courses.status, 'published'),
    with: {
      teacher: true,
    },
  });

  return (
    <ul>
      {allCourses.map(course => (
        <li key={course.id}>{course.name} - {course.teacher.name}</li>
      ))}
    </ul>
  );
}
```

**Key rules:**
- Fetch data directly in Server Components (no API route needed)
- Pass `db` instance from `@/lib/db`
- Use relational queries for nested data

### nextjs-route-handlers: Use Drizzle in Route Handlers

**Correct pattern:**

```typescript
// app/api/courses/route.ts
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const allCourses = await db.query.courses.findMany();
  return NextResponse.json(allCourses);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const [course] = await db.insert(courses).values(body).returning();
  return NextResponse.json(course, { status: 201 });
}
```

---

## Verification Checklist

Before deploying Drizzle ORM code, verify:

- [ ] Schema uses appropriate data types (uuid, varchar with length, timestamptz)
- [ ] Relations are defined explicitly with `fields` and `references`
- [ ] Queries use type-safe operators (eq, and, or) not string concatenation
- [ ] Relational queries used for nested data (no N+1 problem)
- [ ] Batch inserts used for multiple rows
- [ ] Transactions used for atomic operations
- [ ] `.returning()` used to avoid extra queries
- [ ] Migrations generated and reviewed before applying
- [ ] TypeScript types inferred from schema (no manual type definitions)
- [ ] Prepared statements used for frequently executed queries

---

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Schema Declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [Relational Queries](https://orm.drizzle.team/docs/rqb)
- [Drizzle Kit Migrations](https://orm.drizzle.team/docs/kit-overview)
- [TypeScript Integration](https://orm.drizzle.team/docs/typescript)
