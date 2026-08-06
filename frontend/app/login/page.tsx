"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

function LoginPageInner() {
  const { login, register, user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [tab, setTab]       = useState<"login" | "register">(
    params.get("tab") === "register" ? "register" : "login"
  );
  const [role, setRole]     = useState<"student" | "teacher" | "admin">("student");
  const [form, setForm]     = useState({
    full_name: "", email: "", password: "", department: "",
  });
  const [error, setError]   = useState("");
  const [busy, setBusy]     = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "teacher") router.push("/teacher/dashboard");
      else if (user.role === "admin") router.push("/admin/dashboard");
      else router.push("/student/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (tab === "login") {
        await login(form.email, form.password);
      } else {
        await register({ ...form, role });
      }
      // Redirect handled by useEffect above
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const ROLES: Array<{ value: "student" | "teacher" | "admin"; label: string; icon: string }> = [
    { value: "student", label: "Student", icon: "👨‍🎓" },
    { value: "teacher", label: "Teacher", icon: "👨‍🏫" },
    { value: "admin",   label: "Admin",   icon: "⚙️" },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, var(--surface) 60%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              PS
            </div>
            <span className="font-display font-bold text-2xl gradient-text">
              ProjectSense AI
            </span>
          </Link>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            AI-Powered Academic Project Evaluation
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8">
          {/* Tabs */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold capitalize transition-all duration-200"
                style={
                  tab === t
                    ? { background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }
                    : { color: "var(--text-muted)" }
                }
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Role selector (register only) */}
          {tab === "register" && (
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                I AM A
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className="py-3 rounded-xl text-center transition-all duration-200"
                    style={
                      role === r.value
                        ? {
                            background: "rgba(99,102,241,0.15)",
                            border: "1px solid rgba(99,102,241,0.4)",
                            color: "#a5b4fc",
                          }
                        : {
                            background: "transparent",
                            border: "1px solid var(--surface-border)",
                            color: "var(--text-muted)",
                          }
                    }
                  >
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <div className="text-xs font-semibold">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                    FULL NAME
                  </label>
                  <input
                    id="full_name"
                    className="input-field"
                    placeholder="Your full name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                    DEPARTMENT (OPTIONAL)
                  </label>
                  <input
                    id="department"
                    className="input-field"
                    placeholder="e.g. Computer Science"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@university.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              id="auth-submit"
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={busy}
              style={{ padding: "0.75rem" }}
            >
              {busy
                ? "Please wait..."
                : tab === "login"
                ? "Sign In"
                : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
            </button>
          </form>

          <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
            {tab === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => setTab("register")} className="text-brand-400 hover:underline font-medium">
                  Register
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setTab("login")} className="text-brand-400 hover:underline font-medium">
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:"var(--surface)"}}><p style={{color:"var(--text-muted)"}}>Loading...</p></div>}>
      <LoginPageInner />
    </Suspense>
  );
}
