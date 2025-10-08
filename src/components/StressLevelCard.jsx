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
    <div className={`rounded-lg p-5 shadow-lg border ${tone}`}>
      <div className="flex items-start gap-1">
        <img
          src="/images/stress.svg" // Ganti dengan path file SVG yang sesuai
          alt="Stress Level Icon"
          width={50}
          height={50}
        />
        <div className="w-full">
          <h3 className="font-semibold">Tingkat Stress</h3>
          <p className="text-xs text-zinc-600">Status</p>
          <div className="m-3">
            <p className="text-2xl font-extrabold">{label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
