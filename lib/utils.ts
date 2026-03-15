import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Mixtape, Track, MixtapeSide } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function generateShareSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function totalDuration(tracks: { durationMs: number }[]): string {
  const ms = tracks.reduce((sum, t) => sum + t.durationMs, 0);
  const minutes = Math.floor(ms / 60000);
  return `${minutes} min`;
}

// Maps raw Supabase snake_case rows to the camelCase Mixtape type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromSupabase(data: Record<string, any>): Mixtape {
  return {
    id: data.id,
    userId: data.user_id,
    recipientName: data.recipient_name,
    emotionalBrief: data.emotional_brief,
    linerNote: data.liner_note ?? undefined,
    coverImageUrl: data.cover_image_url ?? undefined,
    coverPrompt: data.cover_prompt ?? undefined,
    spotifyPlaylistUrl: data.spotify_playlist_url ?? undefined,
    shareSlug: data.share_slug,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    tracks: (data.tracks ?? [])
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t: Record<string, any>): Track => ({
          id: t.id,
          spotifyId: t.spotify_id,
          title: t.title,
          artist: t.artist,
          albumArt: t.album_art ?? undefined,
          previewUrl: t.preview_url ?? undefined,
          durationMs: t.duration_ms,
          reason: t.reason ?? undefined,
          note: t.note ?? undefined,
          side: t.side as MixtapeSide,
          position: t.position,
          source: t.source,
        })
      )
      .sort((a: Track, b: Track) => a.position - b.position),
  };
}
