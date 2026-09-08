# 사내 투표 (poll)

10~15개 선택지 중 하나를 고르는 사내 단일 선택 투표 앱. Next.js 16 + Turso(libSQL), Vercel 배포용.

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
2. 프로젝트 Settings → **Environment Variables** 에 아래 두 개를 추가 (Production/Preview 모두).
   - `TURSO_DATABASE_URL` = `libsql://<db>-<org>.turso.io`
   - `TURSO_AUTH_TOKEN` = Turso 대시보드/CLI(`turso db tokens create <db>`)에서 발급한 토큰
3. 재배포. `votes` 테이블은 첫 요청 때 자동으로 만들어집니다.

## 초기 표 등록 (seed)

`scripts/seed.ts` 의 `SEED` 목록을 저장소에 넣습니다. 같은 voter_id 를 쓰므로 여러 번 실행해도 중복되지 않습니다.

```bash
# .env.local 에 TURSO_DATABASE_URL, TURSO_AUTH_TOKEN 설정 후
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
