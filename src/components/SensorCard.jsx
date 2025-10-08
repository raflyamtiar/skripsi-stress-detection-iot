export default function SensorCard({
  title,
  icon,
  value,
  unit,
  subtitle,
  bgColor = "bg-gradient-to-r from-blue-500 to-blue-300",
}) {
  return (
    <div
      className={`rounded-lg ${bgColor} p-5 shadow-lg border border-transparent`}
    >
      <div className="flex items-start gap-4">
        <div className="text-white">{icon}</div>
        <div className="w-full">
          <h3 className="font-semibold text-white">{title}</h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-white">
              {value}
            </span>
            {unit ? (
              <span className="text-lg font-semibold text-white">{unit}</span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-1 text-xs text-white/80">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
