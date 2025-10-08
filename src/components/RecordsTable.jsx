import { useState } from "react";

export default function RecordsTable({ rows = [] }) {
  // Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Mengambil data untuk halaman saat ini
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = rows.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  function downloadCSV() {
    const header = [
      "No",
      "Timestamp",
      "Heart Rate",
      "Temperature",
      "GSR",
      "Tingkat Stress",
    ];
    const lines = rows.map((r, i) => [
      i + 1,
      r.timestamp,
      r.hr,
      r.temp,
      r.gsr,
      r.level,
    ]);
    const csv = [header, ...lines].map((a) => a.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stress_records.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Buat daftar halaman
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-8 mx-auto max-w-7xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tabel Sederhana</h2>
        <button
          onClick={downloadCSV}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          title="Unduh CSV"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M5 20h14v-2H5zm7-16l-5 5h3v6h4v-6h3z"
            />
          </svg>
          Unduh
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-md border border-gray-300 bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-gray-200/70">
            <tr>
              <th className="px-3 py-2 text-xs font-semibold">No</th>
              <th className="px-3 py-2 text-xs font-semibold">Timestamp</th>
              <th className="px-3 py-2 text-xs font-semibold">Heart Rate</th>
              <th className="px-3 py-2 text-xs font-semibold">Temperature</th>
              <th className="px-3 py-2 text-xs font-semibold">GSR</th>
              <th className="px-3 py-2 text-xs font-semibold">
                Tingkat Stress
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRows.map((r, i) => (
              <tr key={i}>
                <td className="px-3 py-2 text-sm">{i + 1}</td>
                <td className="px-3 py-2 text-sm tabular-nums">
                  {r.timestamp}
                </td>
                <td className="px-3 py-2 text-sm tabular-nums">{r.hr}</td>
                <td className="px-3 py-2 text-sm tabular-nums">{r.temp}</td>
                <td className="px-3 py-2 text-sm tabular-nums">{r.gsr}</td>
                <td className="px-3 py-2 text-sm">{r.level}</td>
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan="6" className="px-3 py-3 text-center text-gray-500">
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginasi */}
      <div className="flex justify-center mt-6">
        <button
          className="px-3 py-2 bg-gray-300 text-sm rounded-l-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onClick={() => handlePageChange(1)} // Ke halaman pertama
          disabled={currentPage === 1}
        >
          &laquo; {/* Tombol pertama */}
        </button>
        <button
          className="px-3 py-2 bg-gray-300 text-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onClick={() => handlePageChange(currentPage - 1)} // Halaman sebelumnya
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {/* Daftar halaman */}
        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`px-4 py-2 text-sm mx-1 ${
              currentPage === number
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-sm"
            } rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
            onClick={() => handlePageChange(number)} // Ke halaman yang dipilih
          >
            {number}
          </button>
        ))}

        {/* Next Button */}
        <button
          className="px-3 py-2 bg-gray-300 text-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onClick={() => handlePageChange(currentPage + 1)} // Halaman berikutnya
          disabled={currentPage === totalPages}
        >
          Next
        </button>
        <button
          className="px-3 py-2 bg-gray-300 text-sm rounded-r-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onClick={() => handlePageChange(totalPages)} // Ke halaman terakhir
          disabled={currentPage === totalPages}
        >
          &raquo; {/* Tombol terakhir */}
        </button>
      </div>
    </div>
  );
}
