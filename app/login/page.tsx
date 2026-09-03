import { getAppSettings } from "@/lib/data";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const settings = await getAppSettings();
  return <LoginForm logoUrl={settings.logo_url} />;
}
