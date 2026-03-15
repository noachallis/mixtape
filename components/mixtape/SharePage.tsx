"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Mixtape, Track } from "@/types";
import { formatDuration } from "@/lib/utils";

// ─── Audio preview hook ───────────────────────────────────────────────────────

function useAudioPlayer() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((trackId: string, url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playingId === trackId) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(url);
    audio.volume = 0.85;
    audio.play();
    audio.onended = () => setPlayingId(null);
    audioRef.current = audio;
    setPlayingId(trackId);
  }, [playingId]);

  return { playingId, play };
}

// ─── Track row ────────────────────────────────────────────────────────────────

function TrackRow({
  track,
  index,
  isPlaying,
  onPlay,
}: {
  track: Track;
  index: number;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-tape-brown last:border-0">
      {/* Album art + play button */}
      <div className="relative flex-none w-10 h-10 rounded overflow-hidden bg-tape-brown mt-0.5">
        {track.albumArt && (
          <Image
            src={track.albumArt}
            alt={track.title}
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        )}
        {track.previewUrl && (
          <button
            onClick={onPlay}
            aria-label={isPlaying ? "Pause" : "Play preview"}
            className="absolute inset-0 flex items-center justify-center bg-tape-charcoal/70 opacity-0 hover:opacity-100 transition-opacity duration-150"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-tape-cream text-sm leading-snug">
            <span className="font-mono text-tape-muted text-xs mr-1.5">
              {index + 1}.
            </span>
            {track.title}
          </p>
          <span className="font-mono text-tape-muted text-[11px] flex-none mt-0.5">
            {formatDuration(track.durationMs)}
          </span>
        </div>
        <p className="font-body text-tape-muted text-xs mt-0.5">{track.artist}</p>

        {track.reason && (
          <p className="font-hand text-tape-faded text-sm mt-1 leading-snug">
            &ldquo;{track.reason}&rdquo;
          </p>
        )}

        {track.note && (
          <p className="font-body italic text-tape-warm text-xs mt-1.5 border-l-2 border-tape-amber pl-2">
            {track.note}
          </p>
        )}

        {/* Playing indicator */}
        {isPlaying && (
          <div className="flex items-center gap-1 mt-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block w-0.5 bg-tape-amber rounded-full"
                style={{
                  height: 12,
                  animation: `equalizer 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
                }}
              />
            ))}
            <span className="font-mono text-tape-amber text-[10px] ml-1">
              playing
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Side section ─────────────────────────────────────────────────────────────

function SideSection({
  side,
  tracks,
  playingId,
  onPlay,
}: {
  side: "A" | "B";
  tracks: Track[];
  playingId: string | null;
  onPlay: (id: string, url: string) => void;
}) {
  if (tracks.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="font-display text-lg text-tape-cream">
          Side <em>{side}</em>
        </h2>
        <div className="flex-1 border-t border-tape-brown" />
      </div>
      <div>
        {tracks.map((track, i) => (
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            isPlaying={playingId === track.id}
            onPlay={() => track.previewUrl && onPlay(track.id, track.previewUrl)}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Main share page ──────────────────────────────────────────────────────────

export default function SharePage({ mixtape }: { mixtape: Mixtape }) {
  const { playingId, play } = useAudioPlayer();

  const sideA = mixtape.tracks.filter((t) => t.side === "A");
  const sideB = mixtape.tracks.filter((t) => t.side === "B");
  const hasPreview = mixtape.tracks.some((t) => t.previewUrl);

  return (
    <main className="min-h-dvh">
      {/* Hero */}
      <div className="px-4 sm:px-6 pt-12 pb-8 max-w-xl mx-auto">
        {/* Cover art (Polaroid) or cassette */}
        <div className="flex justify-center mb-10 animate-wow-in">
          {mixtape.coverImageUrl ? (
            <div
              className="bg-tape-warm p-3 pb-12 shadow-2xl"
              style={{ transform: "rotate(-1.5deg)", maxWidth: 280 }}
            >
              <Image
                src={mixtape.coverImageUrl}
                alt="Cover art"
                width={254}
                height={254}
                className="w-full aspect-square object-cover"
              />
              <p
                className="font-hand text-tape-brown text-center mt-2 text-base"
                style={{ transform: "rotate(0.5deg)" }}
              >
                for {mixtape.recipientName}
              </p>
            </div>
          ) : (
            <div className="w-56">
              <div
                className="opacity-80"
                style={{ transform: "rotate(-1deg)" }}
              >
                <div
                  style={{
                    background: "#3d2b1f",
                    padding: "12px",
                    paddingBottom: "48px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Cassette inside polaroid */}
                  <div
                    style={{
                      background: "#1c1410",
                      aspectRatio: "1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg viewBox="0 0 120 80" width="100%" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="118" height="78" rx="4" fill="#3d2b1f" stroke="#c9932a" strokeWidth="0.75"/>
                      <rect x="22" y="10" width="76" height="42" rx="2" fill="#1c1410"/>
                      <circle cx="44" cy="31" r="14" fill="#241a13" stroke="#8a7a68" strokeWidth="0.5"/>
                      <circle cx="44" cy="31" r="6" fill="#1c1410" stroke="#5a4a38" strokeWidth="0.5"/>
                      <circle cx="76" cy="31" r="14" fill="#241a13" stroke="#8a7a68" strokeWidth="0.5"/>
                      <circle cx="76" cy="31" r="6" fill="#1c1410" stroke="#5a4a38" strokeWidth="0.5"/>
                      <rect x="28" y="59" width="64" height="13" rx="1.5" fill="#c9932a"/>
                      <text x="60" y="68" textAnchor="middle" fill="#1c1410" fontFamily="'Playfair Display', serif" fontSize="5" fontWeight="700" letterSpacing="2">MIXTAPE</text>
                    </svg>
                  </div>
                  <p className="font-hand text-tape-brown text-center mt-2 text-xs" style={{ transform: "rotate(0.5deg)" }}>
                    for {mixtape.recipientName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Heading */}
        <div
          className="text-center mb-8 animate-wow-in"
          style={{ animationDelay: "100ms" }}
        >
          <p className="font-hand text-tape-amber text-lg mb-1">
            a mixtape for
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-tape-cream">
            {mixtape.recipientName}
          </h1>
        </div>

        {/* Liner note */}
        {mixtape.linerNote && (
          <div
            className="text-center mb-10 animate-wow-in"
            style={{ animationDelay: "180ms" }}
          >
            <blockquote className="font-hand text-tape-warm text-xl sm:text-2xl leading-relaxed max-w-sm mx-auto">
              &ldquo;{mixtape.linerNote}&rdquo;
            </blockquote>
          </div>
        )}

        {/* Spotify link */}
        {mixtape.spotifyPlaylistUrl && (
          <div
            className="flex justify-center mb-8 animate-wow-in"
            style={{ animationDelay: "240ms" }}
          >
            <a
              href={mixtape.spotifyPlaylistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1aa34a] text-white font-display text-sm px-5 py-2.5 rounded-full transition-colors duration-200"
            >
              <SpotifyIcon />
              Listen on Spotify
            </a>
          </div>
        )}

        {/* Preview note */}
        {hasPreview && !mixtape.spotifyPlaylistUrl && (
          <p
            className="font-body text-tape-muted text-xs text-center mb-8 animate-wow-in"
            style={{ animationDelay: "240ms" }}
          >
            Hover over album art to preview 30 seconds of each track
          </p>
        )}
      </div>

      {/* Tracklist */}
      <div
        className="max-w-xl mx-auto px-4 sm:px-6 pb-16 space-y-8 animate-wow-in"
        style={{ animationDelay: "300ms" }}
      >
        <SideSection
          side="A"
          tracks={sideA}
          playingId={playingId}
          onPlay={play}
        />
        {sideB.length > 0 && sideA.length > 0 && (
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 border-t border-tape-brown" />
            <span className="font-mono text-tape-muted text-xs tracking-widest">FLIP</span>
            <div className="flex-1 border-t border-tape-brown" />
          </div>
        )}
        <SideSection
          side="B"
          tracks={sideB}
          playingId={playingId}
          onPlay={play}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-tape-brown px-6 py-6 text-center">
        <p className="font-body text-tape-muted text-xs">
          Made with{" "}
          <a href="/" className="text-tape-amber hover:underline">
            Mixtape
          </a>
        </p>
      </footer>

      {/* Equalizer bar animation */}
      <style>{`
        @keyframes equalizer {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </main>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
