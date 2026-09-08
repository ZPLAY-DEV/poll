import { Redis } from "@upstash/redis";

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

// Vercel Marketplace(Upstash) 은 KV_REST_API_*, Upstash 직접 연결은 UPSTASH_REDIS_REST_* 를 씁니다.
function redisFromEnv(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const globalForStore = globalThis as unknown as { __pollStore?: Store };

export function getStore(): Store {
  if (!globalForStore.__pollStore) {
    const redis = redisFromEnv();
    globalForStore.__pollStore = redis ? createRedisStore(redis) : createMemoryStore();
  }
  return globalForStore.__pollStore;
}
