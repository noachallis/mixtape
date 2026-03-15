import { SpotifyTrack } from "@/types";

const SPOTIFY_API = "https://api.spotify.com/v1";

async function spotifyFetch(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${SPOTIFY_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error?.message ?? `Spotify API error: ${res.status}`);
  }

  return res.json();
}

export async function getUserProfile(accessToken: string) {
  return spotifyFetch("/me", accessToken);
}

export async function getUserTopTracks(
  accessToken: string,
  limit = 50,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch(
    `/me/top/tracks?limit=${limit}&time_range=${timeRange}`,
    accessToken
  );
  return data.items;
}

export async function getSavedTracks(
  accessToken: string,
  limit = 50
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch(
    `/me/tracks?limit=${limit}`,
    accessToken
  );
  return data.items.map((item: { track: SpotifyTrack }) => item.track);
}

export async function searchTracks(
  accessToken: string,
  query: string,
  limit = 5
): Promise<SpotifyTrack[]> {
  const encoded = encodeURIComponent(query);
  const data = await spotifyFetch(
    `/search?q=${encoded}&type=track&limit=${limit}`,
    accessToken
  );
  return data.tracks.items;
}

export async function createPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description: string
): Promise<{ id: string; external_urls: { spotify: string } }> {
  return spotifyFetch(`/users/${userId}/playlists`, accessToken, {
    method: "POST",
    body: JSON.stringify({
      name,
      description,
      public: false,
    }),
  });
}

export async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[]
) {
  return spotifyFetch(`/playlists/${playlistId}/tracks`, accessToken, {
    method: "POST",
    body: JSON.stringify({ uris: trackUris }),
  });
}
