"use client";
import { useEffect, useState } from "react";
import { teacherApi, type Rubric, type RubricPayload } from "@/lib/api";

interface Criterion {
  name: string;
  max_marks: number;
  description: string;
}

const DEFAULT_CRITERIA: Criterion[] = [
  { name: "Documentation",  max_marks: 20, description: "Report quality, formatting, and completeness" },
  { name: "Implementation", max_marks: 30, description: "Code quality and working functionality" },
  { name: "Innovation",     max_marks: 20, description: "Originality and unique features" },
  { name: "Presentation",   max_marks: 15, description: "PPT quality and communication" },
  { name: "Code Quality",   max_marks: 15, description: "Naming, structure, documentation" },
];

export default function RubricsPage() {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Rubric | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form state
  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [criteria, setCriteria]   = useState<Criterion[]>(DEFAULT_CRITERIA);

  const load = () =>
    teacherApi.listRubrics().then(setRubrics).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDesc("");
    setIsDefault(false);
    setCriteria(DEFAULT_CRITERIA);
    setCreating(true);
  };

  const openEdit = (r: Rubric) => {
    setEditing(r);
    setName(r.name);
    setDesc(r.description ?? "");
    setIsDefault(r.is_default);
    setCriteria(r.criteria as Criterion[]);
    setCreating(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload: RubricPayload = {
      name,
      description: desc || undefined,
      is_default: isDefault,
      criteria,
      total_marks: criteria.reduce((a, c) => a + c.max_marks, 0),
    };
    try {
      if (editing) {
        await teacherApi.updateRubric(editing.id, payload);
      } else {
        await teacherApi.createRubric(payload);
      }
      setCreating(false);
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await teacherApi.deleteRubric(id);
    setDeleteId(null);
    await load();
  };

  const updateCriterion = (i: number, field: keyof Criterion, val: string | number) => {
    const updated = [...criteria];
    (updated[i] as unknown as Record<string, unknown>)[field] = val;
    setCriteria(updated);
  };

  const addCriterion = () =>
    setCriteria([...criteria, { name: "", max_marks: 10, description: "" }]);

  const removeCriterion = (i: number) =>
    setCriteria(criteria.filter((_, idx) => idx !== i));

  const totalMarks = criteria.reduce((a, c) => a + Number(c.max_marks), 0);

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
            📋 Evaluation Rubrics
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Create and manage rubrics used by AI to predict marks.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + New Rubric
        </button>
      </div>

      {/* Rubric list */}
      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading rubrics...</div>
      ) : rubrics.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No rubrics yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Create your first rubric to help AI predict marks accurately.
          </p>
          <button className="btn-primary" onClick={openCreate}>Create Rubric</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {rubrics.map((r) => (
            <div key={r.id} className="glass-card glass-card-hover rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                      {r.name}
                    </h3>
                    {r.is_default && (
                      <span className="badge" style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                        ⭐ Default
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{r.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(r)}
                    className="btn-ghost text-xs"
                    style={{ color: "#818cf8" }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(r.id)}
                    className="btn-ghost text-xs"
                    style={{ color: "#ef4444" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {(r.criteria as Criterion[]).map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>{c.name}</span>
                    <span className="font-semibold" style={{ color: "#a5b4fc" }}>{c.max_marks} marks</span>
                  </div>
                ))}
              </div>

              <div
                className="flex justify-between items-center mt-4 pt-4 border-t font-bold"
                style={{ borderColor: "var(--surface-border)" }}
              >
                <span style={{ color: "var(--text-muted)" }}>Total</span>
                <span className="gradient-text">{r.total_marks} marks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8"
            style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>
                {editing ? "Edit Rubric" : "Create Rubric"}
              </h2>
              <button onClick={() => { setCreating(false); setEditing(null); }} className="btn-ghost">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>RUBRIC NAME *</label>
                <input id="rubric-name" className="input-field" placeholder="e.g. Final Year Project Rubric" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>DESCRIPTION</label>
                <input className="input-field" placeholder="Optional description" value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Set as default rubric (used by AI for all evaluations)
                </span>
              </label>
            </div>

            {/* Criteria builder */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  CRITERIA — Total: <span className="gradient-text font-bold">{totalMarks} marks</span>
                </label>
                <button onClick={addCriterion} className="btn-ghost text-xs" style={{ color: "#818cf8" }}>
                  + Add Criterion
                </button>
              </div>

              <div className="space-y-3">
                {criteria.map((c, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--surface-border)" }}
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        className="input-field"
                        placeholder="Criterion name (e.g. Documentation)"
                        value={c.name}
                        onChange={(e) => updateCriterion(i, "name", e.target.value)}
                        style={{ padding: "0.375rem 0.625rem" }}
                      />
                      <input
                        className="input-field"
                        placeholder="Description (optional)"
                        value={c.description}
                        onChange={(e) => updateCriterion(i, "description", e.target.value)}
                        style={{ padding: "0.375rem 0.625rem" }}
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="input-field w-20 text-center"
                        style={{ padding: "0.375rem 0.5rem" }}
                        value={c.max_marks}
                        onChange={(e) => updateCriterion(i, "max_marks", Number(e.target.value))}
                      />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>marks</span>
                      <button
                        onClick={() => removeCriterion(i)}
                        className="btn-ghost w-7 h-7 p-0 flex items-center justify-center"
                        style={{ color: "#ef4444" }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => { setCreating(false); setEditing(null); }} className="btn-secondary">
                Cancel
              </button>
              <button
                id="save-rubric"
                onClick={handleSave}
                className="btn-primary"
                disabled={saving || !name || criteria.length === 0}
              >
                {saving ? "Saving..." : editing ? "Update Rubric" : "Create Rubric"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ background: "var(--surface-card)", border: "1px solid var(--surface-border)" }}>
            <p className="text-5xl mb-4">🗑️</p>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>
              Delete Rubric?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              This cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-primary" style={{ background: "#ef4444" }} onClick={() => handleDelete(deleteId)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
