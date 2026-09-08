import type { Vote } from "./store";
import type { PollOption } from "@/poll.config";

export type Tally = {
  total: number;
  counts: { id: string; label: string; count: number }[];
};

export function tally(votes: Record<string, Vote>, options: readonly PollOption[]): Tally {
  const byId = new Map(options.map((o) => [o.id, 0]));
  for (const v of Object.values(votes)) {
    if (byId.has(v.optionId)) byId.set(v.optionId, byId.get(v.optionId)! + 1);
  }
  const counts = options.map((o) => ({ id: o.id, label: o.label, count: byId.get(o.id)! }));
  return { total: counts.reduce((s, c) => s + c.count, 0), counts };
}
