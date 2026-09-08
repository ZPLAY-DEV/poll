import { describe, it, expect } from "vitest";
import { createMemoryStore } from "./store";

describe("memory store", () => {
  it("stores one vote per voter and overwrites on re-vote", async () => {
    const store = createMemoryStore();
    await store.setVote("u1", { optionId: "a", at: 1 });
    await store.setVote("u1", { optionId: "b", at: 2 });
    await store.setVote("u2", { optionId: "a", at: 3 });
    expect(await store.getVotes()).toEqual({
      u1: { optionId: "b", at: 2 },
      u2: { optionId: "a", at: 3 },
    });
  });

  it("clear removes all votes", async () => {
    const store = createMemoryStore();
    await store.setVote("u1", { optionId: "a", at: 1 });
    await store.clear();
    expect(await store.getVotes()).toEqual({});
  });
});
