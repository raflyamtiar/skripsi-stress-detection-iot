const COLORS = {
  normal:
    "bg-gradient-to-r from-green-500 to-green-300 text-green-900 border-green-300",
  sedang:
    "bg-gradient-to-r from-yellow-500 to-yellow-300 text-yellow-900 border-yellow-300",
  berat: "bg-gradient-to-r from-red-500 to-red-400 text-red-900 border-red-300",
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
    <div className={`flex flex-col ${tone} w-full p-4 rounded-lg`}>
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

      <div className="flex items-center justify-center flex-1 min-h-[80px] md:min-h-0">
        <p className="flex text-4xl font-extrabold md:font-bold">{label}</p>
      </div>
    </div>
  );
}
