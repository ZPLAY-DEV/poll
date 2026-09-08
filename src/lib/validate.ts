export type VoteInput = { optionId: string };

export function parseVoteBody(
  body: unknown,
  optionIds: readonly string[],
): { ok: true; value: VoteInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "잘못된 요청입니다." };
  const { optionId } = body as Record<string, unknown>;
  if (typeof optionId !== "string" || !optionIds.includes(optionId))
    return { ok: false, error: "선택지를 골라 주세요." };
  return { ok: true, value: { optionId } };
}
