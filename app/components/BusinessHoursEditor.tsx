"use client";

import { Clock } from "lucide-react";

interface BusinessHoursEditorProps {
  hours: Record<string, { open: string; close: string }>;
  onChange: (hours: Record<string, { open: string; close: string }>) => void;
}

const DAYS_FA: Record<string, string> = {
  sat: "شنبه",
  sun: "یکشنبه",
  mon: "دوشنبه",
  tue: "سه‌شنبه",
  wed: "چهارشنبه",
  thu: "پنجشنبه",
  fri: "جمعه",
};

const DAY_ORDER = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"];

export default function BusinessHoursEditor({ hours, onChange }: BusinessHoursEditorProps) {
  const setDayHours = (day: string, field: "open" | "close", value: string) => {
    const updated = { ...hours };
    if (!updated[day]) updated[day] = { open: "09:00", close: "22:00" };
    updated[day] = { ...updated[day], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} style={{ color: "#C4A88A" }} />
        <label className="block text-sm font-bold" style={{ color: "#C4A88A" }}>
          ساعات کاری
        </label>
      </div>
      <div className="space-y-2">
        {DAY_ORDER.map((day) => (
          <div key={day} className="flex items-center gap-2">
            <span className="w-16 text-xs font-bold shrink-0" style={{ color: "var(--text-primary)" }}>
              {DAYS_FA[day]}
            </span>
            <input
              type="time"
              value={hours[day]?.open || "09:00"}
              onChange={(e) => setDayHours(day, "open", e.target.value)}
              className="flex-1 border rounded-lg px-3 py-1.5 text-xs font-sans outline-none"
              style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              dir="ltr"
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>تا</span>
            <input
              type="time"
              value={hours[day]?.close || "22:00"}
              onChange={(e) => setDayHours(day, "close", e.target.value)}
              className="flex-1 border rounded-lg px-3 py-1.5 text-xs font-sans outline-none"
              style={{ backgroundColor: "var(--bg-elevated)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
              dir="ltr"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
