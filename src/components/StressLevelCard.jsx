const VARIANTS = {
  calm: "bg-gradient-to-r from-green-500 to-emerald-400 text-green-900",
  warning: "bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900",
  danger: "bg-gradient-to-r from-rose-500 to-red-500 text-rose-50",
};

const pickVariant = (label = "") => {
  const normalized = label.toLowerCase();
  if (normalized.includes("high") || normalized.includes("berat")) {
    return "danger";
  }
  if (normalized.includes("no") || normalized.includes("rendah")) {
    return "calm";
  }
  return "warning";
};

export default function StressLevelCard({ label, confidence }) {
  const variantKey = pickVariant(label);
  const tone = VARIANTS[variantKey];
  const displayLabel = label || "Menunggu hasil";
  const confidenceText =
    typeof confidence === "number"
      ? `Confidence ${Math.round(confidence * 100)}%`
      : null;

  return (
    <div
      className={`flex flex-col ${tone} w-full p-4 rounded-2xl shadow-lg border border-white/20 transition`}
    >
      <div className="flex gap-2 items-center">
        <figure className="flex relative w-12 h-12">
          <img
            src="/images/stress.svg"
            alt="Stress Level Icon"
            className="w-full h-full object-cover"
          />
        </figure>

        <div className="flex flex-col h-fit">
          <h2 className="flex text-xl font-bold">Tingkat Stress</h2>
          <p className="flex text-sm font-semibold">Status</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 min-h-[80px] md:min-h-0 text-center">
        <p className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {displayLabel}
        </p>
        {confidenceText && (
          <p className="mt-1 text-sm font-medium text-white/80">
            {confidenceText}
          </p>
        )}
      </div>
    </div>
  );
}
