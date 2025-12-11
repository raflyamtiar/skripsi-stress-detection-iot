import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  Thermometer,
  Zap,
  Calendar,
  Eye,
  FileText,
} from "lucide-react";

const DEFAULT_API_BASE_URL =
  "https://premedical-caryl-gawkishly.ngrok-free.dev";
const sanitizeBaseUrl = (url) => (url.endsWith("/") ? url.slice(0, -1) : url);
const API_BASE_URL = sanitizeBaseUrl(
  import.meta.env.VITE_STRESS_API_BASE || DEFAULT_API_BASE_URL
);

const HISTORY_ENDPOINT =
  import.meta.env.VITE_STRESS_HISTORY_URL ||
  `${API_BASE_URL}/api/stress-history`;

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
          setHistoryData(sorted);
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
                            <div className="text-xs text-gray-400 mt-1">
                              Session: {entry.session_id.substring(0, 8)}...
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
                        <button
                          onClick={() =>
                            navigate(`/session/${entry.session_id}`)
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat Detail Sesi
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
