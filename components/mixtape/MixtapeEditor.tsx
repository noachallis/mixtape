"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import CoverArtSection from "./CoverArtSection";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Mixtape, Track, MixtapeSide } from "@/types";
import { formatDuration, totalDuration } from "@/lib/utils";

// ─── Helpers ────────────────────────────────────────────────────────────────

function reindex(tracks: Track[]): Track[] {
  const a = tracks
    .filter((t) => t.side === "A")
    .map((t, i) => ({ ...t, position: i }));
  const b = tracks
    .filter((t) => t.side === "B")
    .map((t, i) => ({ ...t, position: i }));
  return [...a, ...b];
}

// ─── Source badge ────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<Track["source"], string> = {
  library: "your library",
  discovery: "new find",
  classic: "classic",
};

const SOURCE_COLORS: Record<Track["source"], string> = {
  library: "border-tape-muted text-tape-muted",
  discovery: "border-tape-amber text-tape-amber",
  classic: "border-tape-rust text-tape-rust",
};

// ─── Track card ─────────────────────────────────────────────────────────────

function TrackCard({
  track,
  index,
  onFlip,
  onNoteChange,
}: {
  track: Track;
  index: number;
  onFlip: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(!!track.note);
  const [note, setNote] = useState(track.note ?? "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleNoteBlur() {
    onNoteChange(track.id, note);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex gap-3 p-3 rounded-lg border border-tape-brown bg-tape-charcoal
        transition-opacity duration-150
        ${isDragging ? "opacity-40 border-tape-amber" : ""}
      `}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="flex-none text-tape-brown hover:text-tape-muted cursor-grab active:cursor-grabbing pt-1 touch-none"
      >
        <DragIcon />
      </button>

      {/* Album art */}
      <div className="flex-none w-10 h-10 rounded overflow-hidden bg-tape-brown mt-0.5">
        {track.albumArt ? (
          <Image
            src={track.albumArt}
            alt={track.title}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-tape-muted text-xs font-mono">
            ♫
          </div>
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-tape-cream text-sm leading-snug truncate">
              <span className="font-mono text-tape-muted mr-1.5 text-xs">
                {index + 1}.
              </span>
              {track.title}
            </p>
            <p className="font-body text-tape-muted text-xs truncate mt-0.5">
              {track.artist}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-none">
            <span
              className={`hidden sm:inline text-[10px] border rounded-full px-2 py-0.5 font-mono tracking-wide ${SOURCE_COLORS[track.source]}`}
            >
              {SOURCE_LABELS[track.source]}
            </span>
            <span className="font-mono text-tape-muted text-[11px]">
              {formatDuration(track.durationMs)}
            </span>
          </div>
        </div>

        {track.reason && (
          <p className="font-hand text-tape-faded text-sm mt-1 leading-snug">
            &ldquo;{track.reason}&rdquo;
          </p>
        )}

        {/* Note row */}
        <div className="mt-2">
          {noteOpen ? (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleNoteBlur}
              placeholder="Add a personal note for this track…"
              rows={2}
              className="
                w-full bg-transparent border-b border-tape-brown focus:border-tape-amber
                outline-none resize-none font-body italic text-tape-warm text-xs
                placeholder:text-tape-brown transition-colors duration-200
              "
            />
          ) : (
            <button
              onClick={() => setNoteOpen(true)}
              className="text-tape-muted hover:text-tape-faded text-xs font-body transition-colors duration-150"
            >
              + add a note
            </button>
          )}
        </div>
      </div>

      {/* Flip side button */}
      <button
        onClick={() => onFlip(track.id)}
        title={`Move to Side ${track.side === "A" ? "B" : "A"}`}
        className="flex-none text-tape-muted hover:text-tape-amber text-[11px] font-mono transition-colors duration-150 pt-1"
      >
        →{track.side === "A" ? "B" : "A"}
      </button>
    </div>
  );
}

// ─── Side section ────────────────────────────────────────────────────────────

function SideSection({
  side,
  tracks,
  onDragEnd,
  onFlip,
  onNoteChange,
}: {
  side: MixtapeSide;
  tracks: Track[];
  onDragEnd: (e: DragEndEvent) => void;
  onFlip: (id: string) => void;
  onNoteChange: (id: string, note: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  return (
    <section>
      {/* Side header */}
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-2xl text-tape-cream">
          Side <em>{side}</em>
        </h2>
        <span className="font-mono text-tape-muted text-xs">
          {totalDuration(tracks)}
        </span>
      </div>

      {tracks.length === 0 ? (
        <p className="font-body italic text-tape-muted text-sm py-4 text-center border border-dashed border-tape-brown rounded-lg">
          Drag tracks here, or flip them from Side {side === "A" ? "B" : "A"}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={tracks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tracks.map((track, i) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  index={i}
                  onFlip={onFlip}
                  onNoteChange={onNoteChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

// ─── Main editor ─────────────────────────────────────────────────────────────

export default function MixtapeEditor({ mixtape }: { mixtape: Mixtape }) {
  const [tracks, setTracks] = useState<Track[]>(mixtape.tracks);
  const [linerNote, setLinerNote] = useState(mixtape.linerNote ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState(
    mixtape.spotifyPlaylistUrl ?? ""
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sideA = tracks.filter((t) => t.side === "A");
  const sideB = tracks.filter((t) => t.side === "B");

  // ── Debounced track save ─────────────────────────────────────────────────

  const scheduleSave = useCallback(
    (updated: Track[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveState("saving");
      saveTimer.current = setTimeout(async () => {
        await fetch(`/api/mixtapes/${mixtape.id}/tracks`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tracks: updated.map((t) => ({
              id: t.id,
              side: t.side,
              position: t.position,
              note: t.note,
            })),
          }),
        });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      }, 800);
    },
    [mixtape.id]
  );

  // ── Reorder within a side ────────────────────────────────────────────────

  function handleDragEnd(e: DragEndEvent, side: MixtapeSide) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const sideTracks = side === "A" ? sideA : sideB;
    const oldIdx = sideTracks.findIndex((t) => t.id === active.id);
    const newIdx = sideTracks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(sideTracks, oldIdx, newIdx);
    const other = tracks.filter((t) => t.side !== side);
    const updated = reindex([
      ...other,
      ...reordered.map((t, i) => ({ ...t, position: i })),
    ]);
    setTracks(updated);
    scheduleSave(updated);
  }

  // ── Flip side ────────────────────────────────────────────────────────────

  function flipSide(trackId: string) {
    const updated = tracks.map((t) => {
      if (t.id !== trackId) return t;
      const newSide: MixtapeSide = t.side === "A" ? "B" : "A";
      const newSideLen = tracks.filter((x) => x.side === newSide).length;
      return { ...t, side: newSide, position: newSideLen };
    });
    const reindexed = reindex(updated);
    setTracks(reindexed);
    scheduleSave(reindexed);
  }

  // ── Per-track note ───────────────────────────────────────────────────────

  function updateNote(trackId: string, note: string) {
    const updated = tracks.map((t) =>
      t.id === trackId ? { ...t, note } : t
    );
    setTracks(updated);
    scheduleSave(updated);
  }

  // ── Liner note save ──────────────────────────────────────────────────────

  async function saveLinerNote() {
    await fetch(`/api/mixtapes/${mixtape.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linerNote }),
    });
  }

  // ── Spotify export ───────────────────────────────────────────────────────

  async function exportToSpotify() {
    if (playlistUrl) {
      window.open(playlistUrl, "_blank");
      return;
    }
    setExporting(true);
    try {
      const res = await fetch(`/api/mixtapes/${mixtape.id}/export`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) setPlaylistUrl(data.playlistUrl);
    } finally {
      setExporting(false);
    }
  }

  // ── Copy share link ──────────────────────────────────────────────────────

  async function copyShareLink() {
    const url = `${window.location.origin}/share/${mixtape.shareSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-tape-charcoal border-b border-tape-brown px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <a
          href="/dedicate"
          className="font-hand text-tape-muted hover:text-tape-amber text-sm transition-colors duration-150 flex-none"
        >
          ← new tape
        </a>
        <h1 className="font-display text-tape-cream text-base sm:text-lg text-center truncate">
          A mixtape for{" "}
          <em>{mixtape.recipientName}</em>
        </h1>
        <span className="font-mono text-xs flex-none w-16 text-right">
          {saveState === "saving" && (
            <span className="text-tape-muted">saving…</span>
          )}
          {saveState === "saved" && (
            <span className="text-tape-amber">saved ✓</span>
          )}
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12">
        <SideSection
          side="A"
          tracks={sideA}
          onDragEnd={(e) => handleDragEnd(e, "A")}
          onFlip={flipSide}
          onNoteChange={updateNote}
        />

        {/* Tape divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-tape-brown" />
          <span className="font-mono text-tape-muted text-xs tracking-widest">
            FLIP
          </span>
          <div className="flex-1 border-t border-tape-brown" />
        </div>

        <SideSection
          side="B"
          tracks={sideB}
          onDragEnd={(e) => handleDragEnd(e, "B")}
          onFlip={flipSide}
          onNoteChange={updateNote}
        />

        {/* Liner note */}
        <section>
          <h2 className="font-display text-xl text-tape-cream mb-4">
            Liner note
          </h2>
          <textarea
            value={linerNote}
            onChange={(e) => setLinerNote(e.target.value)}
            onBlur={saveLinerNote}
            placeholder={`Write something for ${mixtape.recipientName}…`}
            rows={5}
            maxLength={1000}
            className="
              w-full bg-transparent border border-tape-brown rounded-lg
              focus:border-tape-amber outline-none resize-none
              font-body italic text-tape-cream text-base leading-relaxed
              placeholder:text-tape-brown placeholder:not-italic
              p-4 transition-colors duration-200
            "
          />
          <p className="font-mono text-tape-muted text-xs text-right mt-1">
            {linerNote.length} / 1000
          </p>
        </section>

        {/* Cover art */}
        <CoverArtSection
          mixtapeId={mixtape.id}
          initialImageUrl={mixtape.coverImageUrl}
          initialPrompt={mixtape.coverPrompt}
          emotionalBrief={mixtape.emotionalBrief}
          recipientName={mixtape.recipientName}
        />

        {/* Actions */}
        <section className="flex flex-col sm:flex-row gap-3 pb-16">
          <button
            onClick={copyShareLink}
            className="flex-1 flex items-center justify-center gap-2 border border-tape-amber text-tape-amber hover:bg-tape-amber hover:text-tape-charcoal font-display text-base px-6 py-3.5 rounded-full transition-colors duration-200"
          >
            {copied ? "Link copied ✓" : "Copy share link"}
          </button>
          <button
            onClick={exportToSpotify}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1aa34a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-display text-base px-6 py-3.5 rounded-full transition-colors duration-200"
          >
            {exporting
              ? "Saving…"
              : playlistUrl
              ? "Open in Spotify ↗"
              : "Save to Spotify"}
          </button>
        </section>
      </main>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function DragIcon() {
  return (
    <svg
      width="14"
      height="18"
      viewBox="0 0 14 18"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="4" cy="3" r="1.5" />
      <circle cx="10" cy="3" r="1.5" />
      <circle cx="4" cy="9" r="1.5" />
      <circle cx="10" cy="9" r="1.5" />
      <circle cx="4" cy="15" r="1.5" />
      <circle cx="10" cy="15" r="1.5" />
    </svg>
  );
}
