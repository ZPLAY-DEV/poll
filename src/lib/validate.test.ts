import { describe, it, expect } from "vitest";
import { parseVoteBody } from "./validate";

const optionIds = ["a", "b"];

describe("parseVoteBody", () => {
  it("accepts a trimmed name and a known option", () => {
    expect(parseVoteBody({ name: "  김철수 ", optionId: "a" }, optionIds)).toEqual({
      ok: true,
      value: { name: "김철수", optionId: "a" },
    });
  });

  it("rejects empty name", () => {
    expect(parseVoteBody({ name: "   ", optionId: "a" }, optionIds).ok).toBe(false);
  });

  it("rejects name longer than 30 chars", () => {
    expect(parseVoteBody({ name: "x".repeat(31), optionId: "a" }, optionIds).ok).toBe(false);
  });

  it("rejects unknown option", () => {
    expect(parseVoteBody({ name: "김", optionId: "zzz" }, optionIds).ok).toBe(false);
  });

  it("rejects non-object bodies", () => {
    expect(parseVoteBody(null, optionIds).ok).toBe(false);
    expect(parseVoteBody("x", optionIds).ok).toBe(false);
  });
});
