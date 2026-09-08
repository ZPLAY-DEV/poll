# 사내 투표 (poll)

10~15개 선택지 중 하나를 고르는 사내 단일 선택 투표 앱. Next.js 16 + Postgres(또는 Upstash Redis), Vercel 배포용.

- 기표란을 눌러 투표. 브라우저 쿠키로 1인 1표, 다시 제출하면 이전 표가 바뀝니다.
- 개표 현황은 실시간 집계(익명).

## 선택지 바꾸기

`src/poll.config.ts` 의 `title` / `description` / `options` 만 수정하면 됩니다.

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
```

저장소 환경변수가 없으면 메모리에 저장되며 화면 상단에 경고가 뜹니다. 로컬 개발에는 그대로 써도 됩니다.

## Vercel 배포

1. Vercel 에서 이 리포를 Import → Deploy.
2. 프로젝트 **Storage** 탭 → **Neon (Postgres)** 생성/연결. `DATABASE_URL` 이 자동으로 주입됩니다.
   (Upstash Redis 를 연결하면 `KV_REST_API_*` 로도 동작합니다. Postgres 가 있으면 Postgres 를 우선합니다.)
3. 재배포. 테이블은 첫 요청 때 자동으로 만들어집니다.

## 초기 표 등록 (seed)

`scripts/seed.ts` 의 `SEED` 목록을 저장소에 넣습니다. 같은 voter_id 를 쓰므로 여러 번 실행해도 중복되지 않습니다.

```bash
npx vercel login
npx vercel link            # zplay / poll 선택
npx vercel env pull .env.local
npm run seed
```

## 투표 초기화

환경변수 `ADMIN_TOKEN` 을 설정한 뒤:

```bash
curl -X DELETE -H "x-admin-token: $ADMIN_TOKEN" https://<배포주소>/api/poll
```

## API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/api/poll` | 선택지, 집계, 내 투표 |
| POST | `/api/poll` | `{ "optionId": "..." }` |
| DELETE | `/api/poll` | 전체 초기화 (`x-admin-token` 헤더 필요) |
