"use client";
import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;       // 0-100
  size?: number;       // px
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

const COLORS: Record<string, string> = {
  brand:   "#6366f1",
  violet:  "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger:  "#ef4444",
};

function scoreToColor(score: number): string {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.danger;
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  color,
}: ScoreRingProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringColor = color || scoreToColor(score);
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="score-ring-container" style={{ width: size, height: size }}>
        <svg className="score-ring-svg" width={size} height={size}>
          <circle
            className="score-ring-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className="score-ring-progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={ringColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ position: "absolute" }}
        >
          <span
            className="font-display font-bold"
            style={{ fontSize: size * 0.22, color: ringColor, lineHeight: 1 }}
          >
            {Math.round(animated)}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            /100
          </span>
        </div>
      </div>
      {label && (
        <p className="text-sm font-semibold text-center" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
      )}
      {sublabel && (
        <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
  max?: number;
  delay?: number;
}

export function ScoreBar({ label, score, max = 100, delay = 0 }: ScoreBarProps) {
  const [width, setWidth] = useState(0);
  const pct = (score / max) * 100;
  const color = scoreToColor(pct);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 150 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {score}/{max}
        </span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
          }}
        />
      </div>
    </div>
  );
}
