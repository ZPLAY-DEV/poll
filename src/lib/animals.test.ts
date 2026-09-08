import { describe, it, expect } from "vitest";
import { ANIMALS, randomAnimal } from "./animals";

describe("animals", () => {
  it("has 50 unique names", () => {
    expect(ANIMALS.length).toBe(50);
    expect(new Set(ANIMALS).size).toBe(50);
  });

  it("randomAnimal returns one of the names", () => {
    for (let i = 0; i < 100; i++) expect(ANIMALS).toContain(randomAnimal());
  });
});
