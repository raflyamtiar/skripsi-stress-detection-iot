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
      className={`rounded-2xl ${bgColor} p-4 sm:p-5 shadow-lg border border-transparent`}
    >
      <div className="flex items-start gap-2 sm:gap-4">
        <div className="text-white flex-shrink-0">{icon}</div>
        <div className="w-full min-w-0">
          <h3 className="font-semibold text-white text-sm sm:text-base">{title}</h3>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-2">
            <span className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {value}
            </span>
            {unit ? (
              <span className="text-sm sm:text-lg font-semibold text-white">{unit}</span>
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
