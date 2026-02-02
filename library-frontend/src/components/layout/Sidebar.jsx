import { Link, useLocation } from "react-router-dom";
import useAuth from "../../context/useAuth";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-primary/20 text-primary font-medium"
      : "hover:bg-slate-200 dark:hover:bg-white/10";

  return (
    <div className="h-full p-6 space-y-8 text-slate-900 dark:text-slate-100">
      <h2 className="text-lg font-bold tracking-wide">Dashboard</h2>

      <nav className="space-y-2 text-sm">
        {user?.role === "user" && (
          <>
            <Link
              to="/dashboard"
              className={`block px-4 py-2 rounded-lg ${isActive("/dashboard")}`}
            >
              Overview
            </Link>
            <Link
              to="/offline-books"
              className={`block px-4 py-2 rounded-lg ${isActive("/offline-books")}`}
            >
              Offline Library
            </Link>

            <Link
              to="/ebooks"
              className={`block px-4 py-2 rounded-lg ${isActive("/ebooks")}`}
            >
              Free eBooks
            </Link>

            <Link
              to="/dashboard/rentals"
              className={`block px-4 py-2 rounded-lg ${isActive("/dashboard/rentals")}`}
            >
              My Rentals
            </Link>

            <Link
              to="/dashboard/qr"
              className={`block px-4 py-2 rounded-lg ${isActive("/dashboard/qr")}`}
            >
              QR Code
            </Link>

            <Link
              to="/dashboard/payments"
              className={`block px-4 py-2 rounded-lg ${isActive("/dashboard/payments")}`}
            >
              Payments
            </Link>
            
            <Link
              to="/profile"
              className={`block px-4 py-2 rounded-lg ${isActive("/profile")}`}
            >
              My Profile
            </Link>
          </>
        )}

        {user?.role === "librarian" && (
          <>
            <Link
              to="/librarian/dashboard"
              className={`block px-4 py-2 rounded-lg ${isActive(
                "/librarian/dashboard"
              )}`}
            >
              Overview
            </Link>
            <Link
              to="/librarian/scan"
              className={`block px-4 py-2 rounded-lg ${isActive("/librarian/scan")}`}
            >
              Scan QR
            </Link>
            <Link
              to="/librarian/issued"
              className={`block px-4 py-2 rounded-lg ${isActive("/librarian/issued")}`}
            >
              Issued Books
            </Link>
            <Link
              to="/librarian/inventory"
              className={`block px-4 py-2 rounded-lg ${isActive("/librarian/inventory")}`}
            >
              Inventory
            </Link>
            <Link
              to="/librarian/books/add"
              className={`block px-4 py-2 rounded-lg ${isActive("/librarian/books/add")}`}
            >
              Add Book
            </Link>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <Link
              to="/admin/dashboard"
              className={`block px-4 py-2 rounded-lg ${isActive(
                "/admin/dashboard"
              )}`}
            >
              Overview
            </Link>
            <Link
              to="/admin/users"
              className={`block px-4 py-2 rounded-lg ${isActive("/admin/users")}`}
            >
              Users
            </Link>
            <Link
              to="/admin/reports"
              className={`block px-4 py-2 rounded-lg ${isActive("/admin/reports")}`}
            >
              Reports
            </Link>
            <Link
              to="/admin/librarians"
              className={`block px-4 py-2 rounded-lg ${isActive("/admin/librarians")}`}
            >
              Librarians
            </Link>
            <Link
              to="/admin/analytics"
              className={`block px-4 py-2 rounded-lg ${isActive("/admin/analytics")}`}
            >
              Analytics
            </Link>
            <Link
              to="/admin/audit-logs"
              className={`block px-4 py-2 rounded-lg ${isActive("/admin/audit-logs")}`}
            >
              Audit Logs
            </Link>
            <Link
              to="/admin/pricing"
              className={`block px-4 py-2 rounded-lg ${isActive("/admin/pricing")}`}
            >
              Pricing & Rules
            </Link>
            <Link
              to="/admin/settings"
              className={`block px-4 py-2 rounded-lg ${isActive("/admin/settings")}`}
            >
              Settings
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
