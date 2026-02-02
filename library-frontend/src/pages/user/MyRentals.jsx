import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { rentalsApi } from "../../api/rentals";
import { useNavigate } from "react-router-dom";

const MyRentals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await rentalsApi.my({ limit: 20 });
        const rentalsList = Array.isArray(res?.data) ? res?.data : (res?.data?.rentals || res?.rentals || []);
        setRentals(rentalsList);
      } catch (e) {
        setError(e?.message || "Failed to load rentals");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const enriched = useMemo(() => {
    return (rentals || []).map((r) => {
      const due = r.dueDate ? new Date(r.dueDate) : null;
      const daysLeft = due ? Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24)) : null;
      const dueIn =
        r.status === "returned"
          ? "Returned"
          : daysLeft === null
            ? "—"
            : daysLeft >= 0
              ? `${daysLeft} day(s)`
              : `${Math.abs(daysLeft)} day(s) overdue`;
      return { ...r, dueIn, daysLeft };
    });
  }, [rentals]);

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
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80"
              alt="My rentals"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              My Rentals
            </h1>
            <p className="text-muted text-lg">
              Track your current and past book rentals. Never miss a return date!
            </p>
          </div>
        </div>

        {loading && (
          <motion.div
            className="flex items-center justify-center gap-3 text-muted py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            Loading your rentals...
          </motion.div>
        )}

        {error && (
          <motion.div
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.div>
        )}

        {!loading && !error && enriched.length === 0 && (
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-surface border-2 border-soft p-12 text-center dark:border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute inset-0 opacity-5">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80"
                alt="Empty state"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl font-semibold mb-2">No rentals yet</p>
              <p className="text-muted mb-6">Start by browsing books and creating a rental request.</p>
              <motion.button
                onClick={() => navigate("/offline-books")}
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-glow hover:shadow-glow-lg transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Books
              </motion.button>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {enriched.map((r, index) => (
            <motion.div
              key={r._id}
              className="group relative overflow-hidden rounded-2xl bg-surface border-2 border-soft p-6 flex flex-col md:flex-row gap-6 items-center dark:border-white/10 dark:bg-slate-950/70 hover:shadow-glow transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.05 }}
              >
                <BookCover
                  src={r.book?.coverImage}
                  title={r.book?.title}
                  size="md"
                />
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                  {r.book?.title || "—"}
                </h3>
                {r.book?.author && (
                  <p className="text-muted text-sm mb-3">by {r.book?.author}</p>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === "issued"
                        ? "bg-green-500/20 text-green-400"
                        : r.status === "returned"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      r.daysLeft !== null && r.daysLeft < 0
                        ? "bg-red-500/20 text-red-400"
                        : r.daysLeft !== null && r.daysLeft <= 3
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-primary/20 text-primary"
                    }`}
                  >
                    {r.dueIn}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 flex-shrink-0">
                {(r.status === "pending" || r.status === "issued") && (
                  <motion.button
                    onClick={() => navigate(`/dashboard/qr?rentalId=${r._id}`, { state: { rentalId: r._id } })}
                    className="px-4 py-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-glow hover:shadow-glow-lg transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View QR Code
                  </motion.button>
                )}
                {r.status === "issued" && (
                  <motion.button
                    onClick={() => navigate("/offline-books")}
                    className="px-4 py-2 rounded-xl border-2 border-soft text-sm font-semibold hover:border-primary/50 hover:text-primary transition dark:border-white/10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse More
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default MyRentals;
