import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, ChevronDown, LogOut, User,
  Settings, Menu, PanelLeftClose, Sun, Moon,
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import useThemeStore from "../store/useThemeStore";

/* Decode JWT payload without a library  */
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return {}; }
}

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function Navbar({ sidebarOpen, onToggleSidebar }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const claims = accessToken ? decodeJwt(accessToken) : {};
  const rawName = claims.name || claims.sub || "User";
  const displayName = rawName.includes("@") ? rawName.split("@")[0] : rawName;
  const formattedName = displayName.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const initials = getInitials(formattedName);

  const handleLogout = async () => {
    try {
      // No body needed — browser auto-sends the HTTP-only cookie
      await import("../api/axiosConfig").then(({ default: axiosInstance }) =>
        axiosInstance.post("/api/auth/logout")
      );
    } catch {
      // Even if the API call fails, clear local memory
    } finally {
      logout();
      navigate("/login");
    }
  };

  const isDark = theme === "dark";

  return (
    <header
      style={{ position: "fixed", top: 0, left: 0, right: 0, height: "64px", zIndex: 100 }}
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm flex items-center px-6"
    >
      {/*  Hamburger  */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        className="mr-3 w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer shrink-0"
      >
        {sidebarOpen
          ? <PanelLeftClose className="size-4.25 text-slate-500 dark:text-slate-400" />
          : <Menu className="size-4.25 text-slate-500 dark:text-slate-400" />}
      </button>

      {/* Brand  */}
      <div className="flex items-center">
        <img src="/logo-icon.png" alt="SalarySurvive" className="w-18 h-18 object-contain shrink-0" />
        <div className="leading-tight">
          <span className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Salary Survival</span>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium -mt-0.5">Personal Finance</p>
        </div>
      </div>

      <div className="flex-1" />

      {/*  Right Actions  */}
      <div className="flex items-center gap-3">
        {/* Welcome pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5">
          <span className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">Welcome,</span>
          <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{formattedName}</span>
        </div>

        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition cursor-pointer">
          <Bell className="size-4 text-slate-500 dark:text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        {/* User avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
              {initials}
            </div>
            <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-slate-900/50 py-2 z-50">

              {/* User header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[13px] font-bold shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate">{formattedName}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{claims.sub || ""}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                <button
                  onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <User className="size-4 text-slate-400 dark:text-slate-500" />
                  Profile
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <Settings className="size-4 text-slate-400 dark:text-slate-500" />
                  Settings
                </button>

                {/*  Theme toggle  */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {isDark
                    ? <Sun className="size-4 text-amber-400" />
                    : <Moon className="size-4 text-slate-400" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 dark:border-slate-700 p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="size-4 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


