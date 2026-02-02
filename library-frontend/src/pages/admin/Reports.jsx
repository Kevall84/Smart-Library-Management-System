import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { adminApi } from "../../api/admin";

const ALL_COLUMNS = ["user", "book", "librarian", "fine", "revenue"];

const Reports = () => {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overdueReport, setOverdueReport] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);

  /* ---------- STATES ---------- */
  const [chartType, setChartType] = useState("bar");
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS);
  const [activeKPI, setActiveKPI] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  /* ---------- LOAD DATA ---------------- */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overdueRes, revenueRes, popularRes] = await Promise.all([
          adminApi.overdueReport().catch(() => ({ data: { report: [] } })),
          adminApi.revenueStats(30).catch(() => ({ data: { data: [] } })),
          adminApi.popularBooks(10).catch(() => ({ data: { books: [] } })),
        ]);
        
        setOverdueReport(overdueRes?.data?.report || []);
        setRevenueData(revenueRes?.data?.data || revenueRes?.data || []);
        setPopularBooks(popularRes?.data?.books || []);
      } catch (e) {
        console.error("Failed to load reports:", e);
        setError(e?.message || "Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  /* ---------- TRANSFORM DATA ---------- */
  const reportData = useMemo(() => {
    return overdueReport.map((item, idx) => {
      const rental = item.rental || {};
      const user = rental.user || {};
      const book = rental.book || {};
      return {
        id: rental._id || idx,
        user: user.name || user.email || "Unknown",
        book: book.title || "Unknown",
        librarian: rental.issuedBy?.name || "N/A",
        fine: item.penaltyAmount || 0,
        revenue: 0, // Would need payment data
        overdue: true,
      };
    });
  }, [overdueReport]);

  /* ---------- FILTER ---------- */
  const filteredData = useMemo(() => {
    let rows = [...reportData];
    if (activeKPI === "OVERDUE") rows = rows.filter(r => r.overdue);
    if (selectedBook) rows = rows.filter(r => r.book === selectedBook);
    return rows;
  }, [activeKPI, selectedBook, reportData]);

  /* ---------- KPI ---------- */
  const totalRevenue = revenueData.reduce((s, r) => s + (r.total || 0), 0);
  const overdueCount = filteredData.filter(r => r.overdue).length;

  /* ---------- CHART ---------- */
  useEffect(() => {
    if (loading || !chartRef.current) return;

    const books = popularBooks.slice(0, 10).map(b => b.title || "Unknown");
    const values = popularBooks.slice(0, 10).map(b => b.totalRentals || 0);

    if (books.length === 0) return;

    const chart = new Chart(chartRef.current, {
      type: chartType,
      data: {
        labels: books,
        datasets: [
          {
            label: "Rentals",
            data: values,
            fill: chartType === "line",
            backgroundColor: "rgba(99,102,241,0.5)",
            borderColor: "rgba(99,102,241,1)",
            tension: 0.4,
            pointRadius: chartType === "line" ? 4 : 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        onClick: (_, el) => el.length && setSelectedBook(books[el[0].index]),
      },
    });

    return () => chart.destroy();
  }, [chartType, selectedBook, popularBooks, loading]);

  /* ---------- COLUMN TOGGLE ---------- */
  const toggleColumn = (col) => {
    setVisibleCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      {loading && <p className="text-muted mb-4">Loading reports...</p>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
          className="px-4 py-2 rounded bg-white/10"
        >
          Toggle {chartType === "bar" ? "Line" : "Bar"} Chart
        </button>
      </div>

      {/* KPI */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8 max-w-3xl">
        <KPI title="Total Revenue (30 days)" value={`₹${totalRevenue.toLocaleString()}`} onClick={() => setActiveKPI(null)} />
        <KPI title="Overdue Records" value={overdueCount} onClick={() => setActiveKPI("OVERDUE")} />
      </div>

      {/* SMALL / MEDIUM CHART */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 mb-8 max-w-4xl">
        <h2 className="text-sm font-semibold mb-2 text-slate-900 dark:text-white">Popular Books (by Rentals)</h2>

        <div className="h-[180px] sm:h-[220px]">
          <canvas ref={chartRef} />
        </div>

        {selectedBook && (
          <button
            onClick={() => setSelectedBook(null)}
            className="mt-2 text-xs text-primary"
          >
            Clear book filter
          </button>
        )}
      </div>

      {/* COLUMN TOGGLE */}
      <div className="flex flex-wrap gap-4 mb-4 text-slate-900 dark:text-white">
        {ALL_COLUMNS.map((col) => (
          <label key={col} className="text-sm cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={visibleCols.includes(col)}
              onChange={() => toggleColumn(col)}
            />{" "}
            {col}
          </label>
        ))}
      </div>

      {/* ✅ FIXED & ALIGNED TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80">
        <table className="w-full min-w-[700px] table-fixed border-collapse text-slate-900 dark:text-white">
          <thead className="bg-slate-100 dark:bg-white/10">
            <tr>
              {visibleCols.includes("user") && (
                <th className="p-4 text-left w-[20%] font-semibold">User</th>
              )}
              {visibleCols.includes("book") && (
                <th className="p-4 text-left w-[25%] font-semibold">Book</th>
              )}
              {visibleCols.includes("librarian") && (
                <th className="p-4 text-left w-[25%] font-semibold">Librarian</th>
              )}
              {visibleCols.includes("fine") && (
                <th className="p-4 text-right w-[15%] font-semibold">Fine (₹)</th>
              )}
              {visibleCols.includes("revenue") && (
                <th className="p-4 text-right w-[15%] font-semibold">Revenue (₹)</th>
              )}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((r) => (
              <tr
                key={r.id}
                className="border-t border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                {visibleCols.includes("user") && (
                  <td className="p-4 text-left truncate">{r.user}</td>
                )}
                {visibleCols.includes("book") && (
                  <td className="p-4 text-left truncate">{r.book}</td>
                )}
                {visibleCols.includes("librarian") && (
                  <td className="p-4 text-left truncate">{r.librarian}</td>
                )}
                {visibleCols.includes("fine") && (
                  <td className="p-4 text-right font-mono">₹{r.fine}</td>
                )}
                {visibleCols.includes("revenue") && (
                  <td className="p-4 text-right font-mono">₹{r.revenue}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Reports;

/* ---------- KPI CARD ---------- */
const KPI = ({ title, value, onClick }) => (
  <div
    onClick={onClick}
    className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 cursor-pointer hover:scale-[1.03] transition text-slate-900 dark:text-white"
  >
    <p className="text-muted">{title}</p>
    <h2 className="text-2xl font-bold mt-2">{value}</h2>
  </div>
);