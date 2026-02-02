import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/Unauthorized";

import UserDashboard from "../pages/user/Dashboard";
import LibrarianDashboard from "../pages/librarian/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import Profile from "../pages/user/Profile";
import BrowseBooks from "../pages/user/BrowseBooks";
import MyRentals from "../pages/user/MyRentals";
import Payments from "../pages/user/Payments";
import PaymentHistory from "../pages/user/PaymentHistory";

import QRCode from "../pages/user/QRCode";

import ScanQR from "../pages/librarian/ScanQR";
import Inventory from "../pages/librarian/Inventory";

import Users from "../pages/admin/Users";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";

import EbookBrowse from "../pages/ebooks/Browse";
import EbookDetails from "../pages/ebooks/Details";

import OfflineBrowse from "../pages/user/OfflineBrowse";
import IssueBook from "../pages/librarian/IssueBook";
import IssuedBooks from "../pages/librarian/IssuedBooks";

import BookDetails from "../pages/user/BookDetails";
import PaymentCheckout from "../pages/user/PaymentCheckout";

import ReturnBook from "../pages/librarian/ReturnBook";
import PenaltyDetails from "../pages/librarian/PenaltyDetails";

import Librarians from "../pages/admin/Librarians";
import Analytics from "../pages/admin/Analytics";
import AuditLogs from "../pages/admin/AuditLogs";
import Pricing from "../pages/admin/Pricing";
import AddBook from "../pages/books/AddBook";
import BlogsPage from "../pages/Blogs";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/blogs"
        element={
          <PublicRoute>
            <BlogsPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* User */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute role="user">
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/browse"
        element={
          <ProtectedRoute role="user">
            <BrowseBooks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/rentals"
        element={
          <ProtectedRoute role="user">
            <MyRentals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-rentals"
        element={
          <ProtectedRoute role="user">
            <MyRentals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute role="user">
            <PaymentHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/payments"
        element={
          <ProtectedRoute role="user">
            <Payments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/qr"
        element={
          <ProtectedRoute role="user">
            <QRCode />
          </ProtectedRoute>
        }
      />

      {/* Librarian */}
      <Route
        path="/librarian/dashboard"
        element={
          <ProtectedRoute role="librarian">
            <LibrarianDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/librarian/scan"
        element={
          <ProtectedRoute role="librarian">
            <ScanQR />
          </ProtectedRoute>
        }
      />

      <Route
        path="/librarian/inventory"
        element={
          <ProtectedRoute role="librarian">
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/librarian/books/add"
        element={
          <ProtectedRoute role="librarian">
            <AddBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/librarian/issue"
        element={
          <ProtectedRoute role="librarian">
            <IssueBook />
          </ProtectedRoute>
        }
      />

      <Route
        path="/librarian/issued"
        element={
          <ProtectedRoute role="librarian">
            <IssuedBooks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/librarian/return"
        element={
          <ProtectedRoute role="librarian">
            <ReturnBook />
          </ProtectedRoute>
        }
      />

      <Route
        path="/librarian/return/confirm"
        element={
          <ProtectedRoute role="librarian">
            <PenaltyDetails />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="admin">
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute role="admin">
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/librarians"
        element={
          <ProtectedRoute role="admin">
            <Librarians />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute role="admin">
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute role="admin">
            <AuditLogs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/pricing"
        element={
          <ProtectedRoute role="admin">
            <Pricing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/books/add"
        element={
          <ProtectedRoute role="admin">
            <AddBook />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <h1 className="text-3xl font-bold">404 – Page Not Found</h1>
          </div>
        }
      />
      <Route
        path="/ebooks"
        element={
          <ProtectedRoute role="user">
            <EbookBrowse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ebooks/:id"
        element={
          <ProtectedRoute role="user">
            <EbookDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/offline-books"
        element={
          <ProtectedRoute role="user">
            <OfflineBrowse />
          </ProtectedRoute>
        }
      />

      <Route
        path="/offline-books/:id"
        element={
          <ProtectedRoute role="user">
            <BookDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute role="user">
            <PaymentCheckout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
