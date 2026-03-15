import { createServerSupabase } from "@/lib/supabase";
import SharePage from "@/components/mixtape/SharePage";
import { fromSupabase } from "@/lib/utils";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("mixtapes")
    .select("recipient_name, liner_note")
    .eq("share_slug", id)
    .single();

  if (!data) return { title: "Mixtape" };

  return {
    title: `A mixtape for ${data.recipient_name}`,
    description: data.liner_note ?? "Someone made you a mixtape.",
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("mixtapes")
    .select("*, tracks(*)")
    .eq("share_slug", id)
    .single();

  if (!data) notFound();

  return <SharePage mixtape={fromSupabase(data)} />;
}
