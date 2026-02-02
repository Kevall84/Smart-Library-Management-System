import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import { booksApi } from "../../api/books";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await booksApi.get(id);
        setBook(res?.data?.book || res?.book || null);
      } catch (e) {
        setError(e?.message || "Failed to load book");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const totalPrice = useMemo(() => {
    if (!book) return 0;
    return Number(days) * Number(book.rentPerDay || 0);
  }, [days, book]);

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted">Loading book...</p>
      </DashboardLayout>
    );
  }

  if (error || !book) {
    return (
      <DashboardLayout>
        <p className="text-red-400">{error || "Book not found"}</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left: book details, description, rental options */}
        <div className="flex-1 min-w-0 max-w-2xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-sm text-primary hover:underline"
          >
            ← Back to Offline Library
          </button>

          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-muted mb-4">by {book.author}</p>

          {book.description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">Description</h2>
              <p className="text-muted text-sm leading-relaxed">{book.description}</p>
            </div>
          )}

          {/* Rental options */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-6">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Rental options</h2>
            <p className="mb-2">
              Rent per day:{" "}
              <span className="font-semibold">₹{book.rentPerDay}</span>
            </p>
            <p className="text-sm text-muted mb-4">
              Availability:{" "}
              <span className={book.availableQuantity > 0 ? "text-green-400" : "text-red-400"}>
                {book.availableQuantity > 0 ? `${book.availableQuantity} available` : "Out of stock"}
              </span>
            </p>

            <label className="block mb-2 text-sm font-semibold">Select rental days</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 3, 7, 14, 30].map((day) => (
                <button
                  key={day}
                  onClick={() => setDays(day)}
                  className={`px-4 py-2 rounded-lg transition ${
                    days === day
                      ? "bg-primary text-white"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {day} {day === 1 ? "day" : "days"}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => {
                const val = Math.max(1, Math.min(30, Number(e.target.value) || 1));
                setDays(val);
              }}
              className="w-full px-4 py-2 rounded bg-black/30 border border-white/10 mb-4"
              placeholder="Or enter custom days (1-30)"
            />

            <p className="text-lg mb-6">
              Total:{" "}
              <span className="font-bold text-primary">
                ₹{totalPrice}
              </span>
            </p>

            <button
              disabled={book.availableQuantity <= 0}
              onClick={() =>
                navigate("/checkout", {
                  state: { book, days, totalPrice },
                })
              }
              className={`w-full sm:w-auto px-6 py-3 rounded-xl transition ${
                book.availableQuantity > 0 ? "bg-primary hover:scale-105" : "bg-white/10 cursor-not-allowed"
              }`}
            >
              Proceed to Payment
            </button>
          </div>
        </div>

        {/* Right: cover */}
        <div className="flex-shrink-0 flex justify-center lg:justify-end lg:self-start lg:sticky lg:top-24">
          <BookCover src={book.coverImage} title={book.title} size="lg" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookDetails;
