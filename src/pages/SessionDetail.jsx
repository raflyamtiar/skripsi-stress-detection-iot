import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  Thermometer,
  Zap,
  Calendar,
  Clock,
  Edit3,
  X,
} from "lucide-react";
import { authFetch, API_BASE_URL, getUser } from "../lib/api";

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
  const [authUser] = useState(getUser());
  
  // Session info
  const [sessionName, setSessionName] = useState("");
  
  // Modal state for updating session name
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleOpenUpdateModal = () => {
    setNewSessionName(sessionName || "");
    setShowUpdateModal(true);
  };

  const handleUpdateSessionName = async () => {
    if (!newSessionName.trim()) {
      alert("Nama session tidak boleh kosong");
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await authFetch(
        `${API_BASE_URL}/api/sessions/${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newSessionName.trim(),
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to update session");
      }

      setSessionName(newSessionName.trim());
      setShowUpdateModal(false);
      setNewSessionName("");
    } catch (err) {
      console.error("Error updating session:", err);
      alert("Gagal update nama session: " + (err.message || err));
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch session info first to get the name
        const sessionResponse = await fetch(
          `${API_BASE_URL}/api/sessions/${sessionId}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (sessionResponse.ok) {
          const sessionJson = await sessionResponse.json();
          if (sessionJson?.success && sessionJson.data?.name) {
            setSessionName(sessionJson.data.name);
          }
        }

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
          
          {sessionName ? (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                📋 {sessionName}
              </span>
              {authUser && (
                <button
                  onClick={handleOpenUpdateModal}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  title="Update nama session"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-2">
              <p className="text-gray-600">Session ID: {sessionId}</p>
              {authUser && (
                <button
                  onClick={handleOpenUpdateModal}
                  className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Beri Nama
                </button>
              )}
            </div>
          )}
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

      {/* Update Session Name Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !updateLoading && setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Edit3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Update Nama Session</h3>
                      <p className="text-sm text-blue-100">
                        Berikan nama yang mudah diingat
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => !updateLoading && setShowUpdateModal(false)}
                    className="text-white/80 hover:text-white transition-colors"
                    disabled={updateLoading}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Session
                  </label>
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Contoh: Pengukuran Pagi Hari"
                    maxLength={255}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    disabled={updateLoading}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Maksimal 255 karakter
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => !updateLoading && setShowUpdateModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    disabled={updateLoading}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdateSessionName}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={updateLoading || !newSessionName.trim()}
                  >
                    {updateLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        <span>Simpan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
