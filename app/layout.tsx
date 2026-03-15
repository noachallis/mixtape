import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Mixtape — Make something they'll never forget",
  description:
    "A soulful, AI-powered mix tape maker. Create a personalised Spotify playlist as a heartfelt gift.",
  openGraph: {
    title: "Mixtape",
    description: "Make something they'll never forget.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
