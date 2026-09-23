"use client";

import { useState } from "react";
import { IconSpark, btnPrimaryClass, cardClass, fieldClass } from "@/components/ui";
import { t } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

export function AiPromptSection() {
  const m = t("it");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    const nextHistory = [...messages, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    setInput("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = (await res.json()) as {
        status?: string;
        message?: string;
        reply?: string | null;
        error?: { message?: string };
      };
      if (data.status === "openai_not_configured" || !data.reply) {
        setError(data.message || m.aiNotConfigured);
        return;
      }
      setMessages([
        ...nextHistory,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setError(m.fetchError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="animate-fade-up-delay mx-auto max-w-3xl px-5 pb-24 sm:px-10">
      <div className={`${cardClass} p-5 sm:p-7`}>
        <div className="flex items-start gap-3">
          <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <IconSpark className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-3xl text-[var(--ink)] sm:text-4xl">
              {m.tellWhere}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              Assistente AI con tool reali (searchFlights, searchHotels, searchCars…).
              Senza OPENAI_API_KEY non simula risposte. Se un provider non è configurato,
              lo dice chiaramente — zero prezzi inventati.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="ai-where">
            {m.tellWhere}
          </label>
          <input
            id="ai-where"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
            placeholder={m.tellWherePlaceholder}
            className={`${fieldClass} flex-1`}
            disabled={loading}
            aria-busy={loading}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading}
            className={`${btnPrimaryClass} sm:min-w-28`}
          >
            {loading ? "…" : "Invia"}
          </button>
        </div>

        {error && (
          <p
            className="mt-4 rounded-xl border border-amber-700/25 bg-[var(--warn-bg)] px-4 py-3 text-sm text-[var(--warn-ink)]"
            role="alert"
          >
            {error}
          </p>
        )}

        {messages.length > 0 && (
          <ul className="mt-5 space-y-3" aria-live="polite">
            {messages.map((msg, i) => (
              <li
                key={`${msg.role}-${i}`}
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "ml-6 bg-[var(--accent)] text-white"
                    : "mr-6 border border-[var(--line)] bg-white text-[var(--ink-soft)]"
                }`}
              >
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide opacity-70">
                  {msg.role === "user" ? "Tu" : "TravelAI"}
                </span>
                {msg.content}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
