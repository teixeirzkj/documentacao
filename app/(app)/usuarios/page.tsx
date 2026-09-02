import { redirect } from "next/navigation";
import { getCurrentProfile, getUsers } from "@/lib/data";
import { UserManagement } from "@/components/user-management";

export default async function UsuariosPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "administrador") redirect("/");

  const users = await getUsers();

  return <UserManagement users={users} currentUserId={profile.id} />;
}
