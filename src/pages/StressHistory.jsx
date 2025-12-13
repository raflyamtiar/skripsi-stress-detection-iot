import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  Thermometer,
  Zap,
  Calendar,
  Eye,
  FileText,
  Edit3,
  X,
} from "lucide-react";
import { authFetch, API_BASE_URL, getUser } from "../lib/api";

const HISTORY_ENDPOINT = `${API_BASE_URL}/api/stress-history`;

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

const getStressLevelColor = (label) => {
  const lowerLabel = label?.toLowerCase() || "";
  if (lowerLabel.includes("normal") || lowerLabel.includes("low")) {
    return {
      bg: "bg-gradient-to-r from-green-500 to-emerald-400",
      border: "border-green-200",
      text: "text-green-700",
      badge: "bg-green-100",
    };
  } else if (lowerLabel.includes("high") || lowerLabel.includes("berat")) {
    return {
      bg: "bg-gradient-to-r from-red-500 to-rose-400",
      border: "border-red-200",
      text: "text-red-700",
      badge: "bg-red-100",
    };
  } else {
    return {
      bg: "bg-gradient-to-r from-yellow-500 to-amber-400",
      border: "border-yellow-200",
      text: "text-yellow-700",
      badge: "bg-yellow-100",
    };
  }
};

export default function StressHistory() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser] = useState(getUser());
  
  // Modal state for updating session name
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleOpenUpdateModal = (sessionId, currentName) => {
    setSelectedSession(sessionId);
    setNewSessionName(currentName || "");
    setShowUpdateModal(true);
  };

  const handleUpdateSessionName = async () => {
    if (!selectedSession || !newSessionName.trim()) {
      alert("Nama session tidak boleh kosong");
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await authFetch(
        `${API_BASE_URL}/api/sessions/${selectedSession}`,
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

      // Update local data
      setHistoryData((prev) =>
        prev.map((entry) =>
          entry.session_id === selectedSession
            ? { ...entry, session_name: newSessionName.trim() }
            : entry
        )
      );

      setShowUpdateModal(false);
      setSelectedSession(null);
      setNewSessionName("");
    } catch (err) {
      console.error("Error updating session:", err);
      alert("Gagal update nama session: " + (err.message || err));
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

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
          const sorted = json.data
            .slice()
            .sort(
              (a, b) =>
                new Date(b.timestamp || b.created_at) -
                new Date(a.timestamp || a.created_at)
            );
          
          // Fetch session names for entries with session_id
          const enrichedData = await Promise.all(
            sorted.map(async (entry) => {
              if (entry.session_id) {
                try {
                  const sessionResponse = await fetch(
                    `${API_BASE_URL}/api/sessions/${entry.session_id}`,
                    {
                      headers: {
                        "ngrok-skip-browser-warning": "true",
                      },
                    }
                  );
                  
                  if (sessionResponse.ok) {
                    const sessionJson = await sessionResponse.json();
                    if (sessionJson?.success && sessionJson.data?.name) {
                      return { ...entry, session_name: sessionJson.data.name };
                    }
                  }
                } catch (err) {
                  console.warn(`Failed to fetch session ${entry.session_id}:`, err);
                }
              }
              return entry;
            })
          );
          
          setHistoryData(enrichedData);
        } else {
          setHistoryData([]);
        }
      } catch (err) {
        console.error("Error fetching stress history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat riwayat stress...</p>
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

          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Riwayat Pengukuran Stress
            </h1>
          </div>
          <p className="text-gray-600">
            Total {historyData.length} pengukuran tercatat
          </p>
        </motion.div>

        {/* History List */}
        {historyData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Belum Ada Riwayat
            </h2>
            <p className="text-gray-600 mb-6">
              Mulai pengukuran pertama Anda untuk melihat riwayat
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-colors"
            >
              Mulai Pengukuran
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {historyData.map((entry, index) => {
              const colors = getStressLevelColor(entry.label);

              return (
                <motion.div
                  key={entry.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 ${colors.border}`}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                      {/* Timestamp & Number */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-10 h-10 flex items-center justify-center text-sm flex-shrink-0">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatTimestampID(
                                entry.timestamp || entry.created_at
                              )}
                            </span>
                          </div>
                          {entry.session_id && (
                            <div className="mt-1">
                              {entry.session_name ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    📋 {entry.session_name}
                                  </span>
                                  {authUser && (
                                    <button
                                      onClick={() =>
                                        handleOpenUpdateModal(
                                          entry.session_id,
                                          entry.session_name
                                        )
                                      }
                                      className="text-gray-400 hover:text-blue-600 transition-colors"
                                      title="Update nama session"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">
                                    Session: {entry.session_id.substring(0, 8)}...
                                  </span>
                                  {authUser && (
                                    <button
                                      onClick={() =>
                                        handleOpenUpdateModal(
                                          entry.session_id,
                                          ""
                                        )
                                      }
                                      className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      Beri Nama
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stress Level Badge */}
                      <div
                        className={`${colors.badge} ${colors.text} px-4 py-2 rounded-lg font-semibold text-center`}
                      >
                        {entry.label}
                      </div>
                    </div>

                    {/* Sensor Values */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {/* Heart Rate */}
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 border border-red-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-gray-600">
                            Heart Rate
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          {entry.hr}{" "}
                          <span className="text-xs font-normal">BPM</span>
                        </div>
                      </div>

                      {/* Temperature */}
                      <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-lg p-3 border border-rose-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Thermometer className="w-4 h-4 text-rose-600" />
                          <span className="text-xs text-gray-600">
                            Temperature
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          {entry.temp}{" "}
                          <span className="text-xs font-normal">°C</span>
                        </div>
                      </div>

                      {/* EDA/GSR */}
                      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-gray-600">EDA</span>
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          {entry.eda?.toFixed(3)}{" "}
                          <span className="text-xs font-normal">µS</span>
                        </div>
                      </div>

                      {/* Confidence */}
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-600">
                            Confidence
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-800">
                          {(entry.confidence_level * 100).toFixed(1)}
                          <span className="text-xs font-normal">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {entry.session_id && (
                      <div className="flex justify-end">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/session/${entry.session_id}`)
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Lihat Detail Sesi
                          </button>

                          {localStorage.getItem("access_token") ? (
                            <button
                              onClick={async () => {
                                const ok = window.confirm(
                                  "Hapus record riwayat ini? Aksi ini dapat menghapus sesi terkait."
                                );
                                if (!ok) return;
                                try {
                                  const resp = await authFetch(
                                    `${API_BASE_URL}/api/stress-history/${entry.id}`,
                                    { method: "DELETE" }
                                  );
                                  if (!resp.ok) {
                                    const txt = await resp.text();
                                    throw new Error(txt || "Delete failed");
                                  }
                                  setHistoryData((prev) =>
                                    prev.filter((p) => p.id !== entry.id)
                                  );
                                } catch (err) {
                                  console.error("Delete error:", err);
                                  alert(
                                    "Gagal menghapus: " + (err.message || err)
                                  );
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
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
