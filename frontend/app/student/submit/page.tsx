"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploadZone } from "@/components/ui/FileUploadZone";
import { studentApi } from "@/lib/api";

const STEPS = ["Project Info", "Upload Files", "Submit"];

export default function SubmitPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [report, setReport] = useState<File | null>(null);
  const [code, setCode] = useState<File | null>(null);
  const [ppt, setPpt] = useState<File | null>(null);

  const canNext =
    step === 0 ? title.trim().length > 3 :
    step === 1 ? (report !== null || code !== null) :
    true;

  const handleSubmit = async () => {
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", title);
      if (description) fd.append("description", description);
      if (githubUrl)   fd.append("github_url", githubUrl);
      if (report) fd.append("report", report);
      if (code)   fd.append("code_zip", code);
      if (ppt)    fd.append("ppt", ppt);

      const res = await studentApi.submit(fd);
      router.push(`/student/results/${res.project_id}?submitted=1`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed");
      setBusy(false);
    }
  };

  return (
    <div className="p-8 min-h-screen max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
          📤 Submit New Project
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Upload your project files and let AI do the evaluation.
        </p>
      </div>

      {/* Progress stepper */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={
                  i < step
                    ? { background: "#10b981", color: "#fff" }
                    : i === step
                    ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }
                    : { background: "var(--surface-border)", color: "var(--text-muted)" }
                }
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className="text-sm font-medium hidden sm:block"
                style={{ color: i === step ? "#a5b4fc" : "var(--text-muted)" }}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-px mx-4"
                style={{
                  background: i < step ? "#10b981" : "var(--surface-border)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="glass-card rounded-2xl p-8 mb-6">
        {/* Step 0: Info */}
        {step === 0 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>
              Project Information
            </h2>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                PROJECT TITLE *
              </label>
              <input
                id="project-title"
                className="input-field"
                placeholder="e.g. AI-Powered Student Performance Analyzer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                DESCRIPTION (OPTIONAL)
              </label>
              <textarea
                id="project-description"
                className="input-field"
                rows={4}
                placeholder="Briefly describe what your project does, its goals, and the technologies used..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
                GITHUB URL (OPTIONAL)
              </label>
              <input
                id="github-url"
                className="input-field"
                placeholder="https://github.com/username/project"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-bold text-xl mb-1" style={{ color: "var(--text-primary)" }}>
                Upload Project Files
              </h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                At least a report or code file is required.
              </p>
            </div>
            <FileUploadZone
              label="Project Report"
              accept=".pdf,.docx,.doc"
              hint="PDF or DOCX · Max 50MB"
              icon="📄"
              onFile={setReport}
              value={report}
            />
            <FileUploadZone
              label="Source Code"
              accept=".zip"
              hint="ZIP archive of your project · Max 50MB"
              icon="💻"
              onFile={setCode}
              value={code}
            />
            <FileUploadZone
              label="Presentation (PPT)"
              accept=".pptx,.ppt"
              hint="PowerPoint file · Max 50MB"
              icon="📊"
              onFile={setPpt}
              value={ppt}
            />
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>
              Review & Submit
            </h2>
            <div className="space-y-3">
              {[
                { label: "Title",       value: title },
                { label: "Description", value: description || "—" },
                { label: "GitHub",      value: githubUrl || "—" },
                { label: "Report",      value: report?.name || "Not uploaded" },
                { label: "Code ZIP",    value: code?.name   || "Not uploaded" },
                { label: "PPT",         value: ppt?.name    || "Not uploaded" },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex gap-4 py-3 border-b"
                  style={{ borderColor: "var(--surface-border)" }}
                >
                  <span className="text-sm font-semibold w-28 shrink-0" style={{ color: "var(--text-muted)" }}>
                    {r.label}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="rounded-xl p-4 text-sm"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "var(--text-secondary)" }}
            >
              🤖 Once submitted, our ARTHIK AI will analyze your project in the background.
              You'll be redirected to your results page where you can track progress.
            </div>

            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              >
                ⚠️ {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          className="btn-secondary"
          onClick={() => step > 0 ? setStep(step - 1) : undefined}
          disabled={step === 0}
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            id="next-step"
            className="btn-primary"
            onClick={() => setStep(step + 1)}
            disabled={!canNext}
          >
            Continue →
          </button>
        ) : (
          <button
            id="submit-project"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={busy}
          >
            {busy ? "Submitting..." : "🚀 Submit for Evaluation"}
          </button>
        )}
      </div>
    </div>
  );
}
