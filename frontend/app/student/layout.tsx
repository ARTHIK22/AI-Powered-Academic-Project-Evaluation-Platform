"use client";
import { AuthProvider } from "@/lib/auth";
import { DashboardLayout } from "@/components/ui/Sidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
}
