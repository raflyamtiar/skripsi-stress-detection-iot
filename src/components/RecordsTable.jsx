import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecordsTable({ rows = [], isLoading = false }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

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

  const pageNumbers = [];
  const pageRange = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - pageRange && i <= currentPage + pageRange)
    ) {
      pageNumbers.push(i);
    }
  }

  const renderPageNumbers = pageNumbers.map((number, index) => {
    if (index > 0 && number !== pageNumbers[index - 1] + 1) {
      return (
        <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm">
          ...
        </span>
      );
    }
    return (
      <button
        key={number}
        className={`px-4 py-2 text-sm mx-1 ${
          currentPage === number
            ? "bg-blue-500 text-white"
            : "bg-gray-300 text-sm"
        }`}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </button>
    );
  });

  return (
    <div className="mt-8 mx-auto max-w-7xl w-full">
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
              <th className="px-3 py-2 text-xs font-semibold text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentRows.map((r, i) => (
              <tr
                key={`${r.id ?? i}-${r.timestamp}`}
                className="hover:bg-gray-50"
              >
                <td className="px-3 py-2 text-sm">{startIndex + i + 1}</td>
                <td className="px-3 py-2 text-sm tabular-nums">
                  {r.timestamp}
                </td>
                <td className="px-3 py-2 text-sm tabular-nums">{r.hr}</td>
                <td className="px-3 py-2 text-sm tabular-nums">{r.temp}</td>
                <td className="px-3 py-2 text-sm tabular-nums">{r.gsr}</td>
                <td className="px-3 py-2 text-sm">{r.level}</td>
                <td className="px-3 py-2 text-sm text-center">
                  {r.sessionId ? (
                    <button
                      onClick={() => navigate(`/session/${r.sessionId}`)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Detail
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan="7" className="px-3 py-3 text-center text-gray-500">
                  {isLoading ? "Memuat data riwayat..." : "Belum ada data"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6">
        <button
          className="px-3 py-2 bg-gray-300 text-sm rounded-l-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <button
          className="px-3 py-2 bg-gray-300 text-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {renderPageNumbers}

        <button
          className="px-3 py-2 bg-gray-300 text-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalRows === 0}
        >
          Next
        </button>
        <button
          className="px-3 py-2 bg-gray-300 text-sm rounded-r-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages || totalRows === 0}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
}
