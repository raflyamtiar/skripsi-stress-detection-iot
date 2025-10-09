const COLORS = {
  normal:
    "bg-gradient-to-r from-green-500 to-green-300 text-green-900 border-green-300", // Gradasi Hijau Pekat
  sedang:
    "bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900 border-yellow-300", // Gradasi Kuning Pekat
  berat: "bg-gradient-to-r from-red-500 to-red-400 text-red-900 border-red-300", // Gradasi Merah Pekat
};

export default function StressLevelCard({ level = "sedang" }) {
  const tone =
    level === "normal"
      ? COLORS.normal
      : level === "berat"
      ? COLORS.berat
      : COLORS.sedang;

  const label =
    level === "normal"
      ? "Normal"
      : level === "berat"
      ? "Stress Berat"
      : "Stress Sedang";

  return (
    <div
      className={`p-6 flex w-full justify-center items-center rounded-lg shadow-lg border ${tone}`}
    >
      <div className="flex flex-col items-start gap-6 w-full">
        {/* Header Ttile */}
        <div className="flex gap-2 w-full">
          <img
            src="/images/stress.svg"
            alt="Stress Level Icon"
            width={50}
            height={50}
          />

          <div className="flex flex-col justify-between">
            <h3 className="font-semibold text-2xl">Tingkat Stress</h3>
            <p className="text-xs text-zinc-600">Status</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex w-full justify-center">
          <p className="flex text-4xl font-extrabold">{label}</p>
        </div>
      </div>
    </div>
  );
}
