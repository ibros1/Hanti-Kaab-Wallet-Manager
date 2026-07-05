import {
  Banknote,
  Cog,
  Landmark,
  LayoutDashboard,
  LogOut,
  User2Icon,
  Wallet,
  X,
} from "lucide-react";
import { NavLink } from "react-router";

const mainLinks = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User2Icon },
  { to: "/accounts", label: "Accounts", icon: Landmark },
  { to: "/transactions", label: "Transactions", icon: Banknote },
];

const bottomLinks = [
  { to: "/settings", label: "Settings", icon: Cog },
  { to: "/logout", label: "Logout", icon: LogOut },
];

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
    isActive
      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;

const SideBar = ({ setIsSideBarOpen }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full bg-slate-900 min-h-screen flex flex-col overflow-auto">
      {/* logo */}
      <div className="flex justify-between items-center px-5 border-b border-slate-700/60 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white">
            <Wallet size={22} />
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">
            Hanti Kaab
          </h1>
        </div>
        <button
          className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-md transition-colors flex lg:hidden"
          onClick={() => setIsSideBarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* nav bars */}
      <div className="flex-1 flex flex-col px-3">
        <nav className="flex-1 py-5 space-y-1">
          <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>
          {mainLinks.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <item.icon size={20} className="shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* settings nav */}
        <nav className="mt-auto py-5 space-y-1 border-t border-slate-700/60">
          {bottomLinks.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <item.icon size={20} className="shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SideBar;
