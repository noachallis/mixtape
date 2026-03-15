import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/layout/LandingPage";

export default async function Home() {
  const session = await auth();

  // Signed-in users go straight to the dedication screen
  if (session?.accessToken) {
    redirect("/dedicate");
  }

  return <LandingPage />;
}
