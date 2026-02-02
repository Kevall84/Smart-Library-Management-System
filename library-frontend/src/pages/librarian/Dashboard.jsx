import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import { rentalsApi } from "../../api/rentals";

const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    booksIssuedToday: 0,
    booksReturnedToday: 0,
    overdueBooks: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await rentalsApi.staffStats();
        setStats(res?.data?.stats || res?.stats || {
          booksIssuedToday: 0,
          booksReturnedToday: 0,
          overdueBooks: 0,
        });
      } catch (e) {
        console.error("Failed to load librarian stats:", e);
        setError(e?.message || "Failed to load statistics");
        setStats({
          booksIssuedToday: 0,
          booksReturnedToday: 0,
          overdueBooks: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const quickActions = [
    {
      title: "Scan QR Code",
      description: "Issue or return books by scanning QR codes",
      image: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=800&q=80",
      action: () => navigate("/librarian/scan"),
      icon: "📱",
      color: "from-primary/30 to-primary/10",
    },
    {
      title: "Pending Rentals",
      description: "View rentals waiting to be issued",
      // Using a more reliable image URL to avoid load issues
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
      action: () => navigate("/librarian/issue"),
      icon: "📚",
      color: "from-purple-500/30 to-purple-500/10",
    },
    {
      title: "Issued Books",
      description: "View all currently issued books",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
      action: () => navigate("/librarian/issued"),
      icon: "✅",
      color: "from-emerald-500/30 to-emerald-500/10",
    },
  ];

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
              alt="Library management"
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
                Librarian Dashboard
              </h1>
              <p className="text-muted text-lg">
                Manage book rentals, track returns, and keep the library running smoothly.
              </p>
            </motion.div>
            <motion.div
              className="relative w-full md:w-64 h-48 rounded-2xl overflow-hidden shadow-glow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
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
            Loading statistics...
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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            title="Books Issued Today"
            value={stats.booksIssuedToday.toString()}
            subtitle="Issued today"
            delay={0.1}
            icon="📤"
          />
          <StatCard
            title="Books Returned"
            value={stats.booksReturnedToday.toString()}
            subtitle="Returned today"
            delay={0.2}
            icon="📥"
          />
          <StatCard
            title="Overdue Books"
            value={stats.overdueBooks.toString()}
            subtitle="Action required"
            delay={0.3}
            icon="⚠️"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>⚡</span>
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-2xl border-2 border-soft bg-surface cursor-pointer dark:border-white/10 dark:bg-slate-950/70"
                onClick={action.action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={action.image}
                    alt={action.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="absolute top-4 right-4 text-4xl opacity-80">
                    {action.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {action.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          className="grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="p-6 rounded-2xl bg-surface border-2 border-soft dark:border-white/10 dark:bg-slate-950/70">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📊</span>
              System Status
            </h3>
            <div className="space-y-3">
              {stats.overdueBooks > 0 && (
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span className="text-2xl">🔴</span>
                  <div>
                    <p className="font-semibold text-red-400">{stats.overdueBooks} book(s) overdue</p>
                    <p className="text-sm text-muted">Action required</p>
                  </div>
                </motion.div>
              )}
              {stats.booksIssuedToday > 0 && (
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-green-400">{stats.booksIssuedToday} book(s) issued today</p>
                    <p className="text-sm text-muted">Great work!</p>
                  </div>
                </motion.div>
              )}
              {stats.booksReturnedToday > 0 && (
                <motion.div
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="font-semibold text-blue-400">{stats.booksReturnedToday} book(s) returned today</p>
                    <p className="text-sm text-muted">Books back in circulation</p>
                  </div>
                </motion.div>
              )}
              {stats.overdueBooks === 0 && stats.booksIssuedToday === 0 && stats.booksReturnedToday === 0 && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <span className="text-2xl">ℹ️</span>
                  <div>
                    <p className="font-semibold">No activity today</p>
                    <p className="text-sm text-muted">All systems operational</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border-2 border-soft bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 dark:border-white/10">
            <div className="absolute right-0 top-0 w-48 h-48 opacity-20">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80"
                alt="Library"
                className="w-full h-full object-cover rounded-bl-2xl"
              />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>💡</span>
                Library Tips
              </h3>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Always verify QR codes before issuing books</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Check book condition during returns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Update inventory regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Keep track of overdue books daily</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
