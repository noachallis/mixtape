import CassetteTape from "@/components/ui/CassetteTape";
import { signInWithSpotify } from "@/lib/actions";

export default function SignInPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-48 sm:w-56 mb-8 animate-wow-in" style={{ animationDelay: "0ms" }}>
        <CassetteTape spinning />
      </div>

      <p
        className="animate-wow-in font-hand text-tape-amber text-2xl mb-3"
        style={{ animationDelay: "100ms" }}
      >
        mixtape
      </p>

      <h1
        className="animate-wow-in font-display text-3xl sm:text-4xl text-tape-cream leading-tight mb-3"
        style={{ animationDelay: "160ms" }}
      >
        Make something they&apos;ll
        <br />
        never forget.
      </h1>

      <p
        className="animate-wow-in font-body text-tape-warm text-base max-w-xs leading-relaxed mb-10"
        style={{ animationDelay: "220ms" }}
      >
        Sign in with Spotify to start building your mixtape.
      </p>

      <form
        action={signInWithSpotify}
        className="animate-wow-in"
        style={{ animationDelay: "280ms" }}
      >
        <button
          type="submit"
          className="inline-flex items-center gap-3 bg-[#1DB954] hover:bg-[#1aa34a] active:bg-[#158a3e] text-white font-display text-base px-7 py-3.5 rounded-full transition-colors duration-200"
        >
          <SpotifyIcon />
          Continue with Spotify
        </button>
      </form>

      <p
        className="animate-wow-in font-body text-tape-muted text-xs mt-6 max-w-xs leading-relaxed"
        style={{ animationDelay: "340ms" }}
      >
        We&apos;ll read your listening history to suggest songs.
        <br />
        We&apos;ll never post or follow without your say-so.
      </p>
    </main>
  );
}

function SpotifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
