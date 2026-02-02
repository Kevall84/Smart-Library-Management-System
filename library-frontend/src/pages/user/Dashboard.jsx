import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/common/StatCard";
import { rentalsApi } from "../../api/rentals";
import useAuth from "../../context/useAuth";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeRentals: 0,
    dueSoon: 0,
    totalPayments: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await rentalsApi.stats();
        setStats(res?.data?.stats || res?.stats || {
          activeRentals: 0,
          dueSoon: 0,
          totalPayments: 0,
        });
      } catch (e) {
        console.error("Failed to load dashboard stats:", e);
        setError(e?.message || "Failed to load statistics");
        setStats({
          activeRentals: 0,
          dueSoon: 0,
          totalPayments: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const quickActions = [
    {
      title: "Browse Physical Books",
      description: "Explore our collection of physical books",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
      action: () => navigate("/offline-books"),
      icon: "📚",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      title: "Explore eBooks",
      description: "Access thousands of free digital books",
      // Using a more reliable image URL to avoid load issues
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
      action: () => navigate("/ebooks"),
      icon: "📖",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      title: "My Rentals",
      description: "View your current and past rentals",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80",
      action: () => navigate("/dashboard/my-rentals"),
      icon: "📋",
      color: "from-emerald-500/20 to-emerald-600/10",
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
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
            <div className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                {user?.name ? `Welcome, ${user.name}` : "Welcome to Your Library"}
              </h1>
              <p className="text-muted text-lg">
                Discover, rent, and read. Your next great book is just a click away.
              </p>
            </motion.div>
            <motion.div
              className="relative w-full md:w-72 h-48 rounded-2xl overflow-hidden shadow-glow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <AnimatedBookStack />
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
            title="Active Rentals"
            value={stats.activeRentals.toString()}
            subtitle="Books currently rented"
            delay={0.1}
            icon="📚"
          />
          <StatCard
            title="Due Soon"
            value={stats.dueSoon.toString()}
            subtitle="Returning this week"
            delay={0.2}
            icon="⏰"
          />
          <StatCard
            title="Total Payments"
            value={`₹${stats.totalPayments.toLocaleString()}`}
            subtitle="Lifetime payments"
            delay={0.3}
            icon="💰"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>🚀</span>
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

        {/* Reading Inspiration */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border-2 border-soft bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-8 dark:border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="absolute right-0 top-0 w-64 h-64 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
              alt="Reading inspiration"
              className="w-full h-full object-cover rounded-bl-3xl"
            />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <span>✨</span>
              Start Your Reading Journey
            </h2>
            <p className="text-muted mb-4">
              Whether you prefer the feel of physical books or the convenience of digital reading,
              we have something for every book lover. Browse our collection and discover your next favorite read.
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => navigate("/offline-books")}
                className="px-6 py-2 rounded-xl bg-primary text-white font-medium shadow-glow hover:shadow-glow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Physical Books
              </motion.button>
              <motion.button
                onClick={() => navigate("/ebooks")}
                className="px-6 py-2 rounded-xl border-2 border-soft bg-surface font-medium hover:border-primary/50 hover:text-primary transition-all dark:border-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore eBooks
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default UserDashboard;

const AnimatedBookStack = () => {
  return (
    <div className="relative h-full w-full">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-purple-500/10 to-pink-500/10" />
      <div className="absolute inset-0 opacity-40">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/25 blur-3xl" />
      </div>

      {/* floating particles */}
      <motion.span
        className="absolute left-6 top-6 text-xl text-primary/70"
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        ✦
      </motion.span>
      <motion.span
        className="absolute right-7 top-10 text-lg text-purple-500/70"
        animate={{ y: [0, -12, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        ✦
      </motion.span>
      <motion.span
        className="absolute right-10 bottom-8 text-lg text-pink-500/70"
        animate={{ y: [0, -8, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        ✦
      </motion.span>

      {/* book stack */}
      <div className="absolute inset-0 flex items-end justify-center pb-6">
        <div className="relative w-[220px]">
          <motion.div
            className="absolute bottom-0 left-2 h-10 w-[210px] rounded-2xl bg-white/60 backdrop-blur-sm ring-1 ring-white/50 dark:bg-white/10 dark:ring-white/10"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-8 left-4 h-10 w-[200px] rounded-2xl bg-primary/25 ring-1 ring-primary/20"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.div
            className="absolute bottom-16 left-6 h-10 w-[190px] rounded-2xl bg-purple-500/20 ring-1 ring-purple-500/20"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
          />
          <motion.div
            className="absolute bottom-24 left-8 h-10 w-[180px] rounded-2xl bg-pink-500/20 ring-1 ring-pink-500/20"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />

          {/* book labels */}
          <div className="absolute bottom-0 left-2 h-10 w-[210px] rounded-2xl px-4 flex items-center justify-between text-xs font-semibold text-slate-900/70 dark:text-white/70">
            <span>LIBFLOW</span>
            <span>VOL. 01</span>
          </div>
          <div className="absolute bottom-8 left-4 h-10 w-[200px] rounded-2xl px-4 flex items-center justify-between text-xs font-semibold text-primary">
            <span>RENTALS</span>
            <span>QR</span>
          </div>
          <div className="absolute bottom-16 left-6 h-10 w-[190px] rounded-2xl px-4 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-300">
            <span>EBOOKS</span>
            <span>OPEN</span>
          </div>
          <div className="absolute bottom-24 left-8 h-10 w-[180px] rounded-2xl px-4 flex items-center justify-between text-xs font-semibold text-pink-600 dark:text-pink-300">
            <span>READ</span>
            <span>MORE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
