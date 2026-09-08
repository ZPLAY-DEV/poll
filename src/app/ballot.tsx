"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Tally } from "@/lib/tally";

type PollData = {
  poll: { title: string; description: string; options: readonly { id: string; label: string; note?: string }[] };
  tally: Tally;
  myVote: { name: string; optionId: string } | null;
};

function Stamp() {
  return (
    <span
      aria-hidden
      className="stamp inline-flex h-8 w-8 items-center justify-center rounded-full border-[2.5px] border-stamp font-display text-lg font-extrabold leading-none text-stamp"
    >
      卜
    </span>
  );
}

export default function Ballot() {
  const [data, setData] = useState<PollData | null>(null);
  const [name, setName] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/poll")
      .then((r) => r.json())
      .then((d: PollData) => {
        setData(d);
        if (d.myVote) {
          setName(d.myVote.name);
          setChoice(d.myVote.optionId);
        }
      })
      .catch(() => setError("투표 정보를 불러오지 못했습니다. 새로고침해 주세요."));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!choice) {
      setError("기표란을 눌러 한 곳을 골라 주세요.");
      return;
    }
    setStatus("saving");
    setError(null);
    const res = await fetch("/api/poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, optionId: choice }),
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "투표를 저장하지 못했습니다.");
      setStatus("idle");
      return;
    }
    setData(body);
    setStatus("saved");
  }

  if (!data) {
    return <p className="text-muted">{error ?? "불러오는 중…"}</p>;
  }

  const { poll, tally, myVote } = data;
  const max = Math.max(1, ...tally.counts.map((c) => c.count));

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={submit}
        className="border border-ink bg-paper shadow-[0_1px_0_#fff_inset,0_12px_30px_-18px_rgba(27,42,65,.5)]"
      >
        <header className="border-b border-ink px-6 pt-6 pb-5 sm:px-8">
          <p className="text-xs font-medium tracking-[0.3em] text-muted">투 표 용 지</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold leading-snug sm:text-3xl">
            {poll.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{poll.description}</p>
        </header>

        <div className="border-b border-ink px-6 py-4 sm:px-8">
          <label className="flex items-baseline gap-4">
            <span className="w-14 shrink-0 text-sm font-medium">이름</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              required
              placeholder="홍길동"
              className="min-w-0 flex-1 border-b border-rule bg-transparent py-1 text-base outline-none placeholder:text-muted/50 focus:border-ink"
            />
          </label>
        </div>

        <fieldset>
          <legend className="sr-only">선택지</legend>
          <div className="grid grid-cols-[3rem_1fr_4.5rem] border-b border-ink text-xs font-medium text-muted sm:grid-cols-[4rem_1fr_5rem]">
            <span className="border-r border-ink px-2 py-2 text-center">기호</span>
            <span className="px-4 py-2">후보</span>
            <span className="border-l border-ink px-2 py-2 text-center">기표란</span>
          </div>
          <ul>
            {poll.options.map((o, i) => {
              const selected = choice === o.id;
              return (
                <li
                  key={o.id}
                  className="grid grid-cols-[3rem_1fr_4.5rem] border-b border-rule last:border-b-0 sm:grid-cols-[4rem_1fr_5rem]"
                >
                  <label className="contents cursor-pointer">
                    <input
                      type="radio"
                      name="option"
                      value={o.id}
                      checked={selected}
                      onChange={() => {
                        setChoice(o.id);
                        setError(null);
                        if (status === "saved") setStatus("idle");
                      }}
                      className="peer sr-only"
                    />
                    <span className="flex items-center justify-center border-r border-ink font-mono text-sm">
                      {i + 1}
                    </span>
                    <span className="flex flex-wrap items-baseline gap-x-3 px-4 py-3 peer-focus-visible:bg-ink/5">
                      <span className="text-base font-medium">{o.label}</span>
                      {o.note && <span className="font-mono text-xs text-muted">{o.note}</span>}
                    </span>
                    <span className="flex items-center justify-center border-l border-ink py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-ink peer-focus-visible:-outline-offset-2">
                      {selected && <Stamp />}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <footer className="flex flex-wrap items-center gap-3 border-t border-ink px-6 py-4 sm:px-8">
          <button
            type="submit"
            disabled={status === "saving"}
            className="bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
          >
            {status === "saving" ? "저장 중…" : myVote ? "다시 투표하기" : "투표하기"}
          </button>
          <span className="text-sm text-muted" role="status" aria-live="polite">
            {error
              ? <span className="text-stamp">{error}</span>
              : status === "saved"
                ? "투표했습니다."
                : myVote
                  ? `현재 ${poll.options.find((o) => o.id === myVote.optionId)?.label ?? "?"}에 투표되어 있습니다.`
                  : null}
          </span>
        </footer>
      </form>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold">개표 현황</h2>
          <span className="font-mono text-sm text-muted">{tally.total}명 참여</span>
        </div>
        <ol className="space-y-2">
          {tally.counts.map((c, i) => (
            <li key={c.id} className="grid grid-cols-[2rem_6rem_1fr_2.5rem] items-center gap-2 text-sm">
              <span className="font-mono text-muted">{i + 1}</span>
              <span className="truncate font-medium">{c.label}</span>
              <span className="h-3 bg-rule/50">
                <span
                  className="bar block h-full bg-stamp transition-[width] duration-500"
                  style={{ width: `${(c.count / max) * 100}%` }}
                />
              </span>
              <span className="text-right font-mono">{c.count}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
