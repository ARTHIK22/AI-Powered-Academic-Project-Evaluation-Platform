"use client";
import { useState } from "react";

interface VivaQuestion {
  question: string;
  expected_answer_hint?: string;
}

interface VivaQuestionsPanelProps {
  questions: {
    basic?: VivaQuestion[];
    intermediate?: VivaQuestion[];
    advanced?: VivaQuestion[];
  };
}

const TIERS = [
  {
    key: "basic",
    label: "Basic",
    emoji: "🟢",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  {
    key: "intermediate",
    label: "Intermediate",
    emoji: "🟡",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    key: "advanced",
    label: "Advanced",
    emoji: "🔴",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
];

export function VivaQuestionsPanel({ questions }: VivaQuestionsPanelProps) {
  const [openTier, setOpenTier] = useState<string | null>("basic");
  const [openQ, setOpenQ] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {TIERS.map((tier) => {
        const qs = (questions as Record<string, VivaQuestion[]>)[tier.key] || [];
        if (!qs.length) return null;
        const isOpen = openTier === tier.key;

        return (
          <div
            key={tier.key}
            className="rounded-xl overflow-hidden border"
            style={{ borderColor: tier.border }}
          >
            {/* Tier header */}
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
              style={{ background: isOpen ? tier.bg : "transparent" }}
              onClick={() => setOpenTier(isOpen ? null : tier.key)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{tier.emoji}</span>
                <div>
                  <p className="font-semibold" style={{ color: tier.color }}>
                    {tier.label} Level
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {qs.length} question{qs.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <span
                className="transition-transform duration-200"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  color: "var(--text-muted)",
                }}
              >
                ▼
              </span>
            </button>

            {/* Questions */}
            {isOpen && (
              <div className="px-4 pb-4 space-y-2">
                {qs.map((q, i) => {
                  const qKey = `${tier.key}-${i}`;
                  const qOpen = openQ === qKey;

                  return (
                    <div
                      key={i}
                      className="rounded-lg overflow-hidden border"
                      style={{ borderColor: "var(--surface-border)" }}
                    >
                      <button
                        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-white/5 transition-colors"
                        onClick={() => setOpenQ(qOpen ? null : qKey)}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="text-xs font-mono mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
                            style={{
                              background: tier.bg,
                              color: tier.color,
                              border: `1px solid ${tier.border}`,
                            }}
                          >
                            {i + 1}
                          </span>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {q.question}
                          </p>
                        </div>
                        {q.expected_answer_hint && (
                          <span
                            className="text-xs shrink-0 mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {qOpen ? "▲" : "💡"}
                          </span>
                        )}
                      </button>

                      {qOpen && q.expected_answer_hint && (
                        <div
                          className="px-4 pb-3 pt-1 mx-3 mb-2 rounded-lg text-sm"
                          style={{
                            background: "rgba(99,102,241,0.06)",
                            color: "var(--text-secondary)",
                            borderLeft: `2px solid ${tier.color}`,
                            paddingLeft: "1rem",
                          }}
                        >
                          <span className="font-semibold text-xs" style={{ color: tier.color }}>
                            Expected Answer Hint:{" "}
                          </span>
                          {q.expected_answer_hint}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
