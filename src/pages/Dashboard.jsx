import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import SensorCard from "../components/SensorCard";
import StressLevelCard from "../components/StressLevelCard";
import RecordsTable from "../components/RecordsTable";
import StressWarningModal from "../components/StressWarningModal";
import MusicPlayer from "../components/MusicPlayer";
import ConnectionStatusModal from "../components/ConnectionStatusModal";
import LoadingModal from "../components/LoadingModal";

const DEFAULT_API_BASE_URL =
  "https://premedical-caryl-gawkishly.ngrok-free.dev";

const sanitizeBaseUrl = (url) => (url.endsWith("/") ? url.slice(0, -1) : url);

const API_BASE_URL = sanitizeBaseUrl(
  import.meta.env.VITE_STRESS_API_BASE || DEFAULT_API_BASE_URL
);

const PREDICT_ENDPOINT =
  import.meta.env.VITE_PREDICT_STRESS_URL ||
  `${API_BASE_URL}/api/predict-stress`;

const HISTORY_ENDPOINT =
  import.meta.env.VITE_STRESS_HISTORY_URL ||
  `${API_BASE_URL}/api/stress-history`;

const formatTimestampID = (dateInput) => {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const normalizeHistoryRow = (entry) => ({
  id: entry.id,
  timestamp: formatTimestampID(entry.timestamp || entry.created_at),
  hr: entry.hr,
  temp: entry.temp,
  gsr: entry.eda,
  level: entry.label,
});

export default function Dashboard() {
  // Measurement state: 'idle' | 'measuring' | 'done'
  const [measurementState, setMeasurementState] = useState("idle");
  const [countdown, setCountdown] = useState(60);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [resultError, setResultError] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

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

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(HISTORY_ENDPOINT, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      const json = await response.json();
      if (json?.success && Array.isArray(json.data)) {
        const mapped = json.data
          .slice()
          .sort(
            (a, b) =>
              new Date(b.timestamp || b.created_at) -
              new Date(a.timestamp || a.created_at)
          )
          .map(normalizeHistoryRow);
        setHistoryRows(mapped);
      } else {
        setHistoryRows([]);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat stress:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const submitPrediction = useCallback(
    async ({ hr, temp, gsr, timestamp }, last10Data = null) => {
      setIsSubmittingResult(true);
      setResultError(null);
      setPredictionResult(null);
      setShowLoadingModal(true); // Tampilkan loading modal

      try {
        // Step 1: POST ke /predict-stress untuk klasifikasi
        const response = await fetch(PREDICT_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ hr, temp, eda: gsr }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit prediction");
        }

        const json = await response.json();
        const data = json?.data;

        if (!json?.success || !data) {
          throw new Error("Invalid response body");
        }

        // Ambil session_id dari response
        const sessionId = json.session_id;

        setPredictionResult({
          label: data.label,
          confidence: data.confidence_level,
          hr: data.hr,
          temp: data.temp,
          gsr: data.eda,
          timestamp,
          historyId: json.history_id,
          sessionId: sessionId,
        });

        // Step 2: Jika ada session_id dan last10Data, kirim bulk readings
        if (sessionId && last10Data && last10Data.readings) {
          const bulkEndpoint = `${API_BASE_URL}/api/sessions/${sessionId}/sensor-readings/bulk`;

          try {
            const bulkResponse = await fetch(bulkEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
              body: JSON.stringify(last10Data), // {readings: [{hr, temp, eda}]}
            });

            if (!bulkResponse.ok) {
              console.error(
                "Failed to submit bulk readings:",
                await bulkResponse.text()
              );
            } else {
              console.log("✅ Bulk readings submitted successfully");
            }
          } catch (bulkError) {
            console.error("Error submitting bulk readings:", bulkError);
            // Don't throw, karena klasifikasi sudah berhasil
          }
        }

        await fetchHistory();
      } catch (error) {
        console.error("Gagal mengirim hasil pengukuran:", error);
        setResultError(
          "Gagal mengirim hasil ke server. Silakan mulai ulang pengukuran."
        );
      } finally {
        setIsSubmittingResult(false);
        setShowLoadingModal(false); // Sembunyikan loading modal
      }
    },
    [fetchHistory]
  );

  // Update ref setiap kali currentSensorData berubah
  useEffect(() => {
    currentSensorDataRef.current = currentSensorData;
  }, [currentSensorData]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // WebSocket connection setup
  useEffect(() => {
    const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;
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

      setCurrentSensorData(newData);
      setSensorData((prevData) => [
        newData,
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

          // Update last10Seconds saat detik 51-60 dengan format baru
          if (currentSecond >= 51 && currentSecond <= 60) {
            // Ambil 10 data terakhir (detik 51-60)
            const last10Raw = existingData.slice(-10);
            // Format menjadi {readings: [{hr, temp, eda}]}
            const last10Formatted = {
              readings: last10Raw.map((item) => ({
                hr: item.hr,
                temp: item.temp,
                eda: item.gsr, // gsr -> eda
              })),
            };
            // Replace last10Seconds (bukan append)
            localStorage.setItem(
              "last10Seconds",
              JSON.stringify(last10Formatted)
            );
          }

          // When countdown reaches 0, move to done state
          if (newCount <= 0) {
            clearInterval(countdownIntervalRef.current);

            // Ambil data 10 detik terakhir dari localStorage
            const last10DataStr = localStorage.getItem("last10Seconds");
            const last10Data = last10DataStr ? JSON.parse(last10DataStr) : null;

            if (
              last10Data &&
              last10Data.readings &&
              last10Data.readings.length > 0
            ) {
              // Hitung rata-rata dari 10 detik terakhir untuk klasifikasi
              const avgHr =
                last10Data.readings.reduce((sum, d) => sum + d.hr, 0) /
                last10Data.readings.length;
              const avgTemp =
                last10Data.readings.reduce((sum, d) => sum + d.temp, 0) /
                last10Data.readings.length;
              const avgEda =
                last10Data.readings.reduce((sum, d) => sum + d.eda, 0) /
                last10Data.readings.length;

              // Kirim rata-rata ke /predict-stress dan simpan last10Data untuk bulk
              submitPrediction(
                {
                  hr: parseFloat(avgHr.toFixed(2)),
                  temp: parseFloat(avgTemp.toFixed(2)),
                  gsr: parseFloat(avgEda.toFixed(3)),
                  timestamp,
                },
                last10Data
              );
            } else {
              setResultError(
                "Data sensor tidak cukup untuk dikirim. Silakan ulangi pengukuran."
              );
              setPredictionResult(null);
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
  }, [measurementState, submitPrediction]); // Hanya trigger saat measurementState berubah, bukan currentSensorData

  // Start measurement handler
  const handleStartMeasurement = () => {
    // Clear previous measurement data - all keys
    localStorage.removeItem("measurementData");
    localStorage.removeItem("last10Seconds");
    localStorage.removeItem("last10SecondsAverage");
    setPredictionResult(null);
    setResultError(null);
    setIsSubmittingResult(false);
    setShowWarningModal(false);
    setHasShownWarning(false);
    setMeasurementState("measuring");
  };

  // Reset to idle state
  const handleResetMeasurement = () => {
    setMeasurementState("idle");
    setCountdown(60);
    setHasShownWarning(false);
    setPredictionResult(null);
    setResultError(null);
    setIsSubmittingResult(false);
    setShowWarningModal(false);
    setShowMusicPlayer(false);
  };

  // Show modal ONLY when done state AND API indicates high stress
  useEffect(() => {
    const label = predictionResult?.label?.toLowerCase() || "";
    const isHighStress = label.includes("high") || label.includes("berat");

    if (
      measurementState === "done" &&
      isHighStress &&
      !hasShownWarning &&
      !isSubmittingResult &&
      !resultError
    ) {
      setShowWarningModal(true);
      setHasShownWarning(true);
    }
  }, [
    measurementState,
    predictionResult,
    hasShownWarning,
    isSubmittingResult,
    resultError,
  ]);

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

  const handleStartClick = () => {
    if (!isConnected) {
      setShowConnectionModal(true);
      return;
    }
    handleStartMeasurement();
  };

  const handleInterruptMeasurement = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    localStorage.removeItem("measurementData");
    localStorage.removeItem("last10Seconds");
    localStorage.removeItem("last10SecondsAverage");

    setShowWarningModal(false);
    setShowMusicPlayer(false);
    setHasShownWarning(false);
    setPredictionResult(null);
    setResultError(null);
    setIsSubmittingResult(false);
    setCountdown(60);
    setMeasurementState("idle");
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
                onClick={handleStartClick}
                whileHover={isConnected ? { scale: 1.05 } : {}}
                whileTap={isConnected ? { scale: 0.95 } : {}}
                className={`relative group ${
                  !isConnected ? "cursor-not-allowed" : ""
                }`}
                aria-disabled={!isConnected}
              >
                {/* Outer glow ring */}
                <div
                  className={`absolute inset-0 rounded-full blur-xl transition-opacity ${
                    isConnected
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 animate-pulse"
                      : "bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 opacity-60"
                  }`}
                ></div>

                {/* Main circular button */}
                <div
                  className={`relative w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all ${
                    isConnected
                      ? "bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500"
                      : "bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 saturate-75"
                  }`}
                >
                  <div
                    className={`absolute inset-2 rounded-full flex flex-col items-center justify-center ${
                      isConnected ? "bg-white" : "bg-white/80"
                    }`}
                  >
                    <div className="text-6xl mb-2">🧘‍♀️</div>
                    <div
                      className={`text-2xl font-bold bg-clip-text text-transparent ${
                        isConnected
                          ? "bg-gradient-to-r from-blue-600 to-purple-600"
                          : "bg-gradient-to-r from-slate-500 to-slate-600"
                      }`}
                    >
                      Mulai Mengukur
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {isConnected
                        ? "Tap untuk memulai"
                        : "Hubungkan sensor dulu"}
                    </div>
                  </div>

                  {!isConnected && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-md">
                      Sensor Offline
                    </div>
                  )}
                </div>
              </motion.button>

              {!isConnected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6 flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600"
                >
                  <span className="text-base">⚠️</span>
                  <span>
                    Periksa kembali koneksi perangkat sebelum memulai
                    pengukuran.
                  </span>
                </motion.div>
              )}

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

                <motion.button
                  onClick={handleInterruptMeasurement}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group mt-6 inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white/80 px-5 py-2 text-sm font-semibold text-rose-600 shadow-sm backdrop-blur"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 group-hover:animate-pulse"></span>
                  Hentikan Pengukuran
                </motion.button>
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
                <div className="text-gray-600 mb-1 min-h-[24px]">
                  {isSubmittingResult
                    ? "Mengirim hasil rata-rata ke server..."
                    : resultError
                    ? resultError
                    : predictionResult
                    ? `Hasil terbaru: ${predictionResult.label}`
                    : "Menunggu respons dari server..."}
                </div>
                {predictionResult?.timestamp && (
                  <div className="text-sm text-gray-500 mb-4">
                    Dicatat pada {predictionResult.timestamp}
                  </div>
                )}
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
                    label={
                      predictionResult?.label ||
                      (isSubmittingResult
                        ? "Mengirim data..."
                        : resultError
                        ? "Tidak tersedia"
                        : "Menunggu hasil")
                    }
                    confidence={predictionResult?.confidence}
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
                        predictionResult &&
                        typeof predictionResult.gsr === "number"
                          ? predictionResult.gsr.toFixed(3)
                          : "0.000"
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
                        value={
                          predictionResult &&
                          typeof predictionResult.hr === "number"
                            ? Math.round(predictionResult.hr)
                            : 0
                        }
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
                        value={
                          predictionResult &&
                          typeof predictionResult.temp === "number"
                            ? predictionResult.temp.toFixed(1)
                            : "0"
                        }
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
                <RecordsTable rows={historyRows} isLoading={historyLoading} />
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

      <ConnectionStatusModal
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
      />

      <LoadingModal
        isOpen={showLoadingModal}
        message="Menganalisis data sensor dan mengirim ke server..."
      />

      <MusicPlayer isOpen={showMusicPlayer} onClose={handleCloseMusicPlayer} />
    </>
  );
}
