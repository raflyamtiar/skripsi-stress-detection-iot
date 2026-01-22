import { useState } from "react";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

export default function StoryModal({
  isOpen,
  onBack,
  onSubmit,
  isLoading,
  selectedProblems,
}) {
  const [story, setStory] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const wordCount = story.trim() ? story.trim().split(/\s+/).length : 0;

  const handleSubmit = () => {
    // Validasi hanya untuk maksimal kata
    if (story.trim() && wordCount > 100) {
      setError("Maksimal 100 kata");
      return;
    }

    // Kirim story (bisa kosong)
    onSubmit(story.trim() || "");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold">
            Ceritakan Masalah Anda (Opsional)
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Cerita Anda akan membantu AI memberikan solusi yang lebih personal.
            Bisa dilewati jika tidak ingin bercerita.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Masalah yang dipilih */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Masalah yang Anda pilih:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedProblems.map((problem, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                >
                  {problem}
                </span>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cerita Anda
            </label>
            <textarea
              value={story}
              onChange={(e) => {
                setStory(e.target.value);
                setError("");
              }}
              placeholder="Contoh: Saya merasa tertekan karena deadline kuliah yang menumpuk... (Opsional - boleh dilewati jika tidak ingin bercerita)"
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
              rows="8"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-2">
              <p
                className={`text-sm ${
                  wordCount > 100
                    ? "text-red-500 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {wordCount}/100 kata {wordCount > 100 && "(maksimal 100 kata)"}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              Balik
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Lihat Solusi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
