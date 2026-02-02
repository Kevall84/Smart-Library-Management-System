import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { booksApi } from "../../api/books";

const OfflineBrowse = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadBooks = useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 50, sortBy: "createdAt", sortOrder: "desc" };
      if (search && search.trim()) params.search = search.trim();
      const res = await booksApi.list(params);
      const items = res?.data || res?.books || [];
      setBooks(items);
    } catch (e) {
      setError(e?.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    loadBooks(searchQuery);
  };

  const normalized = useMemo(() => {
    return (books || []).map((b) => ({
      id: b._id,
      title: b.title,
      author: b.author,
      coverImage: b.coverImage || null,
    }));
  }, [books]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Offline Library</h1>
        <p className="text-muted mt-2">
          Browse physical books available in the library for rent
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, or description..."
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-primary placeholder:text-muted"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 transition font-medium"
        >
          Search
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              loadBooks("");
            }}
            className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
          >
            Clear
          </button>
        )}
      </form>

      {/* Books Grid */}
      {loading && <p className="text-muted">Loading books...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && normalized.length === 0 && (
        <p className="text-muted">No books found. Try a different search or clear the filter.</p>
      )}
      {!loading && normalized.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {normalized.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => navigate(`/offline-books/${book.id}`)}
              className="text-left p-8 rounded-2xl bg-white/5 border border-white/10 hover:-translate-y-1 hover:border-primary/30 transition flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
            >
              <div className="flex justify-center mb-5 w-full">
                <BookCover src={book.coverImage} title={book.title} size="xl" />
              </div>
              <div className="w-full text-center">
                <h3 className="font-semibold text-xl line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-muted mt-1.5">{book.author}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
};

export default OfflineBrowse;
