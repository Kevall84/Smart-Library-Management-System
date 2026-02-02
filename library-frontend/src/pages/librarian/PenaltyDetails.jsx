import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

const PenaltyDetails = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Return Completed
      </h1>

      <div className="max-w-lg p-6 rounded-2xl card-theme border space-y-4">
        <p>
          Book has been successfully returned.
        </p>

        <p>
          Penalty collected:{" "}
          <b className="text-primary">₹100</b>
        </p>

        <button
          onClick={() => navigate("/librarian/issued")}
          className="mt-6 px-6 py-3 rounded-xl bg-primary hover:scale-105 transition"
        >
          Back to Issued Books
        </button>
      </div>
    </DashboardLayout>
  );
};

export default PenaltyDetails;
