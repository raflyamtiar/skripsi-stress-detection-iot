import { AlertTriangle } from "lucide-react";

export default function StressWarningModal({ isOpen, onClose, onListenMusic }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-red-500 to-red-400 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full">
              <AlertTriangle className="w-8 h-8 " />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Peringatan</h2>
              <p className="text-red-100 text-sm">Deteksi Tingkat Stress</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-800 text-lg mb-6 text-center">
            Kamu terdeteksi{" "}
            <span className="font-bold text-red-600">stress berat</span>.
            <br />
            Apakah kamu ingin mendengarkan musik?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onListenMusic}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Ya, Dengarkan Musik
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
