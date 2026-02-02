import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import { useNavigate } from "react-router-dom";
import { rentalsApi } from "../../api/rentals";

const IssuedBooks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadIssuedBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await rentalsApi.staff({ status: "issued", limit: 50 });
        // Handle paginated response format
        const rentalsList = Array.isArray(res?.data) ? res?.data : (res?.data?.rentals || res?.rentals || []);
        setRentals(rentalsList);
      } catch (e) {
        console.error("Failed to load issued books:", e);
        setError(e?.message || "Failed to load issued books");
        setRentals([]);
      } finally {
        setLoading(false);
      }
    };
    loadIssuedBooks();
  }, []);

  const enriched = useMemo(() => {
    return (rentals || []).map((r) => {
      const due = r.dueDate ? new Date(r.dueDate) : null;
      const daysLeft = due ? Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24)) : null;
      const dueIn =
        daysLeft === null
          ? "—"
          : daysLeft >= 0
            ? `${daysLeft} day(s)`
            : `${Math.abs(daysLeft)} day(s) overdue`;
      return { ...r, dueIn, daysLeft };
    });
  }, [rentals]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Issued Books</h1>

      {loading && <p className="text-muted mb-4">Loading issued books...</p>}
      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}

      {!loading && !error && enriched.length === 0 && (
        <div className="p-8 rounded-xl card-theme border text-center">
          <p className="text-muted text-lg mb-2">No books currently issued</p>
          <p className="text-muted text-sm">All books have been returned.</p>
        </div>
      )}

      <div className="space-y-4 max-w-2xl">
        {enriched.map((item) => (
          <div
            key={item._id}
            className="p-5 rounded-xl card-theme border flex gap-4 items-center hover:bg-slate-50 dark:hover:bg-white/5 transition"
          >
            <BookCover
              src={item.book?.coverImage}
              title={item.book?.title}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p>
                <b>{item.book?.title || "Unknown Book"}</b>
              </p>
              <p className="text-muted text-sm">
                Author: {item.book?.author || "Unknown"}
              </p>
              <p className="text-muted text-sm">
                Issued to: {item.user?.name || item.user?.email || "Unknown User"}
              </p>
              <p className={`text-sm ${item.daysLeft < 0 ? "text-red-600 dark:text-red-400" : "text-muted"}`}>
                Due in: {item.dueIn}
              </p>
            </div>

            <button
              onClick={() => navigate(`/librarian/return?rentalId=${item._id}`, { state: { rentalId: item._id } })}
              className="flex-shrink-0 px-4 py-2 rounded-lg bg-primary text-sm hover:scale-105 transition"
            >
              Accept Return
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default IssuedBooks;
