import { WifiOff, RefreshCw } from "lucide-react";

export default function ConnectionStatusModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-[0_25px_80px_rgba(15,23,42,0.35)]">
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200/80 bg-white/80 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Tutup peringatan koneksi"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-6 px-8 pt-10 pb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-orange-400 to-amber-300 text-white shadow-lg">
            <WifiOff className="h-8 w-8" />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Koneksi Sensor Putus
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Belum bisa memulai pengukuran
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Pastikan perangkat kamu terhubung dan lampu indikator pada sensor
              berwarna hijau sebelum mencoba kembali.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-left">
              <RefreshCw className="h-4 w-4 text-slate-400" />
              <span>
                Periksa koneksi Wi-Fi atau nyalakan ulang perangkat sensor.
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            Saya akan coba lagi
          </button>
        </div>
      </div>
    </div>
  );
}
