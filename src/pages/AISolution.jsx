import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Music,
} from "lucide-react";
import { getAISolutionFromStorage } from "../lib/groqService";
import MusicPlayer from "../components/MusicPlayer";

export default function AISolution() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [solutionData, setSolutionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);

  useEffect(() => {
    // Ambil data dari localStorage
    const data = getAISolutionFromStorage(sessionId);

    if (!data) {
      setError("Data solusi tidak ditemukan. Silakan ulangi konsultasi.");
      setLoading(false);
      return;
    }

    setSolutionData(data);
    setLoading(false);
  }, [sessionId]);

  const handleBack = () => {
    navigate("/");
  };

  const handleShare = async () => {
    const text = `Solusi AI untuk Stress Management\n\n${solutionData.solution}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Solusi AI - Stress Management",
          text: text,
        });
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text);
        alert("Solusi telah disalin ke clipboard!");
      } catch (err) {
        alert("Gagal membagikan solusi");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleListenMusic = () => {
    setShowMusicPlayer(true);
  };

  const handleCloseMusicPlayer = () => {
    setShowMusicPlayer(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Memuat solusi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Solusi Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4 print:hidden">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali ke Dashboard</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleListenMusic}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Dengarkan Musik</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm border"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm border"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-8 sm:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Solusi AI untuk Anda
                </h1>
                <p className="text-blue-100 mt-1">
                  Rekomendasi berdasarkan analisis stress Anda
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-2 text-blue-100 text-sm mt-4">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(solutionData.timestamp)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-10">
            {/* Masalah yang dipilih */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                Masalah yang Anda Konsultasikan
              </h2>
              <div className="flex flex-wrap gap-2">
                {solutionData.problems.map((problem, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full"
                  >
                    {problem}
                  </span>
                ))}
              </div>
            </div>

            {/* Cerita */}
            <div className="mb-8 bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                Cerita Anda
              </h2>
              <p className="text-gray-700 leading-relaxed">
                "{solutionData.story}"
              </p>
            </div>

            {/* AI Solution */}
            <div className="prose prose-blue max-w-none">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                  Rekomendasi dari AI
                </h2>
              </div>

              {/* Render solution dengan format markdown sederhana */}
              <div className="text-gray-800 leading-relaxed space-y-4">
                {solutionData.solution.split("\n").map((line, idx) => {
                  // Header
                  if (line.startsWith("## ")) {
                    return (
                      <h3
                        key={idx}
                        className="text-xl font-bold text-gray-900 mt-6 mb-3 border-l-4 border-blue-500 pl-4"
                      >
                        {line.replace("## ", "")}
                      </h3>
                    );
                  }
                  // List item
                  if (line.match(/^[0-9]+\./)) {
                    return (
                      <div key={idx} className="flex gap-3 mb-2">
                        <span className="font-bold text-blue-600">
                          {line.match(/^[0-9]+/)[0]}.
                        </span>
                        <p className="flex-1">
                          {line.replace(/^[0-9]+\.\s*/, "")}
                        </p>
                      </div>
                    );
                  }
                  // Bullet point
                  if (line.startsWith("- ")) {
                    return (
                      <div key={idx} className="flex gap-3 mb-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <p className="flex-1">{line.replace(/^-\s*/, "")}</p>
                      </div>
                    );
                  }
                  // Paragraph
                  if (line.trim()) {
                    return (
                      <p key={idx} className="mb-3">
                        {line}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Catatan:</strong> Solusi ini adalah rekomendasi dari
                  AI berdasarkan informasi yang Anda berikan. Jika stress yang
                  Anda alami berlanjut atau memburuk, sangat disarankan untuk
                  berkonsultasi dengan profesional kesehatan mental.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 print:hidden">
          <button
            onClick={handleListenMusic}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Music className="w-5 h-5" />
            Dengarkan Musik
          </button>
          <button
            onClick={handleBack}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Music Player Modal */}
      <MusicPlayer isOpen={showMusicPlayer} onClose={handleCloseMusicPlayer} />
    </div>
  );
}
