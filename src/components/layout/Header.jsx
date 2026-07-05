import { LogOut, PanelLeft } from "lucide-react";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "../../lib/auth";

const Header = ({ isSideBarOpen, setIsSideBarOpen }) => {
  const { profile } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 flex items-center justify-between gap-4 py-3 px-4 sm:px-6">
      {/* mobile menu */}
      <button
        className="flex lg:hidden items-center justify-center p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        onClick={() => setIsSideBarOpen(!isSideBarOpen)}
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={20} />
      </button>

      <div className="flex flex-1 items-center justify-between gap-3 sm:gap-5">
        {/* avatar */}
        <div className="flex items-center gap-3">
          <img
            src={`${profile?.avatar_url ? profile.avatar_url : "https://ubiivtazirksgxswdqgd.supabase.co/storage/v1/object/public/Avatar/avatars/ce5acc93-cd42-4fd3-8efa-03d1976e54e0-jotd0o13za.jpeg"}`}
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <h2 className="font-semibold text-slate-800 text-sm">
              {profile?.username || "Guest User"}
            </h2>
            <span className="text-xs text-emerald-600 font-medium">user</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:block w-px h-8 bg-slate-200" />

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Signout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
