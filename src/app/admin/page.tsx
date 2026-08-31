import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminConsole } from "@/components/admin/AdminConsole";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }
  if (session.user.role !== "admin") {
    redirect("/day/" + new Date().toISOString().slice(0, 10));
  }

  return <AdminConsole />;
}
