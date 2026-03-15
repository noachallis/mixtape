import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DedicationScreen from "@/components/dedication/DedicationScreen";

export default async function Page() {
  const session = await auth();
  if (!session?.accessToken) redirect("/signin");

  return <DedicationScreen />;
}
