import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { rentalsApi } from "../../api/rentals";
import { qrApi } from "../../api/qr";

const QRCode = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { rentalId } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [rental, setRental] = useState(null);
  const [qr, setQr] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      // Try to get rentalId from state, URL params, or localStorage
      let id = rentalId;
      
      // If no rentalId in state, try to get from URL or localStorage
      if (!id) {
        const urlParams = new URLSearchParams(window.location.search);
        id = urlParams.get('rentalId');
      }
      
      if (!id) {
        // Try to get the most recent rental from user's rentals
        try {
          const rentalsRes = await rentalsApi.my({ limit: 1, status: 'pending' });
          const rentals = rentalsRes?.data || rentalsRes?.rentals || [];
          if (rentals.length > 0) {
            id = rentals[0]._id;
          }
        } catch (e) {
          console.error("Failed to fetch recent rental:", e);
        }
      }

      if (!id) {
        setLoading(false);
        setError("No rental ID found. Please rent a book first.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const rentalRes = await rentalsApi.get(id);
        const r = rentalRes?.data?.rental || rentalRes?.rental;
        setRental(r);

        if (r) {
          const qrRes = await qrApi.byRental(r._id || id, "issue");
          const q = qrRes?.data?.qr || qrRes?.qr;
          const img = qrRes?.data?.qrCodeImage || qrRes?.qrCodeImage;
          setQr(q);
          setQrImage(img);
        }
      } catch (e) {
        console.error("QR load error:", e);
        setError(e?.message || "Failed to load QR. Please ensure you have an active rental.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rentalId]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Library QR Code</h1>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted">Loading QR code...</p>
        </div>
      )}
      {error && (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard/rentals")}
            className="px-4 py-2 rounded-lg bg-primary text-sm"
          >
            View My Rentals
          </button>
        </div>
      )}
      {!loading && !error && !rental && (
        <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-muted text-lg mb-2">No active rental found</p>
          <p className="text-muted text-sm mb-4">Please rent a book first to generate a QR code.</p>
          <button
            onClick={() => navigate("/offline-books")}
            className="px-6 py-3 rounded-xl bg-primary hover:scale-105 transition"
          >
            Browse Books
          </button>
        </div>
      )}

      {!loading && !error && rental && (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10">
            {qrImage ? (
              <img src={qrImage} alt="QR Code" className="w-48 h-48 rounded-xl bg-white p-2" />
            ) : (
              <div className="w-48 h-48 bg-white text-black flex items-center justify-center rounded-xl font-semibold">
                QR
              </div>
            )}

            <p className="text-muted text-sm mt-4 text-center">
              Show this QR code at the library counter
            </p>
            {rental?.status === "pending" && (
              <p className="text-yellow-400 text-xs mt-2 text-center">
                ⏳ Waiting for library issue
              </p>
            )}
            {rental?.status === "issued" && (
              <p className="text-green-400 text-xs mt-2 text-center">
                ✅ Book collected
              </p>
            )}
          </div>

          {/* Details */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h3 className="text-xl font-semibold mb-4">
              Rental Details
            </h3>

            <p>
              <span className="text-muted">Book:</span>{" "}
              <b>{rental?.book?.title || "—"}</b>
            </p>

            <p>
              <span className="text-muted">Author:</span>{" "}
              {rental?.book?.author || "—"}
            </p>

            <p>
              <span className="text-muted">Rental Days:</span>{" "}
              {rental?.rentalDays ?? "—"}
            </p>

            <p>
              <span className="text-muted">Total Paid:</span>{" "}
              <b className="text-primary">₹{rental?.payment?.amount ?? "—"}</b>
            </p>

            <p>
              <span className="text-muted">QR Code:</span>{" "}
              {qr?.qrCode ? <span className="font-mono text-xs break-all">{qr.qrCode}</span> : "—"}
            </p>
            {rental?.dueDate && (
              <p>
                <span className="text-muted">Due Date:</span>{" "}
                <span className="text-yellow-400 font-semibold">
                  {new Date(rental.dueDate).toLocaleDateString()}
                </span>
              </p>
            )}
            <p>
              <span className="text-muted">Status:</span>{" "}
              <span className={`px-2 py-1 rounded text-xs ${
                rental?.status === "issued" ? "bg-green-500/20 text-green-400" :
                rental?.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-white/10 text-muted"
              }`}>
                {rental?.status?.toUpperCase() || "—"}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate("/dashboard/rentals")}
          className="px-6 py-3 rounded-xl bg-primary hover:scale-105 transition"
        >
          View My Rentals
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </DashboardLayout>
  );
};

export default QRCode;
