export const NAME_MAX = 30;

export type VoteInput = { name: string; optionId: string };

export function parseVoteBody(
  body: unknown,
  optionIds: readonly string[],
): { ok: true; value: VoteInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "잘못된 요청입니다." };
  const { name, optionId } = body as Record<string, unknown>;
  const trimmed = typeof name === "string" ? name.trim() : "";
  if (!trimmed) return { ok: false, error: "이름을 입력해 주세요." };
  if (trimmed.length > NAME_MAX) return { ok: false, error: `이름은 ${NAME_MAX}자 이내로 입력해 주세요.` };
  if (typeof optionId !== "string" || !optionIds.includes(optionId))
    return { ok: false, error: "선택지를 골라 주세요." };
  return { ok: true, value: { name: trimmed, optionId } };
}
