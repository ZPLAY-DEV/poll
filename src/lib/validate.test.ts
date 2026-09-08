import { describe, it, expect } from "vitest";
import { parseVoteBody } from "./validate";

const optionIds = ["a", "b"];

describe("parseVoteBody", () => {
  it("accepts a known option", () => {
    expect(parseVoteBody({ optionId: "a" }, optionIds)).toEqual({
      ok: true,
      value: { optionId: "a" },
    });
  });

  it("rejects unknown option", () => {
    expect(parseVoteBody({ optionId: "zzz" }, optionIds).ok).toBe(false);
  });

  it("rejects non-object bodies", () => {
    expect(parseVoteBody(null, optionIds).ok).toBe(false);
    expect(parseVoteBody("x", optionIds).ok).toBe(false);
  });
});
