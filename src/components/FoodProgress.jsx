export default function FoodProgress({ value = 0, size = 132, label, sublabel }) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2dac9" strokeWidth={stroke} />
        {clamped > 0 && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#c65d3a"
            strokeWidth={stroke}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            pathLength={100}
            strokeDasharray={`${clamped} 100`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold text-forest">{label}</span>
        {sublabel && <span className="mt-0.5 text-[11px] text-muted">{sublabel}</span>}
      </div>
    </div>
  );
}
