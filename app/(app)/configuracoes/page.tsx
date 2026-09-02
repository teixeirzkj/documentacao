import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data";
import { SettingsView } from "@/components/settings-view";

export default async function ConfiguracoesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "administrador") redirect("/");

  return <SettingsView profile={profile} />;
}
