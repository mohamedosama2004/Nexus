import { getCurrentUser } from "@/src/lib/auth";
import { ClientTopHeader } from "@/src/app/(protected)/dashboard/_components/ClientTopHeader";

export async function TopHeader() {
  const user = await getCurrentUser();

  return <ClientTopHeader user={user} />;
}
