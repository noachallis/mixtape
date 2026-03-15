import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInPage from "@/components/auth/SignInPage";

export default async function Page() {
  const session = await auth();
  if (session?.accessToken) redirect("/dedicate");

  return <SignInPage />;
}
