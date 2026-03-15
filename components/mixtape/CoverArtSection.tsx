"use client";

import { useState } from "react";
import Image from "next/image";
import CassetteTape from "@/components/ui/CassetteTape";

interface Props {
  mixtapeId: string;
  initialImageUrl?: string;
  initialPrompt?: string;
  emotionalBrief: string;
  recipientName: string;
}

export default function CoverArtSection({
  mixtapeId,
  initialImageUrl,
  initialPrompt,
  emotionalBrief,
  recipientName,
}: Props) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl ?? "");
  const [prompt, setPrompt] = useState(
    initialPrompt ?? emotionalBrief
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mixtapes/${mixtapeId}/cover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setImageUrl(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2 className="font-display text-xl text-tape-cream mb-4">Cover art</h2>

      {loading ? (
        /* Loading state */
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-40">
            <CassetteTape spinning label={recipientName} sublabel="generating" />
          </div>
          <p className="font-hand text-tape-amber text-lg">
            Developing your photo…
          </p>
          <p className="font-body text-tape-muted text-xs">Takes about 10 seconds</p>
        </div>
      ) : imageUrl ? (
        /* Generated image — Polaroid frame */
        <div className="mb-5 flex justify-start">
          <div
            className="bg-tape-warm p-3 pb-10 shadow-2xl"
            style={{ transform: "rotate(-1.5deg)", maxWidth: 260 }}
          >
            <Image
              src={imageUrl}
              alt="Mixtape cover art"
              width={234}
              height={234}
              className="w-full aspect-square object-cover"
            />
            <p
              className="font-hand text-tape-brown text-center mt-2 text-sm"
              style={{ transform: "rotate(0.5deg)" }}
            >
              for {recipientName}
            </p>
          </div>
        </div>
      ) : (
        /* Placeholder */
        <div className="mb-5 flex justify-start">
          <div
            className="bg-tape-brown p-3 pb-10 border border-dashed border-tape-muted"
            style={{ transform: "rotate(-1.5deg)", width: 260 }}
          >
            <div className="w-full aspect-square bg-tape-charcoal flex items-center justify-center">
              <p className="font-hand text-tape-muted text-sm text-center px-4">
                your cover art will appear here
              </p>
            </div>
            <p className="font-hand text-tape-muted text-center mt-2 text-sm">
              for {recipientName}
            </p>
          </div>
        </div>
      )}

      {/* Prompt input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the feeling or scene you want on the cover…"
        rows={3}
        disabled={loading}
        className="
          w-full bg-transparent border border-tape-brown rounded-lg
          focus:border-tape-amber outline-none resize-none
          font-body italic text-tape-cream text-sm leading-relaxed
          placeholder:text-tape-brown placeholder:not-italic
          p-3 transition-colors duration-200 mb-3
          disabled:opacity-50
        "
      />

      {error && (
        <p className="font-body text-tape-rust text-sm mb-3">{error}</p>
      )}

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="
          inline-flex items-center gap-2
          border border-tape-amber text-tape-amber
          hover:bg-tape-amber hover:text-tape-charcoal
          disabled:border-tape-brown disabled:text-tape-muted disabled:cursor-not-allowed
          font-display text-sm px-5 py-2.5 rounded-full transition-colors duration-200
        "
      >
        {imageUrl ? "Regenerate" : "Generate cover"}
      </button>

      {!imageUrl && (
        <p className="font-body text-tape-muted text-xs mt-2">
          AI-generated in a Polaroid/analog style using your description.
        </p>
      )}
    </section>
  );
}
