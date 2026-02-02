import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../context/useAuth";
import { authApi } from "../../api/auth";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Note: backend currently supports profilePhoto as a string (URL/path).
      // For file upload we’d need a dedicated upload endpoint (requires approval).
      const profilePhoto = photo ? null : user?.profilePhoto || null;
      const res = await authApi.updateProfile({ name, phone, address, profilePhoto });
      const nextUser = res?.data?.user || res?.user;
      if (nextUser) setUser(nextUser);
      alert("Profile updated successfully");
    } catch (e) {
      alert(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("Please enter current and new password");
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      alert("Password changed successfully");
    } catch (e) {
      alert(e?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="max-w-3xl space-y-8">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/70">
          {/* Profile Photo */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-500 text-sm font-medium shadow-inner dark:bg-white/10 dark:text-muted">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>No Photo</span>
              )}
            </div>

            <div>
              <p className="text-sm text-muted mb-1">Signed in as</p>
              <p className="font-semibold text-lg">{user?.name}</p>
              <p className="text-sm text-muted">{user?.email}</p>
              <label className="mt-3 inline-flex cursor-pointer text-primary text-sm font-medium hover:underline">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 dark:bg-black/40 dark:border-white/10 dark:text-white"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
                Phone
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 dark:bg-black/40 dark:border-white/10 dark:text-white"
              />
            </div>
          </div>

          {/* Address */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-muted mb-1 uppercase tracking-wide">
              Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 dark:bg-black/40 dark:border-white/10 dark:text-white"
            />
          </div>

          {/* Save */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Password Card */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/70">
          <h3 className="text-lg font-semibold mb-2">Change Password</h3>
          <p className="text-sm text-muted mb-4">
            Use a strong password with at least 8 characters, including uppercase, lowercase, and a number.
          </p>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 dark:bg-black/40 dark:border-white/10 dark:text-white"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 dark:bg-black/40 dark:border-white/10 dark:text-white"
            />
            <div className="flex justify-end">
              <button
                onClick={handleChangePassword}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition dark:bg-white/10 dark:text-white dark:hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={saving}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
