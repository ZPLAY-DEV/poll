import { cookies } from "next/headers";
import { poll } from "@/poll.config";
import { getStore } from "@/lib/store";
import { tally } from "@/lib/tally";
import { parseVoteBody } from "@/lib/validate";

const VOTER_COOKIE = "voter_id";
const optionIds = poll.options.map((o) => o.id);

async function payload(voterId: string | undefined) {
  const store = getStore();
  const votes = await store.getVotes();
  const mine = voterId ? votes[voterId] : undefined;
  return {
    poll: { title: poll.title, description: poll.description, options: poll.options },
    tally: tally(votes, poll.options),
    myVote: mine ? { optionId: mine.optionId } : null,
    persistent: store.persistent,
  };
}

export async function GET() {
  const cookieStore = await cookies();
  return Response.json(await payload(cookieStore.get(VOTER_COOKIE)?.value), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = parseVoteBody(body, optionIds);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const cookieStore = await cookies();
  const voterId = cookieStore.get(VOTER_COOKIE)?.value ?? crypto.randomUUID();
  await getStore().setVote(voterId, { ...parsed.value, at: Date.now() });

  cookieStore.set(VOTER_COOKIE, voterId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return Response.json(await payload(voterId), { headers: { "Cache-Control": "no-store" } });
}

// 전체 초기화: ADMIN_TOKEN 환경변수를 설정한 뒤 `x-admin-token` 헤더로 호출합니다.
export async function DELETE(request: Request) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || request.headers.get("x-admin-token") !== expected) {
    return Response.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  await getStore().clear();
  return Response.json({ ok: true });
}
