import AdminGuard from "@/components/ui/AdminGuard";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
