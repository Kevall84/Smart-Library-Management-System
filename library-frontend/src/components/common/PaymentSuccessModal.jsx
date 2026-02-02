import { useEffect } from "react";
import BookCover from "./BookCover";

const PaymentSuccessModal = ({ isOpen, onClose, rentalData, qrCodeImage }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const rental = rentalData?.rental || rentalData;
  const payment = rentalData?.payment || rental?.payment;
  const qr = rentalData?.qr || {};

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl dark:bg-gray-900 dark:text-white dark:border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition dark:text-white/60 dark:hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-500/20">
              <svg className="w-12 h-12 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-2">🎉 Book Rented Successfully!</h2>
          <p className="text-center text-muted mb-8">
            Your payment has been processed and QR code generated
          </p>

          {/* QR Code */}
          {qrCodeImage && (
            <div className="flex flex-col items-center mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 dark:bg-white/5 dark:border-white/10">
              <h3 className="text-lg font-semibold mb-4">Your QR Code</h3>
              <img
                src={qrCodeImage}
                alt="QR Code"
                className="w-48 h-48 rounded-xl bg-white p-2 mb-4"
              />
              <p className="text-sm text-muted text-center">
                Show this QR code at the library counter to collect your book
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Book Details */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-primary">Book Details</h3>
              <div className="flex gap-4 mb-4">
                <BookCover
                  src={rental?.book?.coverImage}
                  title={rental?.book?.title}
                  size="md"
                />
                <div className="flex-1 min-w-0 space-y-2 text-sm">
                  <p>
                    <span className="text-muted">Title:</span>{" "}
                    <span className="font-semibold">{rental?.book?.title || "—"}</span>
                  </p>
                  <p>
                    <span className="text-muted">Author:</span>{" "}
                    {rental?.book?.author || "—"}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted">Rental Days:</span>{" "}
                  <span className="font-semibold">{rental?.rentalDays || "—"} day(s)</span>
                </p>
                <p>
                  <span className="text-muted">Due Date:</span>{" "}
                  <span className="font-semibold text-yellow-400">
                    {formatDate(rental?.dueDate)}
                  </span>
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10">
              <h3 className="text-lg font-semibold mb-4 text-primary">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted">Amount Paid:</span>{" "}
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ₹{payment?.amount || rental?.payment?.amount || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-muted">Payment Method:</span>{" "}
                  {payment?.paymentMethod || "Razorpay"}
                </p>
                <p>
                  <span className="text-muted">Transaction ID:</span>{" "}
                  <span className="font-mono text-xs">
                    {payment?.transactionId || payment?.providerOrderId || "—"}
                  </span>
                </p>
                <p>
                  <span className="text-muted">Status:</span>{" "}
                  <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs dark:bg-green-500/20 dark:text-green-400">
                    {payment?.paymentStatus === "completed" ? "Completed" : payment?.paymentStatus || "—"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Rental Status */}
          <div className="p-6 rounded-xl bg-blue-50 border border-blue-200 mb-8 dark:bg-blue-500/10 dark:border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Rental Status</p>
                <p className="text-lg font-semibold">
                  {rental?.status === "pending" ? "Pending - Awaiting Library Issue" : 
                   rental?.status === "issued" ? "Issued - Book Collected" :
                   rental?.status || "Pending"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted">Rental ID</p>
                <p className="text-xs font-mono">{rental?._id?.slice(-8) || "—"}</p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 mb-8 dark:bg-yellow-500/10 dark:border-yellow-500/20">
            <p className="text-sm text-yellow-900 dark:text-yellow-300">
              <strong>📌 Important:</strong> Please visit the library with this QR code to collect your book. 
              The QR code is valid for 24 hours. Return the book by{" "}
              <strong>{formatDate(rental?.dueDate)}</strong> to avoid penalties.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                const rentalId = rental?._id;
                if (rentalId) {
                  window.location.href = `/dashboard/qr?rentalId=${rentalId}`;
                } else {
                  window.location.href = "/dashboard/qr";
                }
              }}
              className="flex-1 px-6 py-3 rounded-xl bg-primary text-white hover:scale-105 transition font-semibold"
            >
              View QR Code
            </button>
            <button
              onClick={() => window.location.href = "/dashboard/rentals"}
              className="flex-1 px-6 py-3 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 transition dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              My Rentals
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-slate-50 text-slate-900 hover:bg-slate-100 transition dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
