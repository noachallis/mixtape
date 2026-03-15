import Link from "next/link";
import CassetteTape from "@/components/ui/CassetteTape";

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <p
          className="animate-wow-in font-hand text-tape-amber text-xl tracking-widest mb-10"
          style={{ animationDelay: "0ms" }}
        >
          ✦ mixtape ✦
        </p>

        <div
          className="animate-wow-in w-64 sm:w-80 mb-10"
          style={{ animationDelay: "80ms" }}
        >
          <CassetteTape />
        </div>

        <h1
          className="animate-wow-in font-display text-4xl sm:text-5xl md:text-6xl text-tape-cream leading-tight mb-5"
          style={{ animationDelay: "160ms" }}
        >
          Make something
          <br />
          <em>they&apos;ll never forget.</em>
        </h1>

        <p
          className="animate-wow-in font-body text-tape-warm text-lg md:text-xl max-w-sm leading-relaxed mb-10"
          style={{ animationDelay: "240ms" }}
        >
          A personalised Spotify playlist, shaped by AI — warm, handpicked,
          and felt like a real mixtape.
        </p>

        <Link
          href="/signin"
          className="animate-wow-in inline-flex items-center gap-2 bg-tape-amber hover:bg-tape-rust text-tape-charcoal font-display text-lg px-8 py-4 rounded-full transition-colors duration-300"
          style={{ animationDelay: "320ms" }}
        >
          Make a mixtape
          <span aria-hidden>→</span>
        </Link>

        <p
          className="animate-wow-in font-body text-tape-muted text-sm mt-4"
          style={{ animationDelay: "400ms" }}
        >
          Signs in with your Spotify account
        </p>
      </section>

      {/* How it works */}
      <section className="border-t border-tape-brown px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <p className="font-hand text-tape-amber text-center text-2xl mb-12">
            how it works
          </p>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              {
                n: "01",
                title: "Tell us who it's for",
                body: 'A name and a feeling. \u201cSunday mornings with Mum\u201d is enough to begin.',
              },
              {
                n: "02",
                title: "Pick your songs",
                body: "AI suggests tracks from your library, new finds, and timeless classics. You choose.",
              },
              {
                n: "03",
                title: "Send it",
                body: "Cover art. A liner note. A link they can keep forever, and a playlist saved to Spotify.",
              },
            ].map(({ n, title, body }) => (
              <div key={n} className="text-center">
                <p className="font-mono text-tape-rust text-sm mb-3">{n}</p>
                <h3 className="font-display text-tape-cream text-lg mb-2">
                  {title}
                </h3>
                <p className="font-body text-tape-muted text-sm leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-tape-brown px-6 py-6 text-center">
        <p className="font-body text-tape-muted text-xs">
          Made with care &middot; Uses your Spotify data only to make your mix
        </p>
      </footer>
    </main>
  );
}
