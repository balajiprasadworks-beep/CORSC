"use client";

/* =========================================================================
   CORSC UI kit.

   Shared presentational primitives for the continuous OPD workflow. Every
   section is built from these so spacing, typography, focus states and
   collapse behaviour stay identical across the app.
   ========================================================================= */

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Minus, Plus } from "lucide-react";

export const INK = "#0B1F3A";
export const TEAL = "#0F6E6E";
export const PAPER = "#F6F7F5";

export const serif = { fontFamily: "var(--font-heading, 'Geist', system-ui, sans-serif)" };
export const mono = { fontFamily: "var(--font-geist-mono, ui-monospace, monospace)" };

export const TONES = {
  ok: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", label: "text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  info: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800", label: "text-sky-700", dot: "bg-sky-500", bar: "bg-sky-500" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", label: "text-amber-700", dot: "bg-amber-500", bar: "bg-amber-500" },
  danger: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", label: "text-red-700", dot: "bg-red-500", bar: "bg-red-500" },
  neutral: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", label: "text-slate-600", dot: "bg-slate-400", bar: "bg-slate-400" },
};

export function tone(name) {
  return TONES[name] || TONES.neutral;
}

const inputBase =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[15px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition " +
  "placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/25 " +
  "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

/* ------------------------------------------------------------- structure */

/**
 * A collapsible workflow section. Sections auto-collapse once complete unless
 * the clinician has explicitly pinned them open.
 */
export function WorkflowSection({
  id,
  index,
  icon: Icon,
  title,
  subtitle,
  status,
  statusTone = "neutral",
  open,
  onToggle,
  children,
  actions,
  accent = "text-teal-700",
}) {
  const contentId = `${id}-content`;
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_2px_10px_rgba(15,23,42,0.07)]"
    >
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[12px] font-semibold text-slate-500">
            {index}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              {Icon && <Icon size={16} className={accent} aria-hidden="true" />}
              <span className="text-[15px] font-semibold text-slate-900" style={serif}>{title}</span>
              {status && <StatusChip tone={statusTone}>{status}</StatusChip>}
            </span>
            {subtitle && <span className="mt-0.5 block text-[13px] text-slate-500">{subtitle}</span>}
          </span>
          <ChevronDown
            size={18}
            className={`mt-1 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>
      {open && (
        <div id={contentId} className="border-t border-slate-100 px-4 pb-4 pt-4">
          {children}
          {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
    </section>
  );
}

/** A titled block inside a section. */
export function Panel({ title, subtitle, right, children, className = "", tone: toneName }) {
  const t = toneName ? tone(toneName) : null;
  return (
    <div className={`rounded-xl border ${t ? `${t.bg} ${t.border}` : "border-slate-200 bg-white"} p-3.5 ${className}`}>
      {(title || right) && (
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <div className="text-[13.5px] font-semibold text-slate-900">{title}</div>}
            {subtitle && <div className="mt-0.5 text-[12.5px] text-slate-500">{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

/** Collapsible sub-card used for history groups and follow-up milestones. */
export function Disclosure({ title, subtitle, right, badge, defaultOpen = false, children, tone: toneName }) {
  const [open, setOpen] = useState(defaultOpen);
  const t = toneName ? tone(toneName) : null;
  return (
    <div className={`overflow-hidden rounded-xl border ${t ? `${t.border}` : "border-slate-200"} bg-white`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors ${t ? t.bg : "hover:bg-slate-50"}`}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-slate-900">{title}</span>
            {badge}
          </span>
          {subtitle && <span className="mt-0.5 block text-[12.5px] text-slate-500">{subtitle}</span>}
        </span>
        {right}
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && <div className="border-t border-slate-100 px-3.5 py-3.5">{children}</div>}
    </div>
  );
}

export function Stack({ children, gap = "gap-3", className = "" }) {
  return <div className={`flex flex-col ${gap} ${className}`}>{children}</div>;
}

export function Grid({ children, cols = "sm:grid-cols-2", className = "" }) {
  return <div className={`grid grid-cols-1 gap-3 ${cols} ${className}`}>{children}</div>;
}

/* ---------------------------------------------------------------- inputs */

export function Field({ label, hint, children, htmlFor, right }) {
  return (
    <div>
      {(label || right) && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          {label && (
            <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-500">
              {label}
            </label>
          )}
          {right}
        </div>
      )}
      {children}
      {hint && <p className="mt-1 text-[11.5px] text-slate-400">{hint}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange, placeholder, type = "text", hint, unit, right, inputMode, disabled }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id} right={right}>
      <div className="relative">
        <input
          id={id}
          type={type}
          inputMode={inputMode || (type === "number" ? "decimal" : undefined)}
          value={value ?? ""}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${inputBase} ${unit ? "pr-14" : ""}`}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-slate-400">
            {unit}
          </span>
        )}
      </div>
    </Field>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3, hint }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <textarea
        id={id}
        rows={rows}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`${inputBase} resize-y leading-relaxed`}
      />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, placeholder = "Select", hint }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputBase} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="%2394a3b8" stroke-width="2"><path d="M4 6l4 4 4-4"/></svg>')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}

export function DateField({ label, value, onChange, hint }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input
        id={id}
        type="date"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={inputBase}
      />
    </Field>
  );
}

/* --------------------------------------------------------------- choices */

export function Chip({ active, onClick, children, size = "default", tone: toneName }) {
  const t = toneName ? tone(toneName) : null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border font-medium transition ${size === "sm" ? "px-2.5 py-1 text-[11.5px]" : "px-3.5 py-2 text-[13px]"} ${
        active
          ? t
            ? `${t.bg} ${t.border} ${t.label}`
            : "border-teal-700 bg-teal-700 text-white shadow-sm"
          : "border-slate-300 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700"
      }`}
    >
      {children}
    </button>
  );
}

export function Checkbox({ checked, onChange, label, hint, points }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={Boolean(checked)}
      className="flex w-full items-start justify-between gap-3 rounded-lg px-1 py-2 text-left transition-colors hover:bg-slate-50"
    >
      <span className="flex min-w-0 items-start gap-2.5">
        <span
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
            checked ? "border-teal-700 bg-teal-700" : "border-slate-300 bg-white"
          }`}
        >
          {checked && <Check size={13} className="text-white" strokeWidth={3} aria-hidden="true" />}
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] text-slate-800">{label}</span>
          {hint && <span className="mt-0.5 block text-[12px] text-slate-500">{hint}</span>}
        </span>
      </span>
      {points && <span className="shrink-0 text-xs text-slate-400" style={mono}>+{points}</span>}
    </button>
  );
}

/** Two-to-three way toggle, used for Normal / Findings on each system. */
export function SegmentedControl({ value, onChange, options, size = "default" }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5" role="group">
      {options.map((option) => {
        const active = value === option.value;
        const t = option.tone ? tone(option.tone) : null;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(active && option.clearable ? "" : option.value)}
            aria-pressed={active}
            className={`rounded-[10px] font-medium transition ${size === "sm" ? "px-2.5 py-1 text-[11.5px]" : "px-3.5 py-1.5 text-[13px]"} ${
              active
                ? t
                  ? `bg-white ${t.label} shadow-sm`
                  : "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Compact numeric stepper — faster than a dropdown for cycle counts. */
export function Stepper({ value, onChange, min = 0, max = 99, label, unit, hint }) {
  const current = Number(value) || 0;
  const set = (next) => onChange(String(Math.min(max, Math.max(min, next))));
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => set(current - 1)}
          disabled={current <= min}
          aria-label="Decrease"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:border-teal-400 hover:text-teal-700 disabled:opacity-40"
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="numeric"
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            className={`${inputBase} text-center text-[17px] font-semibold`}
            style={mono}
          />
          {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">{unit}</span>}
        </div>
        <button
          type="button"
          onClick={() => set(current + 1)}
          disabled={current >= max}
          aria-label="Increase"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition hover:border-teal-400 hover:text-teal-700 disabled:opacity-40"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    </Field>
  );
}

/** Horizontal cycle picker — scroll-selectable pills with a live marker. */
export function CyclePills({ value, total, onChange, max = 24 }) {
  const scroller = useRef(null);
  const count = Math.min(Math.max(Number(total) || 0, Number(value) || 0, 6), max);
  const cycles = Array.from({ length: count }, (_, i) => i + 1);
  const selected = Number(value) || 0;

  useEffect(() => {
    const node = scroller.current?.querySelector('[data-selected="true"]');
    node?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [selected]);

  return (
    <div ref={scroller} className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {cycles.map((cycle) => {
        const active = cycle === selected;
        const past = cycle < selected;
        return (
          <button
            key={cycle}
            type="button"
            data-selected={active ? "true" : undefined}
            onClick={() => onChange(String(cycle))}
            aria-pressed={active}
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl border text-[14px] font-semibold transition ${
              active
                ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                : past
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-teal-300"
            }`}
            style={mono}
          >
            {cycle}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- status */

export function StatusChip({ tone: toneName = "neutral", children, className = "" }) {
  const t = tone(toneName);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.bg} ${t.label} ${className}`}>
      {children}
    </span>
  );
}

export function Callout({ tone: toneName = "info", title, children, icon: Icon }) {
  const t = tone(toneName);
  return (
    <div className={`rounded-xl border p-3 ${t.bg} ${t.border}`}>
      {title && (
        <div className={`flex items-center gap-1.5 text-[13.5px] font-semibold ${t.label}`}>
          {Icon && <Icon size={14} aria-hidden="true" />}
          {title}
        </div>
      )}
      {children && <div className={`text-[13px] leading-relaxed ${title ? "mt-1" : ""} text-slate-600`}>{children}</div>}
    </div>
  );
}

export function MetricTile({ label, value, unit, caption, tone: toneName, className = "" }) {
  const t = toneName ? tone(toneName) : null;
  return (
    <div className={`rounded-xl border p-3 ${t ? `${t.bg} ${t.border}` : "border-slate-200 bg-white"} ${className}`}>
      <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className={`text-[20px] font-bold ${t ? t.text : "text-slate-900"}`} style={mono}>
          {value ?? "—"}
        </span>
        {unit && value !== null && value !== undefined && value !== "—" && (
          <span className="text-[12px] text-slate-400">{unit}</span>
        )}
      </div>
      {caption && <div className={`mt-0.5 text-[11.5px] leading-snug ${t ? t.label : "text-slate-500"}`}>{caption}</div>}
    </div>
  );
}

export function EmptyState({ children }) {
  return <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-[13px] text-slate-400">{children}</p>;
}

/* ------------------------------------------------------------------ risk */

export const RISK_ORDER = ["Low", "Moderate", "High", "Very High"];

export function RiskBar({ category, styles }) {
  const index = RISK_ORDER.indexOf(category);
  return (
    <div>
      <div className="flex gap-1" role="img" aria-label={`Risk level ${category}`}>
        {RISK_ORDER.map((level, i) => (
          <div key={level} className={`h-2 flex-1 rounded-full transition-colors ${i <= index ? styles.bar : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-widest text-slate-400">
        {RISK_ORDER.map((level) => (
          <span key={level} className={level === category ? `font-semibold ${styles.text}` : ""}>{level}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- sparkline */

/** Minimal trend line — direction matters more than precise values here. */
export function Sparkline({ points, direction = "flat", height = 36, width = 120 }) {
  if (!points || points.length < 2) return null;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const coords = points.map((point, i) => {
    const x = i * step;
    const y = height - ((point.value - min) / span) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const stroke = direction === "worse" ? "#dc2626" : direction === "better" ? "#059669" : "#64748b";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden="true">
      <polyline points={coords.join(" ")} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((coord, i) => {
        const [x, y] = coord.split(",");
        const isLast = i === coords.length - 1;
        return <circle key={coord + i} cx={x} cy={y} r={isLast ? 3 : 2} fill={isLast ? stroke : "#fff"} stroke={stroke} strokeWidth="1.5" />;
      })}
    </svg>
  );
}

/* ------------------------------------------------------------- utilities */

export function SectionProgress({ done, total }) {
  if (!total) return null;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-teal-600 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-medium text-slate-500" style={mono}>{done}/{total}</span>
    </div>
  );
}

export function KeyValue({ label, value, mono: useMono = true }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{label}</div>
      <div
        className="truncate text-[13px] font-semibold text-slate-900"
        style={useMono ? mono : undefined}
        title={typeof value === "string" ? value : undefined}
      >
        {value === null || value === undefined || value === "" ? "—" : value}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ provenance */

/**
 * Renders where a clinical rule came from.
 *
 * Deliberately always visible rather than hidden behind a tooltip. A clinician
 * deciding whether to act on a recommendation needs to see, without a hover,
 * whether it comes from a guideline or from a local scheduling convention —
 * and whether the implementation was verified against the source or only
 * partly so.
 */
export function SourceNote({ provenance, className = "" }) {
  if (!provenance) return null;
  const partial = provenance.verification === "partial";
  const local = provenance.verification === "local";
  return (
    <div className={`mt-1.5 text-[11.5px] leading-snug text-slate-500 ${className}`}>
      <span className="font-medium text-slate-600">
        {provenance.shortLabel}
        {provenance.version ? ` · ${provenance.version}` : ""}
      </span>
      {provenance.locator && <span> · {provenance.locator}</span>}
      {(partial || local) && (
        <StatusChip tone={partial ? "warning" : "info"} className="ml-1.5 align-middle">
          {provenance.verificationLabel}
        </StatusChip>
      )}
      {provenance.caveat && <div className="mt-0.5 text-amber-700">{provenance.caveat}</div>}
      {provenance.note && <div className="mt-0.5 text-slate-500">{provenance.note}</div>}
    </div>
  );
}

/** The full citation, for the printed report and the sources panel. */
export function Citation({ source }) {
  if (!source) return null;
  return (
    <div className="border-l-2 border-slate-200 py-1 pl-3">
      <div className="text-[12.5px] font-semibold text-slate-800">{source.title}</div>
      <div className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">{source.citation}</div>
      {source.caveat && <div className="mt-1 text-[11.5px] leading-relaxed text-amber-700">{source.caveat}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- alerts */

const FLAG_STYLES = {
  red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", dot: "bg-red-600" },
  orange: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-800", dot: "bg-orange-500" },
  yellow: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", dot: "bg-amber-500" },
  green: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
};

export function flagStyle(level) {
  return FLAG_STYLES[level] || FLAG_STYLES.green;
}

/**
 * One red-flag card: what was found, what to do, why, and where the rule
 * comes from. All four are shown, because an alert a clinician cannot audit is
 * an alert they will eventually learn to dismiss.
 */
export function FlagCard({ flag }) {
  const style = flagStyle(flag.level);
  return (
    <div className={`rounded-xl border p-3 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className={`text-[13.5px] font-semibold ${style.text}`}>{flag.title}</div>
          {flag.finding && <div className="mt-0.5 text-[12.5px] text-slate-600">{flag.finding}</div>}
          {flag.action && (
            <div className="mt-1.5 text-[13px] leading-relaxed text-slate-700">
              <span className="font-medium text-slate-800">Do now: </span>
              {flag.action}
            </div>
          )}
          {flag.why && (
            <div className="mt-1 text-[12.5px] leading-relaxed text-slate-500">
              <span className="font-medium">Why: </span>
              {flag.why}
            </div>
          )}
          <SourceNote provenance={flag.provenance} />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------- completeness */

/**
 * The completeness bar shown beside any risk category.
 *
 * Its job is to stop a category computed from four facts looking identical to
 * one computed from twenty.
 */
export function CompletenessBar({ completeness }) {
  if (!completeness) return null;
  const t = tone(completeness.bandTone);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-[11px] uppercase tracking-widest text-slate-500">
          {completeness.visitTypeId ? "Visit completeness" : "Baseline completeness"}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[17px] font-bold text-slate-900" style={mono}>{completeness.percent}%</span>
          <StatusChip tone={completeness.bandTone}>{completeness.bandLabel}</StatusChip>
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${t.bar || "bg-slate-400"}`} style={{ width: `${completeness.percent}%` }} />
      </div>
      <p className={`mt-2 text-[12.5px] leading-relaxed ${t.label}`}>{completeness.bandDetail}</p>
    </div>
  );
}
