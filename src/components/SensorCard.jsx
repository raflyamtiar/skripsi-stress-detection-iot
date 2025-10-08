export default function SensorCard({
  title,
  icon,
  value,
  unit,
  subtitle,
  isGSR = false,
  bgColor = "bg-gradient-to-r from-blue-500 to-blue-300",
}) {
  return (
    <div className={`rounded-lg ${bgColor} p-2 shadow-lg flex w-full justify-center items-center ${!isGSR && "min-h-[150px]"}`}>
      <div className="relative flex justify-center items-center w-full object-center obejct-cover gap-4">
        {isGSR && (
          <figure
            className={"absolute left-3 flex scale-[1.2] flex items-center justify-center"}
          >
            {icon}
          </figure>
        )}

        <div
          className={`flex w-full flex-col max-w-2xl flex-1 ${
            isGSR && "items-center ml-16"
          }`}
        >
          <h3 className="font-semibold text-white text-xl mb-2 text-center">{title}</h3>
          <div className="flex">
            <div className="flex flex-col">
              <div className="relative">
                <span className="text-4xl font-extrabold tracking-tight text-white">
                  {value}
                </span>
                <span className="text-lg font-semibold text-white">{unit}</span>
              </div>
              <p className={`text-xs text-white/80 text-center ${!isGSR && "absolute -bottom-2 "}`}>{subtitle}</p>
            </div>
            {!isGSR && <figure className={`flex w-fit h-fit`}>{icon}</figure>}
          </div>
        </div>
      </div>
    </div>
  );
}
