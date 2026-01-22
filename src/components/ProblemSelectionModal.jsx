import { useState } from "react";
import { CheckCircle2, Circle, ArrowLeft, ArrowRight } from "lucide-react";

const COMMON_PROBLEMS = [
  "Masalah Keluarga",
  "Masalah Keuangan",
  "Masalah Pekerjaan",
  "Masalah Kesehatan",
  "Masalah Hubungan/Percintaan",
  "Masalah Akademik/Kuliah",
  "Tekanan Sosial",
  "Kecemasan Masa Depan",
];

export default function ProblemSelectionModal({ isOpen, onBack, onNext }) {
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherProblem, setOtherProblem] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleToggleProblem = (problem) => {
    setSelectedProblems((prev) =>
      prev.includes(problem)
        ? prev.filter((p) => p !== problem)
        : [...prev, problem],
    );
    setError("");
  };

  const handleOtherToggle = () => {
    setIsOtherSelected(!isOtherSelected);
    if (isOtherSelected) {
      setOtherProblem("");
    }
    setError("");
  };

  const handleNext = () => {
    if (selectedProblems.length === 0 && !isOtherSelected) {
      setError("Pilih minimal satu masalah");
      return;
    }

    if (isOtherSelected && !otherProblem.trim()) {
      setError("Tuliskan masalah lainnya");
      return;
    }

    if (isOtherSelected && otherProblem.trim().split(/\s+/).length > 15) {
      setError("Maksimal 15 kata untuk masalah lainnya");
      return;
    }

    const problems = [...selectedProblems];
    if (isOtherSelected && otherProblem.trim()) {
      problems.push(otherProblem.trim());
    }

    onNext(problems);
  };

  const wordCount = otherProblem.trim()
    ? otherProblem.trim().split(/\s+/).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Pilih Masalah Anda</h2>
          <p className="text-blue-100 text-sm mt-1">
            Pilih satu atau lebih masalah yang sedang Anda alami
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {COMMON_PROBLEMS.map((problem) => {
              const isSelected = selectedProblems.includes(problem);
              return (
                <button
                  key={problem}
                  onClick={() => handleToggleProblem(problem)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                  <span
                    className={`font-medium ${
                      isSelected ? "text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {problem}
                  </span>
                </button>
              );
            })}

            {/* Checkbox Lainnya */}
            <button
              onClick={handleOtherToggle}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isOtherSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              {isOtherSelected ? (
                <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400 flex-shrink-0" />
              )}
              <span
                className={`font-medium ${
                  isOtherSelected ? "text-blue-700" : "text-gray-700"
                }`}
              >
                Lainnya
              </span>
            </button>

            {/* Input Lainnya (conditional) */}
            {isOtherSelected && (
              <div className="mt-3 ml-9 animate-fadeIn">
                <textarea
                  value={otherProblem}
                  onChange={(e) => setOtherProblem(e.target.value)}
                  placeholder="Tuliskan masalah Anda (maksimal 15 kata)"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  rows="2"
                />
                <p
                  className={`text-sm mt-1 ${
                    wordCount > 15 ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {wordCount}/15 kata
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Fixed Footer dengan Tombol */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Batal
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Lanjut
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
