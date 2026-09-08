# 사내 투표 (poll)

10~15개 선택지 중 하나를 고르는 사내 단일 선택 투표 앱. Next.js 16 + Upstash Redis, Vercel 배포용.

- 이름 입력 후 기표란을 눌러 투표. 브라우저 쿠키로 1인 1표, 다시 제출하면 이전 표가 바뀝니다.
- 개표 현황은 실시간 집계(투표자 이름은 표시하지 않음).

## 선택지 바꾸기

`src/poll.config.ts` 의 `title` / `description` / `options` 만 수정하면 됩니다.

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
```

저장소(Redis) 환경변수가 없으면 메모리에 저장되며 화면 상단에 경고가 뜹니다. 로컬 개발에는 그대로 써도 됩니다.

## Vercel 배포

1. Vercel 에서 이 리포를 Import → Deploy.
2. 프로젝트 **Storage** 탭 → **Upstash Redis** 생성/연결. `KV_REST_API_URL`, `KV_REST_API_TOKEN` 이 자동으로 주입됩니다.
   (직접 만든 Upstash 라면 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` 도 인식합니다.)
3. 재배포. 상단 경고가 사라지면 저장소가 연결된 것입니다.

## 투표 초기화

환경변수 `ADMIN_TOKEN` 을 설정한 뒤:

```bash
curl -X DELETE -H "x-admin-token: $ADMIN_TOKEN" https://<배포주소>/api/poll
```

## API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/api/poll` | 선택지, 집계, 내 투표 |
| POST | `/api/poll` | `{ "name": "...", "optionId": "..." }` |
| DELETE | `/api/poll` | 전체 초기화 (`x-admin-token` 헤더 필요) |
