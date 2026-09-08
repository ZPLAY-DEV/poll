import { describe, it, expect } from "vitest";
import { tally } from "./tally";
import type { Vote } from "./store";

const options = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
];

describe("tally", () => {
  it("counts votes per option in option order, including zero counts", () => {
    const votes: Record<string, Vote> = {
      u1: { name: "김", optionId: "a", at: 1 },
      u2: { name: "이", optionId: "a", at: 2 },
      u3: { name: "박", optionId: "c", at: 3 },
    };
    expect(tally(votes, options)).toEqual({
      total: 3,
      counts: [
        { id: "a", label: "A", count: 2 },
        { id: "b", label: "B", count: 0 },
        { id: "c", label: "C", count: 1 },
      ],
    });
  });

  it("ignores votes for options that no longer exist", () => {
    const votes: Record<string, Vote> = {
      u1: { name: "김", optionId: "zzz", at: 1 },
      u2: { name: "이", optionId: "b", at: 2 },
    };
    const result = tally(votes, options);
    expect(result.total).toBe(1);
    expect(result.counts.find((c) => c.id === "b")?.count).toBe(1);
  });
});
