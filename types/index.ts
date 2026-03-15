export type MixtapeSide = "A" | "B";

export interface Track {
  id: string;
  spotifyId: string;
  title: string;
  artist: string;
  albumArt?: string;
  previewUrl?: string;
  durationMs: number;
  reason?: string;
  note?: string;
  side: MixtapeSide;
  position: number;
  source: "library" | "discovery" | "classic";
}

export interface Mixtape {
  id: string;
  userId: string;
  recipientName: string;
  emotionalBrief: string;
  linerNote?: string;
  coverImageUrl?: string;
  coverPrompt?: string;
  tracks: Track[];
  shareSlug: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuggestedTrack {
  spotifyId: string;
  title: string;
  artist: string;
  albumArt?: string;
  previewUrl?: string;
  durationMs: number;
  reason: string;
  source: "library" | "discovery" | "classic";
}

export interface SuggestionsResponse {
  library: SuggestedTrack[];
  discovery: SuggestedTrack[];
  classics: SuggestedTrack[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  preview_url: string | null;
  duration_ms: number;
}
