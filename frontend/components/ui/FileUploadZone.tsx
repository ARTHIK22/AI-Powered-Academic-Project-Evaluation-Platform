"use client";
import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface FileUploadZoneProps {
  label: string;
  accept: string;
  hint?: string;
  icon?: string;
  onFile: (file: File | null) => void;
  value?: File | null;
}

export function FileUploadZone({
  label,
  accept,
  hint,
  icon = "📄",
  onFile,
  value,
}: FileUploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0] || null;
    onFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFile(e.target.files?.[0] || null);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-brand-500 bg-brand-500/10 scale-[1.01]"
          : value
          ? "border-green-500/40 bg-green-500/5"
          : "border-surface-border hover:border-brand-500/50 hover:bg-brand-500/5"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-4xl">{value ? "✅" : icon}</span>
        {value ? (
          <>
            <p className="font-semibold text-green-400">{value.name}</p>
            <p className="text-xs text-green-400/60">
              {(value.size / 1024 / 1024).toFixed(2)} MB · Click to change
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {label}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Drag & drop or <span className="text-brand-400 underline">browse</span>
            </p>
            {hint && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {hint}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
