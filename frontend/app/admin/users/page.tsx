"use client";
import { useEffect, useState } from "react";
import { adminApi, type AdminUser } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadUsers = () => {
    adminApi.listUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggleStatus = async (user: AdminUser) => {
    setUpdatingId(user.id);
    try {
      await adminApi.updateUser(user.id, { is_active: !user.is_active });
      await loadUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangeRole = async (userId: number, role: "student" | "teacher" | "admin") => {
    setUpdatingId(userId);
    try {
      await adminApi.updateUser(userId, { role });
      await loadUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setUpdatingId(userId);
    try {
      await adminApi.deleteUser(userId);
      await loadUsers();
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
            👥 User Management
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage student, teacher, and administrator accounts across the institution.
          </p>
        </div>
        <input
          className="input-field max-w-xs"
          placeholder="Search by name, email, or dept..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
            No users found matching your search.
          </div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {u.full_name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {u.email}
                    </p>
                  </td>
                  <td>
                    <select
                      className="input-field py-1 px-2 text-xs w-28 capitalize"
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) =>
                        handleChangeRole(u.id, e.target.value as "student" | "teacher" | "admin")
                      }
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{u.department || "—"}</td>
                  <td>
                    <span
                      className="badge cursor-pointer"
                      style={
                        u.is_active
                          ? { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }
                          : { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }
                      }
                      onClick={() => handleToggleStatus(u)}
                    >
                      {u.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="btn-ghost text-xs"
                        disabled={updatingId === u.id}
                        style={{ color: u.is_active ? "#f59e0b" : "#10b981" }}
                      >
                        {u.is_active ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="btn-ghost text-xs"
                        disabled={updatingId === u.id}
                        style={{ color: "#ef4444" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
