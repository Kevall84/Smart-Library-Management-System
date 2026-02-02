import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Chart from "chart.js/auto";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { adminApi } from "../../api/admin";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const revenueChartRef = useRef(null);
  const overdueChartRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: { total: 0, librarians: 0 },
    books: { total: 0, available: 0, rented: 0 },
    rentals: { total: 0, active: 0, overdue: 0 },
    revenue: { total: 0, monthly: 0 },
  });
  const [revenueData, setRevenueData] = useState([]);
  const [rentalData, setRentalData] = useState([]);
  const [overdueReport, setOverdueReport] = useState([]);
  const [error, setError] = useState(null);
  const [showDefaulters, setShowDefaulters] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load dashboard stats
        const dashboardRes = await adminApi.dashboard();
        setStats(dashboardRes?.data?.stats || dashboardRes?.stats || {
          users: { total: 0, librarians: 0 },
          books: { total: 0, available: 0, rented: 0 },
          rentals: { total: 0, active: 0, overdue: 0 },
          revenue: { total: 0, monthly: 0 },
        });

        // Load revenue stats for chart
        const revenueRes = await adminApi.revenueStats(30);
        const revenue = revenueRes?.data?.data || revenueRes?.data || [];
        setRevenueData(revenue);

        // Load rental stats for chart
        const rentalRes = await adminApi.rentalsStats(30);
        const rentals = rentalRes?.data?.data || rentalRes?.data || [];
        setRentalData(rentals);

        // Load overdue report
        try {
          const overdueRes = await adminApi.overdueReport();
          const report = overdueRes?.data?.report || overdueRes?.report || [];
          setOverdueReport(report);
        } catch (e) {
          console.error("Failed to load overdue report:", e);
          setOverdueReport([]);
        }
      } catch (e) {
        console.error("Failed to load dashboard:", e);
        setError(e?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  /* ---------------- HEALTH SCORE ---------------- */
  const healthScore = Math.max(
    60,
    100 - (stats.rentals?.overdue || 0) - Math.floor((stats.revenue?.total || 0) / 1000)
  );

  const healthColor =
    healthScore > 80 ? "text-green-400" :
    healthScore > 65 ? "text-yellow-400" :
    "text-red-400";

  // Calculate pending fines from overdue report
  const pendingFines = overdueReport.reduce((sum, item) => sum + (item.penaltyAmount || 0), 0);

  /* ---------------- MINI CHARTS ---------------- */
  useEffect(() => {
    if (loading || !revenueChartRef.current || !overdueChartRef.current) return;

    // Prepare revenue chart data (last 7 days)
    const revenueLabels = revenueData.slice(-7).map((d) => {
      const date = new Date(d._id);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    const revenueValues = revenueData.slice(-7).map((d) => d.total || 0);

    // Prepare rental chart data (last 4 weeks)
    const rentalLabels = rentalData.slice(-4).map((d) => {
      const date = new Date(d._id);
      return `W${Math.ceil(date.getDate() / 7)}`;
    });
    const rentalValues = rentalData.slice(-4).map((d) => d.count || 0);

    const revenueChart = new Chart(revenueChartRef.current, {
      type: "line",
      data: {
        labels: revenueLabels.length > 0 ? revenueLabels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          data: revenueValues.length > 0 ? revenueValues : [0, 0, 0, 0, 0, 0, 0],
          borderColor: "rgba(34,197,94,1)",
          backgroundColor: "rgba(34,197,94,0.25)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        }],
      },
      options: {
        onClick: () => navigate("/admin/reports?type=revenue"),
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });

    const overdueChart = new Chart(overdueChartRef.current, {
      type: "bar",
      data: {
        labels: rentalLabels.length > 0 ? rentalLabels : ["W1", "W2", "W3", "W4"],
        datasets: [{
          data: rentalValues.length > 0 ? rentalValues : [0, 0, 0, 0],
          backgroundColor: "rgba(239,68,68,0.7)",
          borderRadius: 6,
        }],
      },
      options: {
        onClick: () => navigate("/admin/reports?type=overdue"),
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });

    return () => {
      revenueChart.destroy();
      overdueChart.destroy();
    };
  }, [navigate, loading, revenueData, rentalData]);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-soft bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-8 dark:border-white/10">
          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
              alt="Library administration"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                Admin Dashboard
              </h1>
              <p className="text-muted text-lg">
                Complete overview of your library system, users, books, and revenue.
              </p>
            </motion.div>
            <motion.div
              className="relative w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-glow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80"
                alt="Library books"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>

        {loading && (
          <motion.div
            className="flex items-center gap-3 text-muted mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Loading dashboard data...
          </motion.div>
        )}

        {error && (
          <motion.div
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Kpi title="Users" value={stats.users?.total || 0} onClick={() => navigate("/admin/users")} icon="👥" />
          <Kpi title="Librarians" value={stats.users?.librarians || 0} icon="📚" />
          <Kpi title="Books" value={stats.books?.total || 0} icon="📖" />
          <Kpi title="Overdue" value={stats.rentals?.overdue || 0} danger icon="⚠️" />
        </div>

        {/* HEALTH + CHARTS */}
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            className="relative p-6 rounded-2xl bg-surface border-2 border-soft overflow-hidden dark:border-white/10 dark:bg-slate-900/80"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
                alt="Books"
                className="w-full h-full object-cover rounded-bl-2xl"
              />
            </div>
            <div className="relative z-10">
              <p className="text-muted mb-2 flex items-center gap-2">
                <span>💚</span>
                Library Health
              </p>
              <p className={`text-4xl font-bold ${healthColor}`}>
                {healthScore}%
              </p>
              <p className="text-sm mt-2 text-muted">
                Based on overdue & fines
              </p>
            </div>
          </motion.div>

          <MiniChart title="Weekly Revenue">
            <canvas ref={revenueChartRef} />
          </MiniChart>

          <MiniChart title="Overdue Trend">
            <canvas ref={overdueChartRef} />
          </MiniChart>
        </div>

        {/* FINES & REVENUE */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            className="relative p-6 rounded-2xl bg-surface border-2 border-soft overflow-hidden dark:border-white/10 dark:bg-slate-900/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80"
                alt="Fines"
                className="w-full h-full object-cover rounded-bl-2xl"
              />
            </div>
            <div className="relative z-10">
              <p className="text-muted mb-2 flex items-center gap-2">
                <span>💰</span>
                Pending Fines
              </p>
              <p className="text-3xl font-bold text-red-400 mt-2">
                ₹{pendingFines.toLocaleString()}
              </p>
              {overdueReport.length > 0 && (
                <motion.button
                  onClick={() => setShowDefaulters(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Defaulters ({overdueReport.length})
                </motion.button>
              )}
            </div>
          </motion.div>

          <motion.div
            className="relative p-6 rounded-2xl bg-surface border-2 border-soft overflow-hidden dark:border-white/10 dark:bg-slate-900/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80"
                alt="Revenue"
                className="w-full h-full object-cover rounded-bl-2xl"
              />
            </div>
            <div className="relative z-10">
              <p className="text-muted mb-2 flex items-center gap-2">
                <span>📈</span>
                Monthly Revenue
              </p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                ₹{(stats.revenue?.monthly || 0).toLocaleString()}
              </p>
              <motion.button
                onClick={() => navigate("/admin/reports")}
                className="mt-4 px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm hover:bg-primary/30 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Reports
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* SYSTEM STATUS & QUICK ACTIONS */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            className="p-6 rounded-2xl bg-surface border-2 border-soft dark:border-white/10 dark:bg-slate-900/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <span>📊</span>
              System Status
            </h2>
            <div className="space-y-3 text-sm">
              {stats.rentals?.overdue > 0 && (
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-xl">🔴</span>
                  <span>{stats.rentals.overdue} book(s) overdue - Action required</span>
                </motion.div>
              )}
              {stats.books?.available === 0 && stats.books?.total > 0 && (
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-xl">🟡</span>
                  <span>All books are currently rented</span>
                </motion.div>
              )}
              {stats.rentals?.active > 0 && (
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xl">🔵</span>
                  <span>{stats.rentals.active} active rental(s)</span>
                </motion.div>
              )}
              {stats.rentals?.overdue === 0 && stats.books?.available > 0 && (
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-xl">✅</span>
                  <span>All systems operational</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-soft dark:border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="absolute right-0 top-0 w-48 h-48 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80"
                alt="Library shelves"
                className="w-full h-full object-cover rounded-bl-2xl"
              />
            </div>
            <div className="relative z-10">
              <h2 className="font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <span>⚡</span>
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <ActionBtn label="View Users" onClick={() => navigate("/admin/users")} />
                <ActionBtn label="View Reports" onClick={() => navigate("/admin/reports")} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* DEFAULTERS MODAL */}
      {showDefaulters && (
        <Modal onClose={() => setShowDefaulters(false)}>
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Overdue Rentals ({overdueReport.length})</h2>
          {overdueReport.length === 0 ? (
            <p className="text-muted">No overdue rentals</p>
          ) : (
            overdueReport.slice(0, 10).map((item, i) => {
              const rental = item.rental || {};
              const user = rental.user || {};
              return (
                <div key={i} className="p-3 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex justify-between items-center mb-2 text-slate-900 dark:text-white">
                  <div>
                    <p className="font-medium">{user.name || user.email || "Unknown User"}</p>
                    <p className="text-sm text-muted">
                      {rental.book?.title || "Unknown Book"} - Overdue {item.overdueDays || 0} days
                    </p>
                    <p className="text-sm text-red-400">Penalty: ₹{item.penaltyAmount || 0}</p>
                  </div>
                </div>
              );
            })
          )}
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;

/* ---------------- HELPERS ---------------- */

const Kpi = ({ title, value, danger, onClick, icon }) => (
  <motion.button
    onClick={onClick}
    className="relative text-left p-6 rounded-2xl bg-surface border-2 border-soft overflow-hidden dark:border-white/10 dark:bg-slate-900/80 group text-slate-900 dark:text-white"
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
      <img
        src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80"
        alt={title}
        className="w-full h-full object-cover rounded-bl-2xl"
      />
    </div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-muted text-sm">{title}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${danger ? "text-red-400" : "bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"}`}>
        {value}
      </p>
    </div>
  </motion.button>
);

const MiniChart = ({ title, children }) => (
  <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
    <p className="font-semibold mb-2 text-slate-900 dark:text-white">{title}</p>
    <div className="h-[120px] cursor-pointer">{children}</div>
  </div>
);

const ActionBtn = ({ label, onClick }) => (
  <motion.button
    onClick={onClick}
    className="px-5 py-2 rounded-xl bg-primary text-sm text-white shadow-glow hover:shadow-glow-lg transition"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {label}
  </motion.button>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-2xl">
      {children}
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 rounded bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition"
      >
        Close
      </button>
    </div>
  </div>
);