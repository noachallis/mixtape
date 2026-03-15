import { Mixtape } from "@/types";

export default function SharePage({ mixtape }: { mixtape: Mixtape }) {
  return (
    <main className="min-h-dvh flex items-center justify-center">
      <p className="font-hand text-tape-amber text-2xl">
        A mixtape for {mixtape.recipientName}
      </p>
    </main>
  );
}
