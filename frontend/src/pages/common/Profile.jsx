import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Save, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { RoleBadge } from "../../components/Badge";

const Profile = () => {
  const { user, updateUserLocal } = useAuth();
  const fileInputRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    specialization: user?.specialization || "",
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put("/auth/profile", profileForm);
      updateUserLocal(res.data.user);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please choose an image under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setUploadingPhoto(true);
      try {
        const res = await api.put("/auth/profile-photo", { photo: reader.result });
        updateUserLocal({ ...user, profilePhoto: res.data.profilePhoto });
        toast.success("Profile photo updated");
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not upload photo");
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const initials = (user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile photo + basic info */}
      <div className="card flex items-center gap-5">
        <div className="relative">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-brand-700 text-white text-2xl font-semibold flex items-center justify-center">
              {initials}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-card hover:bg-brand-700"
            aria-label="Change photo"
          >
            <Camera size={14} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
        </div>
        <div>
          <p className="text-lg font-display font-semibold text-ink">{user?.name}</p>
          <p className="text-sm text-ink/50">{user?.email}</p>
          <div className="mt-2">
            <RoleBadge role={user?.role} />
          </div>
        </div>
      </div>

      {/* Update profile */}
      <div className="card">
        <h3 className="font-display font-semibold text-ink mb-4">Update Profile</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Full name</label>
              <input
                className="input-field"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Phone number</label>
              <input
                className="input-field"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
          </div>
          {user?.role === "doctor" && (
            <div>
              <label className="label-text">Specialization</label>
              <input
                className="input-field"
                placeholder="e.g. Cardiologist"
                value={profileForm.specialization}
                onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
              />
            </div>
          )}
          <button type="submit" disabled={savingProfile} className="btn-primary">
            <Save size={16} />
            {savingProfile ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h3 className="font-display font-semibold text-ink mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label-text">Current password</label>
            <input
              type="password"
              required
              className="input-field"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">New password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">Confirm new password</label>
              <input
                type="password"
                required
                className="input-field"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" disabled={savingPassword} className="btn-secondary">
            <KeyRound size={16} />
            {savingPassword ? "Updating..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
