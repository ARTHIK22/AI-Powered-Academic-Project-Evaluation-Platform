"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const studentNav: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard",      icon: "🏠" },
  { href: "/student/submit",    label: "Submit Project",  icon: "📤" },
];

const teacherNav: NavItem[] = [
  { href: "/teacher/dashboard", label: "Dashboard",    icon: "🏠" },
  { href: "/teacher/projects",  label: "All Projects", icon: "📁" },
  { href: "/teacher/rubrics",   label: "Rubrics",      icon: "📋" },
];

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Analytics",     icon: "📊" },
  { href: "/admin/users",     label: "Manage Users",  icon: "👥" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems =
    user?.role === "teacher" ? teacherNav :
    user?.role === "admin"   ? adminNav   :
    studentNav;

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-40"
      style={{
        background: "var(--surface-card)",
        borderRight: "1px solid var(--surface-border)",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "var(--surface-border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            PS
          </div>
          <div>
            <p className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              ProjectSense
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              AI Platform
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "var(--surface-border)" }}>
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}
          >
            {user?.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="overflow-hidden">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {user?.full_name}
            </p>
            <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
              {user?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${pathname.startsWith(item.href) ? "active" : ""}`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "var(--surface-border)" }}>
        <button
          onClick={logout}
          className="sidebar-link w-full text-left"
          style={{ color: "#ef4444" }}
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
