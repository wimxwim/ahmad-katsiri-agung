// Append-only event log with SHA-256 hash chain.
// Used for audit trail and data integrity verification.

import crypto from "crypto";
import { db } from "@/lib/db";
import { eventStore } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function appendEvent(
  streamId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<string> {
  const lastEvent = await db
    .select({ version: eventStore.version, previousHash: eventStore.previousHash })
    .from(eventStore)
    .where(eq(eventStore.streamId, streamId))
    .orderBy(desc(eventStore.version))
    .limit(1);

  const version = (lastEvent[0]?.version ?? 0) + 1;
  const prevHash = lastEvent[0]?.previousHash ?? "0".repeat(64);

  const hashInput = prevHash + JSON.stringify(payload) + version;
  const newHash = crypto.createHash("sha256").update(hashInput).digest("hex");

  const [event] = await db
    .insert(eventStore)
    .values({ streamId, version, eventType, payload, previousHash: newHash })
    .returning({ id: eventStore.id });

  return event.id;
}

export async function getPreviousHash(streamId: string): Promise<string> {
  const lastEvent = await db
    .select({ previousHash: eventStore.previousHash })
    .from(eventStore)
    .where(eq(eventStore.streamId, streamId))
    .orderBy(desc(eventStore.version))
    .limit(1);

  return lastEvent[0]?.previousHash ?? "0".repeat(64);
}

export async function verifyStreamIntegrity(streamId: string): Promise<boolean> {
  const events = await db
    .select()
    .from(eventStore)
    .where(eq(eventStore.streamId, streamId))
    .orderBy(eventStore.version);

  let expectedPrevHash = "0".repeat(64);

  for (const event of events) {
    const hashInput = expectedPrevHash + JSON.stringify(event.payload) + event.version;
    const computedHash = crypto.createHash("sha256").update(hashInput).digest("hex");

    if (computedHash !== event.previousHash) return false;
    expectedPrevHash = event.previousHash;
  }

  return true;
}
