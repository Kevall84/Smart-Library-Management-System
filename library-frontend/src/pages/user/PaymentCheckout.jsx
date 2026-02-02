import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import BookCover from "../../components/common/BookCover";
import PaymentSuccessModal from "../../components/common/PaymentSuccessModal";
import { useState } from "react";
import { rentalsApi } from "../../api/rentals";
import { paymentsApi } from "../../api/payments";
import { loadRazorpayScript } from "../../utils/razorpay";

const PaymentCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rentalData, setRentalData] = useState(null);

  // Data passed from BookDetails
  const { book, days, totalPrice } = location.state || {};

  // Safety check
  if (!book) {
    return (
      <DashboardLayout>
        <p className="text-muted">Invalid checkout session.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Payment Checkout</h1>

      {/* Summary Card */}
      <div className="max-w-lg p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

        <div className="flex gap-4 mb-4">
          <BookCover src={book.coverImage} title={book.title} size="md" />
          <div className="flex-1 min-w-0 space-y-1 text-sm">
            <p>
              <span className="text-muted">Book:</span>{" "}
              <b>{book.title}</b>
            </p>
            <p>
              <span className="text-muted">Author:</span>{" "}
              {book.author}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted">Days:</span>{" "}
            {days}
          </p>
          <p>
            <span className="text-muted">Rent / day:</span>{" "}
            ₹{book.rentPerDay}
          </p>
        </div>

        <hr className="my-4 border-white/10" />

        <p className="text-lg">
          Total Amount:{" "}
          <span className="font-bold text-primary">
            ₹{totalPrice}
          </span>
        </p>
      </div>

      {/* Pay Button */}
      <button
        disabled={paying}
        onClick={async () => {
          setPaying(true);
          try {
            const ok = await loadRazorpayScript();
            if (!ok) throw new Error("Failed to load Razorpay");

            // Get Razorpay key from backend
            const configRes = await paymentsApi.config();
            const razorpayKeyId = configRes?.data?.razorpayKeyId || configRes?.razorpayKeyId || import.meta?.env?.VITE_RAZORPAY_KEY_ID;
            
            if (!razorpayKeyId) {
              throw new Error("Razorpay is not configured. Please contact administrator.");
            }

            // Create rental + payment(order)
            const res = await rentalsApi.create({ bookId: book._id, rentalDays: days });
            const rental = res?.data?.rental || res?.rental;
            const payment = res?.data?.payment || res?.payment;
            const providerOrderId = res?.data?.provider?.providerOrderId || res?.provider?.providerOrderId || payment?.providerOrderId;

            if (!rental || !payment || !providerOrderId) {
              throw new Error("Failed to initiate payment");
            }

            const options = {
              key: razorpayKeyId,
              amount: Math.round(Number(totalPrice) * 100),
              currency: "INR",
              name: "SmartLib",
              description: `Rental payment for ${book.title}`,
              order_id: providerOrderId,
              handler: async function (response) {
                try {
                  const verify = await paymentsApi.verifyRazorpay({
                    paymentId: payment._id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  });

                  // Store the verified rental data for the success modal
                  const verifiedData = {
                    rental: verify?.data?.rental || verify?.rental || rental,
                    payment: verify?.data?.payment || verify?.payment || payment,
                    qr: verify?.data?.qr || verify?.qr,
                    qrCodeImage: verify?.data?.qrCodeImage || verify?.qrCodeImage,
                  };
                  
                  setRentalData(verifiedData);
                  setShowSuccessModal(true);
                  setPaying(false);
                } catch (e) {
                  alert(e?.message || "Payment verification failed");
                  setPaying(false);
                }
              },
              prefill: {
                name: "",
                email: "",
              },
              theme: { color: "#6D28D9" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
          } catch (e) {
            alert(e?.message || "Payment failed");
          } finally {
            setPaying(false);
          }
        }}
        className="px-8 py-3 rounded-xl bg-primary hover:scale-105 transition"
      >
        {paying ? "Processing..." : "Pay & Generate QR"}
      </button>

      {/* Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/dashboard");
        }}
        rentalData={rentalData}
        qrCodeImage={rentalData?.qrCodeImage}
      />
    </DashboardLayout>
  );
};

export default PaymentCheckout;
