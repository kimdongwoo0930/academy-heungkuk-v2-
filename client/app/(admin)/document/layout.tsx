import AdminGuard from "@/components/ui/AdminGuard";

export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
