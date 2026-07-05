import { Calendar, Crop, Phone, User } from "lucide-react";
import { Camera } from "lucide-react";
import { use, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_ERROR_MESSAGE } from "../constants/error";
import { useDispatch } from "react-redux";
import { uploadProfileFn } from "../redux/slices/Profile";

const FALLBACK_AVATAR =
  "https://ubiivtazirksgxswdqgd.supabase.co/storage/v1/object/public/Avatar/avatars/ce5acc93-cd42-4fd3-8efa-03d1976e54e0-jotd0o13za.jpeg";

const ProfilePage = () => {
  const { profile } = useAuth();
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const userId = user.id;
  const handleSave = (e) => {
    e.preventDefault();
    try {
      dispatch(uploadProfileFn({ avatar, userId, username }));
      toast.success("Changes saved");
    } catch (error) {
      console.error(error);
      toast.error(error || DEFAULT_ERROR_MESSAGE);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setAvatar(file);

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Maximum file size exceeded! 5mb");
    }
    const fileUrl = URL.createObjectURL(file);
    console.log(fileUrl);
    setAvatarUrl(fileUrl);
  };

  return (
    <form onSubmit={handleSave} className="py-6 max-w-6xl mx-auto">
      {/* header */}
      <div className="flex items-start justify-between gap-4 pt-4 py-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal information and photo.
          </p>
        </div>
        <button
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          Save Changes
        </button>
      </div>

      <div className="space-y-6 mt-6">
        {/* profile photo */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-800">Profile Photo</h2>
          <div className="flex items-center gap-5 mt-5">
            <div className="relative">
              <img
                src={
                  avatarUrl ? avatarUrl : profile?.avatar_url || FALLBACK_AVATAR
                }
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-white ring-2 ring-white">
                <Camera size={14} />
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">
                Upload a new photo
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an image and crop it to fit your profile.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className=" mt-2  inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Crop size={15} />
                Choose & Crop
              </button>
              <input
                ref={fileInputRef}
                type="file"
                id="avatar-upload"
                className=" hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </section>

        {/* personal information */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-800">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5 mt-5">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <User size={15} className="text-slate-500" />
                Full Name
              </label>
              <input
                type="text"
                defaultValue={profile?.username || ""}
                placeholder="Full name"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                defaultValue={profile?.username || ""}
                placeholder="username"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <Phone size={15} className="text-slate-500" />
                Phone
              </label>
              <input
                type="tel"
                placeholder="Phone number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>
        </section>

        {/* account details */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-800">Account Details</h2>
          <div className="grid sm:grid-cols-2 gap-6 mt-5">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Member Since</p>
                <p className="text-sm font-medium text-slate-800">
                  May 15, 2026
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User size={18} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Role</p>
                <p className="text-sm font-medium text-slate-800">
                  {profile?.role || "Admin"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
};

export default ProfilePage;
