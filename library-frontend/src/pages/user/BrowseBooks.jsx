import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { booksApi } from "../../api/books";

const BrowseBooks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await booksApi.list({ limit: 12 });
        setBooks(res?.data || res?.books || []);
      } catch (e) {
        setError(e?.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80"
              alt="Library books"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
              Browse Our Collection
            </h1>
            <p className="text-muted text-lg">
              Discover amazing books available for rent. Each book is carefully selected for your reading pleasure.
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
            Loading books...
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

        {!loading && !error && books.length === 0 && (
          <motion.div
            className="text-center py-12 rounded-2xl bg-surface border-2 border-soft dark:border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl font-semibold mb-2">No books available</p>
            <p className="text-muted">Check back later for new additions to our collection.</p>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(books || []).map((book, index) => (
            <motion.div
              key={book._id}
              className="group relative overflow-hidden rounded-2xl bg-surface border-2 border-soft hover:shadow-glow transition-all duration-300 dark:border-white/10 dark:bg-slate-950/70"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-6 flex flex-col">
                <motion.button
                  type="button"
                  onClick={() => navigate(`/offline-books/${book._id}`)}
                  className="flex justify-center mb-4 rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-primary/50 focus:ring-primary/50 focus:outline-none transition-all cursor-pointer shadow-lg group-hover:shadow-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookCover src={book.coverImage} title={book.title} size="md" />
                </motion.button>

                <h3 className="font-bold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {book.title}
                </h3>

                {book.author && (
                  <p className="text-muted text-sm mb-3">
                    by {book.author}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    (book.availableQuantity ?? book.quantity ?? 0) > 0
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {(book.availableQuantity ?? book.quantity ?? 0) > 0 ? "Available" : "Out of stock"}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    ₹{book.rentPerDay}/day
                  </span>
                </div>

                <motion.button
                  className="w-full px-4 py-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-glow hover:shadow-glow-lg transition-all"
                  onClick={() => navigate(`/offline-books/${book._id}`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default BrowseBooks;
