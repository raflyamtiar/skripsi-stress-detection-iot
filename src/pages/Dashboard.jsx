// src/pages/Dashboard.jsx
import SensorCard from "../components/SensorCard";
import StressLevelCard from "../components/StressLevelCard";
import RecordsTable from "../components/RecordsTable";

function classifyFallback({ hr, gsr, temp }) {
  if (hr >= 60 && hr <= 90 && gsr < 5 && temp >= 33.5 && temp <= 36.9)
    return "Normal";
  if (
    hr > 90 &&
    hr <= 100 &&
    gsr >= 5 &&
    gsr <= 10 &&
    temp >= 33 &&
    temp <= 34.5
  )
    return "Stress Sedang";
  return "Stress Berat";
}

export default function Dashboard() {
  const now = "25/08/25 19:12:12";
  const sample = { hr: 95, temp: 33.5, gsr: 7.345, timestamp: now };
  const levelText = classifyFallback(sample);

  const rows = [
    { timestamp: now, hr: 90, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 70, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 60, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 100, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 100, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 100, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 100, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 100, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 100, temp: 34.45, gsr: 12.234, level: levelText },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: levelText },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: levelText },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: levelText },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: levelText },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: levelText },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: levelText },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: levelText },
  ];

  return (
    <div className="flex flex-col justify-center items-center px-6 py-8">
      {/* Header */}
      <div className="flex mb-6 justify-start self-start">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Status Anda Saat ini{" "}
          <span role="img" aria-label="meditasi">
            🧘
          </span>
        </h1>
      </div>

      {/* 4 kartu sejajar dengan warna gradasi */}
      <div className="flex flex-col justify-center items-center w-full max-w-4xl gap-4">
        <div className="flex w-full justify-center">
          <StressLevelCard
            level={
              levelText === "Normal"
                ? "normal"
                : levelText === "Stress Berat"
                ? "berat"
                : "sedang"
            }
          />
        </div>

        <div className="flex flex-col justify-center items-center w-full gap-4">
          <div className="flex justify-center items-center w-full">
            <SensorCard
              title="Galvanic Skin Response"
              bgColor="bg-gradient-to-r from-blue-400 to-green-300"
              icon={
                <img
                  src="/images/gsr.svg"
                  alt="Galvanic Skin Response"
                  width={60}
                  height={60}
                />
              }
              value={sample.gsr.toFixed(3)}
              isGSR={true}
              unit="µS"
              subtitle="MikroSiemens"
            />
          </div>

          <div className="flex flex-row justify-center items-center w-full gap-4">
            <div className="flex justify-center items-center w-full">
              <SensorCard
                title="Heart Rate"
                bgColor="bg-gradient-to-r from-red-500 to-orange-500"
                icon={
                  <img
                    src="/images/hr.svg"
                    alt="Heart Rate"
                    width={80}
                    height={80}
                  />
                }
                value={sample.hr}
                unit="BPM"
                subtitle="Beat per Minute"
              />
            </div>

            <div className="flex justify-center items-center w-full">
              <SensorCard
                title="Skin Temperature"
                bgColor="bg-gradient-to-r from-rose-400 to-amber-300" // Warna Kulit / Suhu Cream
                icon={
                  <img
                    src="/images/temp.svg"
                    alt="Skin Temperature "
                    width={80}
                    height={80}
                  />
                }
                value={sample.temp}
                unit="°C"
                subtitle="Celcius"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabel riwayat */}
      <RecordsTable rows={rows} />
    </div>
  );
}
