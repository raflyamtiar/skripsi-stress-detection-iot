import { useState, useEffect } from "react";
import SensorCard from "../components/SensorCard";
import StressLevelCard from "../components/StressLevelCard";
import RecordsTable from "../components/RecordsTable";
import StressWarningModal from "../components/StressWarningModal";
import MusicPlayer from "../components/MusicPlayer";

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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  const now = "25/08/25 19:12:12";
  const sample = { hr: 105, temp: 32.5, gsr: 15.345, timestamp: now };
  const levelText = classifyFallback(sample);

  useEffect(() => {
    if (levelText === "Stress Berat" && !hasShownWarning) {
      setShowWarningModal(true);
      setHasShownWarning(true);
    }
  }, [levelText, hasShownWarning]);

  const handleListenMusic = () => {
    setShowWarningModal(false);
    setShowMusicPlayer(true);
  };

  const handleCloseModal = () => {
    setShowWarningModal(false);
  };

  const handleCloseMusicPlayer = () => {
    setShowMusicPlayer(false);
  };

  const rows = [
    {
      timestamp: now,
      hr: 90,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 80,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    { timestamp: now, hr: 70, temp: 34.45, gsr: 12.234, level: "Normal" },
    { timestamp: now, hr: 60, temp: 34.45, gsr: 12.234, level: "Normal" },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    {
      timestamp: now,
      hr: 90,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 80,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    { timestamp: now, hr: 70, temp: 34.45, gsr: 12.234, level: "Normal" },
    { timestamp: now, hr: 60, temp: 34.45, gsr: 12.234, level: "Normal" },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 90,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 80,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    { timestamp: now, hr: 70, temp: 34.45, gsr: 12.234, level: "Normal" },
    { timestamp: now, hr: 60, temp: 34.45, gsr: 12.234, level: "Normal" },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    { timestamp: now, hr: 80, temp: 34.45, gsr: 2.234, level: "Normal" },
    {
      timestamp: now,
      hr: 90,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 80,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    { timestamp: now, hr: 70, temp: 34.45, gsr: 12.234, level: "Normal" },
    { timestamp: now, hr: 60, temp: 34.45, gsr: 12.234, level: "Normal" },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 100,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 90,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
    {
      timestamp: now,
      hr: 80,
      temp: 34.45,
      gsr: 12.234,
      level: "Stress Sedang",
    },
  ];

  return (
    <>
      <div className="flex flex-col px-4 py-8 md:px-8">
        <div className="flex mb-6 justify-start self-start">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Status Anda Saat ini{" "}
            <span role="img" aria-label="meditasi">
              🧘
            </span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row-reverse gap-4 mb-4 md:p-0">
          <div className="flex w-full md:max-w-[300px]">
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

          <div className="flex flex-1 gap-4 flex-col md:flex-row-reverse">
            <div className="flex w-full md:max-w-[300px]">
              <SensorCard
                title="Galvanic Skin Response"
                bgColor="bg-gradient-to-r from-blue-400 to-green-300"
                icon={
                  <img
                    src="/images/gsr.svg"
                    alt="Galvanic Skin Response"
                    className="w-full h-full object-cover"
                  />
                }
                value={sample.gsr.toFixed(3)}
                isGSR={true}
                unit="µS"
                subtitle="MikroSiemens"
              />
            </div>

            <div className="flex flex-row w-full gap-4 h-full">
              <div className="flex justify-center items-center w-full min-h-full">
                <SensorCard
                  title="Heart Rate"
                  bgColor="bg-gradient-to-r from-red-500 to-orange-500"
                  icon={
                    <img
                      src="/images/hr.svg"
                      alt="Heart Rate"
                      className="w-full h-full object-cover"
                    />
                  }
                  value={sample.hr}
                  unit="BPM"
                  subtitle="Beat per Minute"
                />
              </div>

              <div className="flex justify-center items-center w-full h-full">
                <SensorCard
                  title="Skin Temperature"
                  bgColor="bg-gradient-to-r from-rose-400 to-amber-300"
                  icon={
                    <img
                      src="/images/temp.svg"
                      alt="Skin Temperature "
                      className="w-full h-full object-cover"
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

        <div className="flex w-full">
          <RecordsTable rows={rows} />
        </div>
      </div>

      <StressWarningModal
        isOpen={showWarningModal}
        onClose={handleCloseModal}
        onListenMusic={handleListenMusic}
      />

      <MusicPlayer isOpen={showMusicPlayer} onClose={handleCloseMusicPlayer} />
    </>
  );
}
