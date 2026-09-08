// 지정한 표를 저장소에 등록합니다. 같은 voter_id 로 다시 실행하면 덮어쓰므로 여러 번 실행해도 중복되지 않습니다.
// 사용: vercel env pull .env.local && npm run seed
import { getStore } from "../src/lib/store";

const SEED: { optionId: string; count: number }[] = [
  { optionId: "samz", count: 1 },
  { optionId: "ohmyssam", count: 3 },
];

try {
  process.loadEnvFile(".env.local");
} catch {}

async function main() {
  const store = getStore();
  if (!store.persistent) {
    console.error("DATABASE_URL / POSTGRES_URL / KV_REST_API_* 가 없습니다. `vercel env pull .env.local` 을 먼저 실행하세요.");
    process.exit(1);
  }
  for (const { optionId, count } of SEED) {
    for (let i = 1; i <= count; i++) {
      await store.setVote(`seed-${optionId}-${i}`, { optionId, at: Date.now() });
    }
    console.log(`${optionId}: ${count}표 등록`);
  }
  console.log("합계:", Object.keys(await store.getVotes()).length, "표");
  process.exit(0);
}

main();
