import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServerSupabase } from "@/lib/supabase";
import {
  getUserProfile,
  createPlaylist,
  addTracksToPlaylist,
} from "@/lib/spotify";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const accessToken = session.accessToken;

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("mixtapes")
    .select("*, tracks(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Mixtape not found" }, { status: 404 });
  }

  // Sort: Side A by position, then Side B by position
  const sorted = [...data.tracks].sort((a, b) => {
    if (a.side !== b.side) return a.side === "A" ? -1 : 1;
    return a.position - b.position;
  });

  const profile = await getUserProfile(accessToken);

  const playlist = await createPlaylist(
    accessToken,
    profile.id,
    `A mixtape for ${data.recipient_name}`,
    data.liner_note
      ? `${data.liner_note} — Made with Mixtape`
      : "Made with Mixtape"
  );

  // Add tracks in batches of 100 (Spotify limit)
  const uris = sorted.map((t) => `spotify:track:${t.spotify_id}`);
  for (let i = 0; i < uris.length; i += 100) {
    await addTracksToPlaylist(accessToken, playlist.id, uris.slice(i, i + 100));
  }

  const playlistUrl = playlist.external_urls.spotify;

  await supabase
    .from("mixtapes")
    .update({
      spotify_playlist_url: playlistUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ playlistUrl });
}
