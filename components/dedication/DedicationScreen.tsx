"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CassetteTape from "@/components/ui/CassetteTape";

const LOADING_MESSAGES = [
  "Listening through your music\u2026",
  "Finding songs that fit the feeling\u2026",
  "Writing the setlist\u2026",
  "Almost there\u2026",
];

const BRIEF_HINTS = [
  "\u201cdancing in the kitchen to Chris Stapleton at 2am\u201d",
  "\u201clong drives home with the windows down\u201d",
  "\u201ceverything we never said out loud\u201d",
  "\u201cthe summer we were 22\u201d",
];

export default function DedicationScreen() {
  const router = useRouter();
  const [recipientName, setRecipientName] = useState("");
  const [emotionalBrief, setEmotionalBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const [hintIdx] = useState(() => Math.floor(Math.random() * BRIEF_HINTS.length));
  const msgIdxRef = useRef(0);

  // Cycle loading messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      msgIdxRef.current = (msgIdxRef.current + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdxRef.current]);
    }, 2800);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientName.trim() || !emotionalBrief.trim()) return;

    setError(null);
    setLoading(true);
    msgIdxRef.current = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);

    try {
      const res = await fetch("/api/mixtapes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName, emotionalBrief }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      router.push(`/build/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="w-56 sm:w-64 mb-8 animate-wow-in">
          <CassetteTape spinning label={recipientName || "MIXTAPE"} />
        </div>
        <p
          key={loadingMsg}
          className="animate-wow-in font-hand text-tape-amber text-2xl sm:text-3xl"
        >
          {loadingMsg}
        </p>
        <p className="font-body text-tape-muted text-sm mt-3">
          This takes about 30 seconds
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12 animate-wow-in">
          <p className="font-hand text-tape-amber text-xl mb-2">mixtape</p>
          <h1 className="font-display text-3xl sm:text-4xl text-tape-cream">
            Who is this for?
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Recipient name */}
          <div
            className="animate-wow-in"
            style={{ animationDelay: "80ms" }}
          >
            <label
              htmlFor="name"
              className="block font-body text-tape-muted text-sm tracking-widest uppercase mb-3"
            >
              To
            </label>
            <input
              id="name"
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="their name"
              maxLength={60}
              autoComplete="off"
              className="
                w-full bg-transparent border-b-2 border-tape-brown
                focus:border-tape-amber outline-none
                font-hand text-tape-cream text-3xl sm:text-4xl
                placeholder:text-tape-brown
                pb-2 transition-colors duration-200
              "
            />
          </div>

          {/* Emotional brief */}
          <div
            className="animate-wow-in"
            style={{ animationDelay: "160ms" }}
          >
            <label
              htmlFor="brief"
              className="block font-body text-tape-muted text-sm tracking-widest uppercase mb-3"
            >
              The feeling
            </label>
            <textarea
              id="brief"
              value={emotionalBrief}
              onChange={(e) => setEmotionalBrief(e.target.value)}
              placeholder={BRIEF_HINTS[hintIdx]}
              maxLength={500}
              rows={4}
              className="
                w-full bg-transparent border-b-2 border-tape-brown
                focus:border-tape-amber outline-none resize-none
                font-body italic text-tape-cream text-lg leading-relaxed
                placeholder:text-tape-brown placeholder:not-italic
                pb-2 transition-colors duration-200
              "
            />
            <p className="font-body text-tape-muted text-xs mt-2 text-right">
              {emotionalBrief.length} / 500
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="font-body text-tape-rust text-sm text-center animate-wow-in">
              {error}
            </p>
          )}

          {/* Submit */}
          <div
            className="animate-wow-in pt-2"
            style={{ animationDelay: "240ms" }}
          >
            <button
              type="submit"
              disabled={!recipientName.trim() || !emotionalBrief.trim()}
              className="
                w-full sm:w-auto
                bg-tape-amber hover:bg-tape-rust
                disabled:bg-tape-brown disabled:text-tape-muted disabled:cursor-not-allowed
                text-tape-charcoal font-display text-lg
                px-10 py-4 rounded-full
                transition-colors duration-300
              "
            >
              Make the tape →
            </button>
          </div>
        </form>

        {/* Soft hint */}
        <p
          className="animate-wow-in font-body text-tape-muted text-sm text-center mt-16 leading-relaxed"
          style={{ animationDelay: "320ms" }}
        >
          We&apos;ll scan your Spotify history and suggest songs in three
          categories —<br />
          songs they know you love, new discoveries, and timeless classics.
        </p>
      </div>
    </main>
  );
}
