import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  Thermometer,
  Zap,
  Calendar,
  Clock,
} from "lucide-react";
import { authFetch, API_BASE_URL } from "../lib/api";

const DEFAULT_API_BASE_URL =
  "https://premedical-caryl-gawkishly.ngrok-free.dev";
const sanitizeBaseUrl = (url) => (url.endsWith("/") ? url.slice(0, -1) : url);
const API_BASE_URL = sanitizeBaseUrl(
  import.meta.env.VITE_STRESS_API_BASE || DEFAULT_API_BASE_URL
);

const formatTimestampID = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";

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

export default function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [stressHistory, setStressHistory] = useState(null);
  const [sensorReadings, setSensorReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch stress history
        const historyResponse = await fetch(
          `${API_BASE_URL}/api/sessions/${sessionId}/stress-history`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!historyResponse.ok) {
          throw new Error("Failed to fetch stress history");
        }

        const historyJson = await historyResponse.json();
        if (historyJson?.success && historyJson.data?.length > 0) {
          setStressHistory(historyJson.data[0]);
        }

        // Fetch sensor readings
        const readingsResponse = await fetch(
          `${API_BASE_URL}/api/sessions/${sessionId}/sensor-readings`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!readingsResponse.ok) {
          throw new Error("Failed to fetch sensor readings");
        }

        const readingsJson = await readingsResponse.json();
        if (readingsJson?.success && Array.isArray(readingsJson.data)) {
          setSensorReadings(readingsJson.data);
        }
      } catch (err) {
        console.error("Error fetching session data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail sesi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getStressLevelColor = (label) => {
    const lowerLabel = label?.toLowerCase() || "";
    if (lowerLabel.includes("normal") || lowerLabel.includes("low")) {
      return "bg-gradient-to-r from-green-500 to-emerald-400";
    } else if (lowerLabel.includes("high") || lowerLabel.includes("berat")) {
      return "bg-gradient-to-r from-red-500 to-rose-400";
    } else {
      return "bg-gradient-to-r from-yellow-500 to-amber-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali ke Dashboard</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-800">
            Detail Sesi Pengukuran
          </h1>
          <p className="text-gray-600 mt-1">Session ID: {sessionId}</p>
        </motion.div>

        {/* Stress History Card */}
        {stressHistory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Hasil Klasifikasi Stress
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Stress Level Badge */}
              <div className="space-y-4">
                <div
                  className={`${getStressLevelColor(
                    stressHistory.label
                  )} rounded-xl p-6 text-white`}
                >
                  <div className="text-sm opacity-90 mb-1">Status Stress</div>
                  <div className="text-3xl font-bold">
                    {stressHistory.label}
                  </div>
                  <div className="text-sm opacity-90 mt-2">
                    Confidence:{" "}
                    {(stressHistory.confidence_level * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Timestamp */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Waktu Pengukuran
                    </span>
                  </div>
                  <div className="text-gray-800 font-semibold">
                    {formatTimestampID(stressHistory.timestamp)}
                  </div>
                </div>
              </div>

              {/* Sensor Averages */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Rata-rata Sensor (10 Detik Terakhir)
                </h3>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-red-600" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Heart Rate</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {stressHistory.hr}{" "}
                        <span className="text-sm font-normal">BPM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-lg p-4 border border-rose-100">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-8 h-8 text-rose-600" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Temperature</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {stressHistory.temp}{" "}
                        <span className="text-sm font-normal">°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">EDA / GSR</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {stressHistory.eda?.toFixed(3)}{" "}
                        <span className="text-sm font-normal">µS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {stressHistory.notes && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="font-semibold text-gray-700 mb-1">Catatan:</div>
                <div className="text-gray-600">{stressHistory.notes}</div>
              </div>
            )}
          </motion.div>
        )}

        {/* Sensor Readings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Data Sensor Per Detik ({sensorReadings.length} pembacaan)
          </h2>

          {sensorReadings.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p>Tidak ada data sensor untuk sesi ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2">
                {sensorReadings.map((reading, index) => (
                  <motion.div
                    key={reading.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center text-sm">
                          #{index + 1}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatTimestampID(reading.timestamp)}
                        </div>
                      </div>

                      <div className="flex gap-6 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-600">HR:</span>
                          <span className="font-semibold text-gray-800">
                            {reading.hr} BPM
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-rose-500" />
                          <span className="text-sm text-gray-600">Temp:</span>
                          <span className="font-semibold text-gray-800">
                            {reading.temp} °C
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600">EDA:</span>
                          <span className="font-semibold text-gray-800">
                            {reading.eda?.toFixed(3)} µS
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (delete) */}
                      <div className="flex items-center gap-2">
                        {localStorage.getItem("access_token") ? (
                          <button
                            onClick={async () => {
                              const ok = window.confirm(
                                "Hapus pembacaan sensor ini?"
                              );
                              if (!ok) return;
                              try {
                                const resp = await authFetch(
                                  `${API_BASE_URL}/api/sensor-readings/${reading.id}`,
                                  { method: "DELETE" }
                                );
                                if (!resp.ok) {
                                  const txt = await resp.text();
                                  throw new Error(txt || "Delete failed");
                                }
                                // remove from UI
                                setSensorReadings((prev) =>
                                  prev.filter((p) => p.id !== reading.id)
                                );
                              } catch (err) {
                                console.error("Delete error:", err);
                                alert(
                                  "Gagal menghapus: " + (err.message || err)
                                );
                              }
                            }}
                            className="px-3 py-1 text-xs bg-rose-500 hover:bg-rose-600 text-white rounded-md"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
