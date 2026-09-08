import { createClient, type Client } from "@libsql/client";

export type Vote = { optionId: string; at: number };

export type Store = {
  /** true when votes survive across server instances (Turso). */
  persistent: boolean;
  getVotes(): Promise<Record<string, Vote>>;
  setVote(voterId: string, vote: Vote): Promise<void>;
  clear(): Promise<void>;
};

export function createMemoryStore(): Store {
  const votes: Record<string, Vote> = {};
  return {
    persistent: false,
    async getVotes() {
      return { ...votes };
    },
    async setVote(voterId, vote) {
      votes[voterId] = vote;
    },
    async clear() {
      for (const k of Object.keys(votes)) delete votes[k];
    },
  };
}

export function createTursoStore(client: Client): Store {
  const ready = client.execute(
    "CREATE TABLE IF NOT EXISTS votes (voter_id TEXT PRIMARY KEY, option_id TEXT NOT NULL, at INTEGER NOT NULL)",
  );
  return {
    persistent: true,
    async getVotes() {
      await ready;
      const { rows } = await client.execute("SELECT voter_id, option_id, at FROM votes");
      const votes: Record<string, Vote> = {};
      for (const r of rows) votes[String(r.voter_id)] = { optionId: String(r.option_id), at: Number(r.at) };
      return votes;
    },
    async setVote(voterId, vote) {
      await ready;
      await client.execute({
        sql: "INSERT INTO votes (voter_id, option_id, at) VALUES (?, ?, ?) ON CONFLICT (voter_id) DO UPDATE SET option_id = excluded.option_id, at = excluded.at",
        args: [voterId, vote.optionId, vote.at],
      });
    },
    async clear() {
      await ready;
      await client.execute("DELETE FROM votes");
    },
  };
}

// Turso: TURSO_DATABASE_URL (libsql://...) + TURSO_AUTH_TOKEN. 로컬 테스트는 file:local.db 도 가능.
function tursoFromEnv(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
}

const globalForStore = globalThis as unknown as { __pollStore?: Store };

export function getStore(): Store {
  if (!globalForStore.__pollStore) {
    const turso = tursoFromEnv();
    globalForStore.__pollStore = turso ? createTursoStore(turso) : createMemoryStore();
  }
  return globalForStore.__pollStore;
}
