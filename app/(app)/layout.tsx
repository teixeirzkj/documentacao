import { redirect } from "next/navigation";
import { getAppSettings, getCurrentProfile } from "@/lib/data";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [profile, settings] = await Promise.all([getCurrentProfile(), getAppSettings()]);
  if (!profile) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} logoUrl={settings.logo_url} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
