import { getCurrentUser } from "@/src/lib/auth";
import { ClientTopHeader } from "@/src/components/ClientTopHeader";

export async function TopHeader() {
  const user = await getCurrentUser();

  return <ClientTopHeader user={user} />;
}
