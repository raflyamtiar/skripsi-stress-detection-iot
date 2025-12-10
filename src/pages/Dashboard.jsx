import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
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
  // Measurement state: 'idle' | 'measuring' | 'done'
  const [measurementState, setMeasurementState] = useState("idle");
  const [countdown, setCountdown] = useState(60);
  const [measurementData, setMeasurementData] = useState([]);
  const [averageHistory, setAverageHistory] = useState([]); // History of averages
  const [currentAverage, setCurrentAverage] = useState(null); // Rata-rata sesi saat ini

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // WebSocket state
  const [sensorData, setSensorData] = useState([]);
  const [currentSensorData, setCurrentSensorData] = useState({
    hr: 0,
    temp: 0,
    gsr: 0,
    timestamp: new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  });
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const currentSensorDataRef = useRef(currentSensorData); // Ref untuk akses real-time data

  const levelText = classifyFallback(currentSensorData);

  // Update ref setiap kali currentSensorData berubah
  useEffect(() => {
    currentSensorDataRef.current = currentSensorData;
  }, [currentSensorData]);

  // WebSocket connection setup
  useEffect(() => {
    // const WEBSOCKET_URL =
    // import.meta.env.VITE_WEBSOCKET_URL || "ws://127.0.0.1:5000";
    const WEBSOCKET_URL = "ws://premedical-caryl-gawkishly.ngrok-free.dev";
    const socketPath = "/socket.io/?EIO=4&transport=websocket&type=frontend";

    console.log("Connecting to WebSocket:", WEBSOCKET_URL);

    // Initialize socket connection
    socketRef.current = io(WEBSOCKET_URL, {
      path: "/socket.io/",
      transports: ["websocket"],
      query: {
        EIO: 4,
        transport: "websocket",
        type: "frontend",
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("✅ WebSocket connected successfully!");
      console.log("Socket ID:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      setIsConnected(false);
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Reconnection attempt #${attemptNumber}`);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    // Function to process sensor data (reusable for multiple events)
    const processSensorData = (data, eventName) => {
      console.log(`📊 Received data from [${eventName}]:`, data);

      const timestamp = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const newData = {
        hr: data.hr || data.heartRate || 0,
        temp: data.temp || data.temperature || 0,
        gsr: data.gsr || data.eda || data.galvanicSkinResponse || 0, // Support eda field
        timestamp: timestamp,
      };

      const level = classifyFallback(newData);

      setCurrentSensorData(newData);
      setSensorData((prevData) => [
        { ...newData, level },
        ...prevData.slice(0, 49), // Keep last 50 records
      ]);
    };

    // Listen for all possible sensor data events
    socket.on("sensor_data", (data) => {
      processSensorData(data, "sensor_data");
    });

    socket.on("esp32_live_data", (data) => {
      processSensorData(data, "esp32_live_data");
    });

    socket.on("live_sensor_data", (data) => {
      processSensorData(data, "live_sensor_data");
    });

    // Debug: Log ALL incoming events
    socket.onAny((eventName, ...args) => {
      console.log(`🔔 Event received: "${eventName}"`, args);
    });

    // Cleanup on unmount
    return () => {
      console.log("Disconnecting WebSocket...");
      socket.disconnect();
    };
  }, []);

  // Countdown and measurement logic
  useEffect(() => {
    if (measurementState === "measuring") {
      // Start countdown from 60
      setCountdown(60);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          const newCount = prev - 1;

          // Save current sensor data to localStorage every second
          // Use ref to get latest data without causing re-render loop
          const now = new Date();
          const timestamp = now.toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          const currentSecond = 61 - prev; // Second 1 to 60
          const measurementEntry = {
            second: currentSecond,
            hr: currentSensorDataRef.current.hr,
            temp: currentSensorDataRef.current.temp,
            gsr: currentSensorDataRef.current.gsr,
            timestamp: timestamp,
          };

          // Get existing data from localStorage
          const existingData = JSON.parse(
            localStorage.getItem("measurementData") || "[]"
          );
          existingData.push(measurementEntry);

          // Simpan data lengkap (detik 1-60)
          localStorage.setItem("measurementData", JSON.stringify(existingData));

          // Update last10Seconds saat detik 51-60 (real-time update setiap detik)
          if (currentSecond >= 51 && currentSecond <= 60) {
            // Ambil 10 data terakhir (detik 51-60)
            const last10 = existingData.slice(-10);
            // Replace last10Seconds (bukan append)
            localStorage.setItem("last10Seconds", JSON.stringify(last10));
          }

          setMeasurementData(existingData);

          // When countdown reaches 0, move to done state
          if (newCount <= 0) {
            clearInterval(countdownIntervalRef.current);

            // HANYA saat countdown = 0, hitung rata-rata dari last10Seconds
            const last10Data = JSON.parse(
              localStorage.getItem("last10Seconds") || "[]"
            );

            if (last10Data.length > 0) {
              // Hitung rata-rata dari 10 detik terakhir
              const avgHr =
                last10Data.reduce((sum, d) => sum + d.hr, 0) /
                last10Data.length;
              const avgTemp =
                last10Data.reduce((sum, d) => sum + d.temp, 0) /
                last10Data.length;
              const avgGsr =
                last10Data.reduce((sum, d) => sum + d.gsr, 0) /
                last10Data.length;

              // Classify stress level berdasarkan rata-rata
              const avgStressLevel = classifyFallback({
                hr: avgHr,
                temp: avgTemp,
                gsr: avgGsr,
              });

              const averageData = {
                hr: parseFloat(avgHr.toFixed(2)),
                temp: parseFloat(avgTemp.toFixed(2)),
                gsr: parseFloat(avgGsr.toFixed(3)),
                level: avgStressLevel,
                period: "Detik 51-60",
                timestamp: timestamp,
              };

              // Append to last10SecondsAverage (push, bukan replace)
              const existingAverages = JSON.parse(
                localStorage.getItem("last10SecondsAverage") || "[]"
              );
              existingAverages.push(averageData);
              localStorage.setItem(
                "last10SecondsAverage",
                JSON.stringify(existingAverages)
              );

              // Simpan rata-rata untuk ditampilkan di cards
              setCurrentAverage(averageData);
              // Update state history untuk tabel
              setAverageHistory(existingAverages);
            }

            setMeasurementState("done");
            return 0;
          }

          return newCount;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [measurementState]); // Hanya trigger saat measurementState berubah, bukan currentSensorData

  // Start measurement handler
  const handleStartMeasurement = () => {
    // Clear previous measurement data - all keys
    localStorage.removeItem("measurementData");
    localStorage.removeItem("last10Seconds");
    localStorage.removeItem("last10SecondsAverage");
    setMeasurementData([]);
    setAverageHistory([]);
    setMeasurementState("measuring");
  };

  // Reset to idle state
  const handleResetMeasurement = () => {
    setMeasurementState("idle");
    setCountdown(60);
    setHasShownWarning(false);
  };

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

  return (
    <>
      <div className="flex flex-col px-4 pt-8 pb-6 md:px-8 min-h-screen">
        {/* Header */}
        <div className="flex mb-6 justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Status Anda Saat ini{" "}
            <span role="img" aria-label="meditasi">
              🧘
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* IDLE STATE - Show Start Button */}
        <AnimatePresence mode="wait">
          {measurementState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center flex-1 min-h-[500px]"
            >
              <motion.button
                onClick={handleStartMeasurement}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>

                {/* Main circular button */}
                <div className="relative w-64 h-64 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex flex-col items-center justify-center shadow-2xl transform transition-transform">
                  <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                    <div className="text-6xl mb-2">🧘‍♀️</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Mulai Mengukur
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      Tap untuk memulai
                    </div>
                  </div>
                </div>
              </motion.button>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 text-gray-600 text-center max-w-md"
              >
                Pastikan sensor sudah terpasang dengan baik sebelum memulai
                pengukuran
              </motion.p>
            </motion.div>
          )}

          {/* MEASURING STATE - Show 3 Cards + Countdown */}
          {measurementState === "measuring" && (
            <motion.div
              key="measuring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Countdown and Status */}
              <div className="mb-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
                >
                  {countdown}
                </motion.div>
                <div className="text-xl text-gray-700 font-semibold mb-2">
                  Sedang mengukur, harap tunggu...
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    ⚡
                  </motion.div>
                  <span>Pengukuran berlangsung {60 - countdown} detik</span>
                </div>
              </div>

              {/* 3 Sensor Cards with real-time values */}
              <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1"
                >
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12">
                        <img
                          src="/images/hr.svg"
                          alt="Heart Rate"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Heart Rate</h3>
                        <p className="text-sm opacity-90">Beat per Minute</p>
                      </div>
                    </div>
                    <motion.div
                      key={currentSensorData.hr}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-5xl font-bold"
                    >
                      {currentSensorData.hr || 0}
                    </motion.div>
                    <div className="text-sm mt-2 opacity-75">BPM</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1"
                >
                  <div className="bg-gradient-to-r from-rose-400 to-amber-300 rounded-2xl p-6 text-white shadow-lg h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12">
                        <img
                          src="/images/temp.svg"
                          alt="Skin Temperature"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Skin Temperature</h3>
                        <p className="text-sm opacity-90">Celcius</p>
                      </div>
                    </div>
                    <motion.div
                      key={currentSensorData.temp}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-5xl font-bold"
                    >
                      {currentSensorData.temp?.toFixed(1) || "0.0"}
                    </motion.div>
                    <div className="text-sm mt-2 opacity-75">°C</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1"
                >
                  <div className="bg-gradient-to-r from-blue-400 to-green-300 rounded-2xl p-6 text-white shadow-lg h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12">
                        <img
                          src="/images/gsr.svg"
                          alt="Galvanic Skin Response"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">GSR</h3>
                        <p className="text-sm opacity-90">MikroSiemens</p>
                      </div>
                    </div>
                    <motion.div
                      key={currentSensorData.gsr}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-5xl font-bold"
                    >
                      {currentSensorData.gsr?.toFixed(3) || "0.000"}
                    </motion.div>
                    <div className="text-sm mt-2 opacity-75">µS</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* DONE STATE - Show All 4 Cards */}
          {measurementState === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Success Message */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-6 text-center"
              >
                <div className="text-4xl mb-2">✅</div>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  Pengukuran Selesai!
                </div>
                <div className="text-gray-600 mb-4">
                  Data rata-rata tersimpan ({averageHistory.length} rata-rata
                  dari 10 detik terakhir)
                </div>
                <button
                  onClick={handleResetMeasurement}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-colors"
                >
                  Ukur Lagi
                </button>
              </motion.div>

              <div className="flex flex-col md:flex-row-reverse gap-4 mb-4 md:p-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex w-full md:max-w-[300px]"
                >
                  <StressLevelCard
                    level={
                      currentAverage
                        ? currentAverage.level === "Normal"
                          ? "normal"
                          : currentAverage.level === "Stress Berat"
                          ? "berat"
                          : "sedang"
                        : "normal"
                    }
                  />
                </motion.div>

                <div className="flex flex-1 gap-4 flex-col md:flex-row-reverse">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex w-full md:max-w-[300px]"
                  >
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
                      value={
                        currentAverage ? currentAverage.gsr.toFixed(3) : "0.000"
                      }
                      isGSR={true}
                      unit="µS"
                      subtitle="MikroSiemens"
                    />
                  </motion.div>

                  <div className="flex flex-row w-full gap-4 h-full">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex justify-center items-center w-full min-h-full"
                    >
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
                        value={currentAverage ? currentAverage.hr : 0}
                        unit="BPM"
                        subtitle="Beat per Minute"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-center items-center w-full h-full"
                    >
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
                        value={currentAverage ? currentAverage.temp : 0}
                        unit="°C"
                        subtitle="Celcius"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex w-full"
              >
                <RecordsTable rows={averageHistory} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
