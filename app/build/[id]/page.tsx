import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase";
import MixtapeEditor from "@/components/mixtape/MixtapeEditor";
import { fromSupabase } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const session = await auth();
  if (!session?.accessToken) redirect("/signin");

  const { id } = await params;
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("mixtapes")
    .select("*, tracks(*)")
    .eq("id", id)
    .single();

  if (error || !data) redirect("/dedicate");

  return <MixtapeEditor mixtape={fromSupabase(data)} />;
}
