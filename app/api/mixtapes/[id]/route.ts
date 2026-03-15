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

  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if ("linerNote" in body) updates.liner_note = body.linerNote;
  if ("coverImageUrl" in body) updates.cover_image_url = body.coverImageUrl;
  if ("coverPrompt" in body) updates.cover_prompt = body.coverPrompt;

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("mixtapes")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Supabase update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
