import Link from "next/link";

export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function SectionHeading({ eyebrow, title, subtitle, align = "left", action }) {
  const alignment = align === "center" ? "text-center mx-auto items-center" : "text-left";
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center",
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-2", alignment)}>
        {eyebrow && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terracotta">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-2xl font-semibold text-forest sm:text-3xl">{title}</h2>
        {subtitle && <p className="text-sm leading-relaxed text-ink/65 sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({ children, tone = "line", className }) {
  const tones = {
    line: "border border-line bg-cream text-forest",
    forest: "bg-forest text-cream",
    terracotta: "bg-terracotta text-cream",
    mustard: "bg-mustard/25 text-mustard-deep",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold",
        tones[tone] ?? tones.line,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Stat({ value, label, tone = "dark" }) {
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          "font-display text-2xl font-semibold sm:text-3xl",
          tone === "light" ? "text-cream" : "text-forest",
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "mt-0.5 text-xs",
          tone === "light" ? "text-cream/70" : "text-muted",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper/50 px-6 py-14 text-center">
      {icon && <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-cream text-muted">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-forest">{title}</h3>
      {body && <p className="mt-2 max-w-md text-sm text-ink/60">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, className, tone = "terracotta" }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-line/70", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          tone === "forest" ? "bg-forest" : "bg-terracotta",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-muted">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-terracotta">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-forest">{item.label}</span>
            )}
            {i < items.length - 1 && <span aria-hidden className="text-line">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export const LAYOUT_CONTAINER =
  "mx-auto w-full max-w-7xl px-4 sm:px-6 2xl:max-w-[1400px]";

export function Container({ children, className }) {
  return (
    <div className={cn(LAYOUT_CONTAINER, className)}>
      {children}
    </div>
  );
}
