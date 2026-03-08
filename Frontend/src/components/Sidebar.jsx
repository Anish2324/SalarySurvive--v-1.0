import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Banknote, Receipt, PieChart, TrendingUp, ChevronRight, UserCircle,
} from "lucide-react";

const SIDEBAR_W = 260;

const NAV_ITEMS = [
  {
    path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", description: "Overview & analytics",
    accent: "text-blue-500",
    activeBg: "bg-blue-50 dark:bg-blue-500/10",
    activeBorder: "border-blue-500",
    activeIcon: "bg-blue-500",
    dot: "bg-blue-500",
  },
  {
    path: "/salary", icon: Banknote, label: "Salary", description: "Income management",
    accent: "text-emerald-500",
    activeBg: "bg-emerald-50 dark:bg-emerald-500/10",
    activeBorder: "border-emerald-500",
    activeIcon: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  {
    path: "/expenses", icon: Receipt, label: "Expenses", description: "Track spending",
    accent: "text-rose-500",
    activeBg: "bg-rose-50 dark:bg-rose-500/10",
    activeBorder: "border-rose-500",
    activeIcon: "bg-rose-500",
    dot: "bg-rose-500",
  },
  {
    path: "/budget", icon: PieChart, label: "Budget", description: "Plan & allocate",
    accent: "text-violet-500",
    activeBg: "bg-violet-50 dark:bg-violet-500/10",
    activeBorder: "border-violet-500",
    activeIcon: "bg-violet-500",
    dot: "bg-violet-500",
  },
  {
    path: "/profile", icon: UserCircle, label: "Profile", description: "Account & settings",
    accent: "text-slate-500",
    activeBg: "bg-slate-100 dark:bg-slate-500/10",
    activeBorder: "border-slate-500",
    activeIcon: "bg-slate-500",
    dot: "bg-slate-500",
  },
];

export default function Sidebar({ open }) {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path || (path === "/dashboard" && location.pathname === "/");

  return (
    <aside
      style={{
        width: `${SIDEBAR_W}px`,
        transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        top: "64px", bottom: 0, left: 0, position: "fixed",
        zIndex: 50, overflowY: "auto", overflowX: "hidden",
      }}
      className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-sm flex flex-col"
    >
      {/* Section label */}
      <div className="px-5 pt-6 pb-3">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-600 uppercase">
          Main Menu
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ path, icon: Icon, label, description, accent, activeBg, activeBorder, activeIcon, dot }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-150 border-l-[3px] ${
                active
                  ? `${activeBg} ${activeBorder}`
                  : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {/* Icon container */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                active ? `${activeIcon} shadow-sm` : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
              }`}>
                <Icon className={`size-4.25 transition-colors ${active ? "text-white" : `${accent}`}`} />
              </div>

              {/* Label + description */}
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-semibold leading-tight ${
                  active ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                }`}>
                  {label}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5 leading-none">{description}</p>
              </div>

              {/* Active chevron / dot */}
              {active
                ? <ChevronRight className={`size-3.5 shrink-0 ${accent}`} />
                : <span className={`w-1.5 h-1.5 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${dot}`} />}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-5 border-t border-slate-100 dark:border-slate-700/50 my-4" />

      {/* Footer card */}
      <div className="px-4 pb-6">
        <div className="bg-linear-to-br from-blue-500 to-violet-600 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="size-4 text-white" />
            </div>
            <p className="text-white text-[13px] font-semibold leading-tight">Stay on Track</p>
            <p className="text-white/75 text-[11px] mt-1 leading-relaxed">Review your budget goals weekly for best results.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}


