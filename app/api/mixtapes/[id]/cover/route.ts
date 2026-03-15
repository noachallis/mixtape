import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Replicate from "replicate";
import { createServerSupabase } from "@/lib/supabase";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: Props) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { prompt } = (await req.json()) as { prompt: string };

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  // Append analog/Polaroid style modifiers
  const styledPrompt = `${prompt.trim()}, polaroid photograph, analog film grain, warm amber tones, slightly overexposed, nostalgic, intimate, soft focus, 35mm film`;

  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt: styledPrompt,
      aspect_ratio: "1:1",
      output_format: "webp",
      output_quality: 90,
      num_inference_steps: 4,
    },
  });

  // Replicate SDK v1 returns FileOutput[] for image models
  const items = Array.isArray(output) ? output : [output];
  const imageUrl = String(items[0]);

  const supabase = createServerSupabase();
  await supabase
    .from("mixtapes")
    .update({
      cover_image_url: imageUrl,
      cover_prompt: prompt.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ imageUrl });
}
