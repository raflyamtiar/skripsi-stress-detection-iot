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
    <div className={`${bgColor} relative flex flex-col p-4 rounded-lg w-full text-white gap-2 ${isGSR ? "min-h-0" : "min-h-full"}`}>
      {/* Versi Ikon di belakang absolue tengah */}
      {!isGSR && (
        <figure className="flex absolute justify-center items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden opacity-50">
          {icon}
        </figure>
      )}

      {isGSR && (
        <figure className="flex h-16 w-16 absolute justify-center items-center top-1/2 left-4 transform -translate-y-1/2 md:hidden">
          {icon}
        </figure>
      )}

      {/* Header */}
      <div className="flex gap-5 items-center">
        {/* icon */}
        <figure className="relative w-12 h-12 hidden md:flex">
          {icon}
        </figure>

        <div className={`flex flex-col items-center md:items-center w-full justify-center ${isGSR ? "min-h-0" : "min-h-[50px] md:min-h-0"}`}>
          <h2 className="flex text-xl font-bold md:self-start text-center md:text-left">
            {title}
          </h2>
        </div>
      </div>

      {/* Value */}
      <div className="relative flex items-start self-center justify-center gap-1 w-fit flex-1">
        <div className="flex flex-col">
          {/* Value and unit */}
          <div className={`flex gap-1 ${subtitle === 'Celcius' ? "items-start" : "items-end"}`}>
            <p className="flex text-4xl font-extrabold md:font-bold">{value}</p>
            <p className="flex text-lg items-end h-full font-extrabold md:font-bold">{unit}</p>
          </div>

          {/* Subtitle */}
          <p className="flex text-xs md:text-sm font-normal">{subtitle}</p>
        </div>

      {/* Versi Icon di samping kanan */}
        {/* {!isGSR && (
          <figure className="flex justify-center items-center md:hidden w-auto h-16 self-center">
            {icon}
          </figure>
        )} */}
      </div>
    </div>
  );
}
