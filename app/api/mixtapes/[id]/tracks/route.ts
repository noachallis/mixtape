import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServerSupabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: mixtapeId } = await params;
  const body = await req.json();
  const tracks = body.tracks as Array<{
    id: string;
    side: "A" | "B";
    position: number;
    note?: string;
  }>;

  if (!Array.isArray(tracks)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createServerSupabase();

  // Bulk update — each track must belong to this mixtape
  const updates = tracks.map((t) =>
    supabase
      .from("tracks")
      .update({ side: t.side, position: t.position, note: t.note ?? null })
      .eq("id", t.id)
      .eq("mixtape_id", mixtapeId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  if (failed?.error) {
    console.error("Track update error:", failed.error);
    return NextResponse.json(
      { error: "Failed to update tracks" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
