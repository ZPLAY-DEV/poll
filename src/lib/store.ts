import { Redis } from "@upstash/redis";
import { Pool } from "pg";

export type Vote = { optionId: string; at: number };

export type Store = {
  /** true when votes survive across server instances (Redis). */
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

const KEY = "poll:votes";

function createRedisStore(redis: Redis): Store {
  return {
    persistent: true,
    async getVotes() {
      return (await redis.hgetall<Record<string, Vote>>(KEY)) ?? {};
    },
    async setVote(voterId, vote) {
      await redis.hset(KEY, { [voterId]: vote });
    },
    async clear() {
      await redis.del(KEY);
    },
  };
}

// Postgres (Vercel Marketplace 의 Neon/Supabase 등은 DATABASE_URL 또는 POSTGRES_URL 을 주입합니다.)
function createPostgresStore(pool: Pool): Store {
  const ready = pool.query(
    "CREATE TABLE IF NOT EXISTS votes (voter_id TEXT PRIMARY KEY, option_id TEXT NOT NULL, at BIGINT NOT NULL)",
  );
  return {
    persistent: true,
    async getVotes() {
      await ready;
      const { rows } = await pool.query<{ voter_id: string; option_id: string; at: string }>(
        "SELECT voter_id, option_id, at FROM votes",
      );
      const votes: Record<string, Vote> = {};
      for (const r of rows) votes[r.voter_id] = { optionId: r.option_id, at: Number(r.at) };
      return votes;
    },
    async setVote(voterId, vote) {
      await ready;
      await pool.query(
        "INSERT INTO votes (voter_id, option_id, at) VALUES ($1, $2, $3) ON CONFLICT (voter_id) DO UPDATE SET option_id = EXCLUDED.option_id, at = EXCLUDED.at",
        [voterId, vote.optionId, vote.at],
      );
    },
    async clear() {
      await ready;
      await pool.query("DELETE FROM votes");
    },
  };
}

function postgresFromEnv(): Pool | null {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  return url ? new Pool({ connectionString: url, max: 3 }) : null;
}

// Vercel Marketplace(Upstash) 은 KV_REST_API_*, Upstash 직접 연결은 UPSTASH_REDIS_REST_* 를 씁니다.
function redisFromEnv(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const globalForStore = globalThis as unknown as { __pollStore?: Store };

export function getStore(): Store {
  if (!globalForStore.__pollStore) {
    const pg = postgresFromEnv();
    const redis = pg ? null : redisFromEnv();
    globalForStore.__pollStore = pg
      ? createPostgresStore(pg)
      : redis
        ? createRedisStore(redis)
        : createMemoryStore();
  }
  return globalForStore.__pollStore;
}
