import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ebooksApi } from "../../api/ebooks";

const EbookBrowse = () => {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("openlibrary");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const mapped = useMemo(() => {
    return (results || []).map((b) => ({
      externalId: b.externalId,
      title: b.title,
      author: (b.authors && b.authors[0]) || "—",
      source: b.source,
      coverImage: b.coverImage || null,
    }));
  }, [results]);

  useEffect(() => {
    if (!search) {
      setResults([]);
      setError(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ebooksApi.search({ q: search, source, page: 1, limit: 20 });
        setResults(res?.data?.books || res?.books || []);
      } catch (e) {
        const errorMsg = e?.data?.message || e?.message || "Failed to search ebooks";
        setError(errorMsg);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, source]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Free eBooks</h1>
          <p className="text-muted mt-2">
            Access thousands of legally free books from global open libraries
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="px-4 py-3 rounded-xl bg-black/30 border border-white/10"
            >
              <option value="openlibrary">Open Library</option>
              <option value="gutenberg">Gutenberg</option>
            </select>
          </div>
        </div>

        {/* Books Grid */}
        {loading && <p className="text-muted">Searching...</p>}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 font-medium">{error}</p>
            <p className="text-red-300/70 text-sm mt-1">Please try again or search with different keywords.</p>
          </div>
        )}
        {!loading && !error && search && mapped.length === 0 && (
          <p className="text-muted">No books found. Try different search terms.</p>
        )}
        {!loading && !error && mapped.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mapped.map((book) => (
              <button
                key={book.externalId}
                type="button"
                onClick={() => navigate(`/ebooks/${encodeURIComponent(book.externalId)}?source=${encodeURIComponent(book.source)}`)}
                className="text-left p-8 rounded-2xl bg-white/5 border border-white/10 hover:-translate-y-1 hover:border-primary/30 transition flex flex-col items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
              >
                <div className="flex justify-center mb-5 w-full">
                  <BookCover src={book.coverImage} title={book.title} size="xl" />
                </div>
                <div className="w-full text-center">
                  <h3 className="font-semibold text-xl line-clamp-2">{book.title}</h3>
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

export default EbookBrowse;
