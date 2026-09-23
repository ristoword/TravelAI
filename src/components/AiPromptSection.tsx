"use client";

import { useState } from "react";
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
    <section className="animate-fade-up-delay mx-auto max-w-3xl px-5 pb-20 sm:px-10">
      <h2 className="font-display text-3xl text-teal-950 sm:text-4xl">{m.tellWhere}</h2>
      <p className="mt-2 text-sm text-stone-600">
        Assistente AI con tool reali (searchFlights, searchHotels, searchCars…). Senza
        OPENAI_API_KEY non simula risposte.
      </p>
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
          className="flex-1 rounded-md border border-teal-900/20 bg-white/80 px-4 py-3 text-base shadow-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading}
          className="rounded-md bg-teal-900 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white disabled:opacity-60"
        >
          {loading ? "…" : "Invia"}
        </button>
      </div>
      {error && (
        <p className="mt-3 rounded-md border border-amber-700/30 bg-amber-50 px-3 py-2 text-sm text-amber-950" role="alert">
          {error}
        </p>
      )}
      {messages.length > 0 && (
        <ul className="mt-4 space-y-2" aria-live="polite">
          {messages.map((msg, i) => (
            <li
              key={`${msg.role}-${i}`}
              className={`rounded-md px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-teal-900/10 text-teal-950"
                  : "bg-white/80 text-stone-800"
              }`}
            >
              <span className="font-medium">
                {msg.role === "user" ? "Tu" : "TravelAI"}:{" "}
              </span>
              {msg.content}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
