import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold mb-4">403 — Unauthorized</h1>
      <p className="text-muted mb-6">
        You don’t have permission to access this page.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-xl bg-primary hover:scale-105 transition"
      >
        Go Home
      </Link>
    </div>
  );
};

export default Unauthorized;
