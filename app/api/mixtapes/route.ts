import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { anthropic } from "@/lib/anthropic";
import {
  getUserTopTracks,
  getSavedTracks,
  getUserProfile,
  searchTracks,
} from "@/lib/spotify";
import { createServerSupabase } from "@/lib/supabase";
import { generateShareSlug } from "@/lib/utils";
import { SpotifyTrack } from "@/types";

type LibrarySuggestion = {
  spotifyId: string;
  title: string;
  artist: string;
  reason: string;
};

type SearchSuggestion = {
  searchQuery: string;
  title: string;
  artist: string;
  reason: string;
};

type Suggestions = {
  library: LibrarySuggestion[];
  discovery: SearchSuggestion[];
  classics: SearchSuggestion[];
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { recipientName, emotionalBrief } = body as {
    recipientName: string;
    emotionalBrief: string;
  };

  if (!recipientName?.trim() || !emotionalBrief?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const accessToken = session.accessToken;

  // Fetch listening history in parallel
  const [topTracks, savedTracks, profile] = await Promise.all([
    getUserTopTracks(accessToken, 50, "medium_term"),
    getSavedTracks(accessToken, 50),
    getUserProfile(accessToken),
  ]);

  // Deduplicate
  const seenIds = new Set<string>();
  const libraryTracks: SpotifyTrack[] = [];
  for (const track of [...topTracks, ...savedTracks]) {
    if (!seenIds.has(track.id)) {
      seenIds.add(track.id);
      libraryTracks.push(track);
    }
  }

  // Format track list for Claude
  const trackList = libraryTracks
    .slice(0, 80)
    .map(
      (t) =>
        `[${t.id}] "${t.name}" by ${t.artists.map((a) => a.name).join(", ")}`
    )
    .join("\n");

  // Get suggestions from Claude via tool use
  const aiResponse = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system:
      "You are a deeply empathetic music curator. Your gift is finding the exact songs that capture a feeling — not just matching genres, but finding the emotional truth in music. You write about songs with warmth and specificity, never in music-critic jargon.",
    tools: [
      {
        name: "suggest_mixtape",
        description:
          "Suggest a personalised mixtape based on a person's music taste and an emotional brief.",
        input_schema: {
          type: "object" as const,
          properties: {
            library: {
              type: "array",
              description:
                "5–6 tracks selected from the listener's existing Spotify library that fit the brief",
              items: {
                type: "object",
                properties: {
                  spotifyId: {
                    type: "string",
                    description: "The Spotify track ID from the provided list",
                  },
                  title: { type: "string" },
                  artist: { type: "string" },
                  reason: {
                    type: "string",
                    description:
                      "A warm, personal one-line reason this track fits — specific to the brief, not generic",
                  },
                },
                required: ["spotifyId", "title", "artist", "reason"],
              },
            },
            discovery: {
              type: "array",
              description:
                "4–5 tracks the person probably doesn't know yet, but will love given their taste and this brief",
              items: {
                type: "object",
                properties: {
                  searchQuery: {
                    type: "string",
                    description:
                      'Spotify search query, e.g. "track:Lua artist:Bright Eyes"',
                  },
                  title: { type: "string" },
                  artist: { type: "string" },
                  reason: {
                    type: "string",
                    description: "A warm, personal one-line reason this fits",
                  },
                },
                required: ["searchQuery", "title", "artist", "reason"],
              },
            },
            classics: {
              type: "array",
              description:
                "3–4 timeless or classic tracks that fit the emotional mood",
              items: {
                type: "object",
                properties: {
                  searchQuery: {
                    type: "string",
                    description:
                      'Spotify search query, e.g. "track:The Night Will Always Win artist:Manchester Orchestra"',
                  },
                  title: { type: "string" },
                  artist: { type: "string" },
                  reason: {
                    type: "string",
                    description: "A warm, personal one-line reason this fits",
                  },
                },
                required: ["searchQuery", "title", "artist", "reason"],
              },
            },
          },
          required: ["library", "discovery", "classics"],
        },
      },
    ],
    tool_choice: { type: "tool" as const, name: "suggest_mixtape" },
    messages: [
      {
        role: "user",
        content: `I want to make a mixtape for someone special.

Recipient: ${recipientName}
What I want to capture: ${emotionalBrief}

Here are tracks from my Spotify listening history (format: [spotifyId] "title" by artist):
${trackList}

Please suggest a perfect mixtape. For library tracks, choose from the list above using their exact spotifyId. For discovery and classics, suggest tracks I should search for on Spotify.`,
      },
    ],
  });

  const toolUse = aiResponse.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return NextResponse.json({ error: "AI suggestion failed" }, { status: 500 });
  }

  const suggestions = toolUse.input as Suggestions;

  // Search Spotify for discovery + classics in parallel
  const discoverySearches = suggestions.discovery.map((s) =>
    searchTracks(accessToken, s.searchQuery, 1).then((r) => ({
      ...s,
      track: r[0] ?? null,
    }))
  );
  const classicsSearches = suggestions.classics.map((s) =>
    searchTracks(accessToken, s.searchQuery, 1).then((r) => ({
      ...s,
      track: r[0] ?? null,
    }))
  );

  const [discoveryResults, classicsResults] = await Promise.all([
    Promise.allSettled(discoverySearches),
    Promise.allSettled(classicsSearches),
  ]);

  // Build track insert list
  const libraryMap = new Map(libraryTracks.map((t) => [t.id, t]));

  type TrackInsert = {
    spotify_id: string;
    title: string;
    artist: string;
    album_art: string | null;
    preview_url: string | null;
    duration_ms: number;
    reason: string;
    side: "A" | "B";
    position: number;
    source: "library" | "discovery" | "classic";
  };

  const tracks: TrackInsert[] = [];

  // Side A: library tracks
  for (const s of suggestions.library) {
    const t = libraryMap.get(s.spotifyId);
    if (!t) continue;
    tracks.push({
      spotify_id: t.id,
      title: s.title,
      artist: s.artist,
      album_art: t.album.images[0]?.url ?? null,
      preview_url: t.preview_url,
      duration_ms: t.duration_ms,
      reason: s.reason,
      side: "A",
      position: tracks.length,
      source: "library",
    });
  }

  // Side B: discoveries
  for (const result of discoveryResults) {
    if (result.status !== "fulfilled" || !result.value.track) continue;
    const { track, reason } = result.value;
    tracks.push({
      spotify_id: track.id,
      title: track.name,
      artist: track.artists.map((a: { name: string }) => a.name).join(", "),
      album_art: track.album.images[0]?.url ?? null,
      preview_url: track.preview_url,
      duration_ms: track.duration_ms,
      reason,
      side: "B",
      position: tracks.length,
      source: "discovery",
    });
  }

  // Side B: classics
  for (const result of classicsResults) {
    if (result.status !== "fulfilled" || !result.value.track) continue;
    const { track, reason } = result.value;
    tracks.push({
      spotify_id: track.id,
      title: track.name,
      artist: track.artists.map((a: { name: string }) => a.name).join(", "),
      album_art: track.album.images[0]?.url ?? null,
      preview_url: track.preview_url,
      duration_ms: track.duration_ms,
      reason,
      side: "B",
      position: tracks.length,
      source: "classic",
    });
  }

  // Save to Supabase
  const supabase = createServerSupabase();

  const { data: mixtape, error: mixtapeError } = await supabase
    .from("mixtapes")
    .insert({
      user_id: profile.id,
      recipient_name: recipientName.trim(),
      emotional_brief: emotionalBrief.trim(),
      share_slug: generateShareSlug(),
    })
    .select("id")
    .single();

  if (mixtapeError || !mixtape) {
    console.error("Supabase mixtape error:", mixtapeError);
    return NextResponse.json(
      { error: "Failed to save mixtape" },
      { status: 500 }
    );
  }

  const { error: tracksError } = await supabase
    .from("tracks")
    .insert(tracks.map((t) => ({ ...t, mixtape_id: mixtape.id })));

  if (tracksError) {
    console.error("Supabase tracks error:", tracksError);
    await supabase.from("mixtapes").delete().eq("id", mixtape.id);
    return NextResponse.json(
      { error: "Failed to save tracks" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: mixtape.id });
}
