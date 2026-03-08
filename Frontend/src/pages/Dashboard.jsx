import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosConfig";
import { CURRENCIES, formatCurrency } from "../utils/currency";
import {
  Wallet,
  CreditCard,
  Landmark,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Loader2,
  RefreshCcw,
  PiggyBank,
  AlertTriangle,
  BookOpen,
  Linkedin,
  Facebook,
  Instagram,
  Mail,
} from "lucide-react";
import {
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  ComposedChart,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PIE_COLORS = [
  "#2563EB", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
];

const RANK_COLORS = [
  "bg-amber-500 text-white",
  "bg-slate-400 text-white",
  "bg-orange-500 text-white",
  "bg-blue-500 text-white",
  "bg-emerald-500 text-white",
];

const BAR_COLORS = [
  "bg-amber-500",
  "bg-slate-400",
  "bg-orange-500",
  "bg-blue-500",
  "bg-emerald-500",
];

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */

/* formatCurrency — imported from ../utils/currency */

function getHealthConfig(score) {
  if (score >= 80) {
    return {
      bg: "bg-emerald-600",
      icon: ShieldCheck,
      label: "Excellent",
      message: "Outstanding financial health! You are on the right track.",
      statsBg: "bg-emerald-700/40",
      textMuted: "text-emerald-100",
    };
  } else if (score >= 50) {
    return {
      bg: "bg-amber-500",
      icon: ShieldAlert,
      label: "Good",
      message: "Good progress! Small improvements can make a big difference.",
      statsBg: "bg-amber-600/40",
      textMuted: "text-amber-100",
    };
  } else {
    return {
      bg: "bg-rose-600",
      icon: ShieldX,
      label: "Needs Attention",
      message: "Time to review your spending habits and create a better plan.",
      statsBg: "bg-rose-700/40",
      textMuted: "text-rose-100",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════
   LOADING STATE
   ═══════════════════════════════════════════════════════════════ */

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-8 text-blue-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-lg font-semibold text-slate-900">
          Loading Dashboard
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Fetching your financial data...
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ERROR STATE
   ═══════════════════════════════════════════════════════════════ */

function ErrorState({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl text-red-500 font-bold">{"!"}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Unable to Load Data
        </h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium cursor-pointer"
        >
          <RefreshCcw className="size-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD HEADER
   ═══════════════════════════════════════════════════════════════ */
function DashboardHeader({ selectedMonth, selectedYear, onMonthChange, onYearChange, currency, onCurrencyChange, rateLoading = false }) {
  return (
    <header className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-7 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Financial Dashboard
          </h1>
          <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear} Overview
          </p>
        </div>

        {/* Month / Year Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 bg-slate-100 rounded-lg">
            <CalendarDays className="size-4 text-slate-500" />
          </div>

          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(parseInt(e.target.value))}
              className="appearance-none h-9 pl-3 pr-8 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:scheme-dark"
            >
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="appearance-none h-9 pl-3 pr-8 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:scheme-dark">

              {[2024, 2025, 2026, 2027,2028,2029,2030].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Currency selector */}
          <div className="relative flex items-center gap-2">
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="appearance-none h-9 pl-3 pr-8 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:scheme-dark"
              >
                {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
                  <option key={code} value={code}>{symbol} {code}</option>
                ))}
              </select>
              <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {rateLoading && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap animate-pulse">Fetching rate…</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
/* ═══════════════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════════════ */

function StatCard({
  icon: Icon,
  label,
  value,
  badge,
  badgeColor = "bg-emerald-50 text-emerald-700",
  accentColor = "bg-emerald-500",
  iconBg = "bg-emerald-50 text-emerald-600",
  trend = "neutral",
  trendLabel = "",
}) {
  const TrendIcon = trendIcons[trend] || Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
        ? "text-rose-600"
        : "text-slate-500";

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      <div className={`h-1 ${accentColor}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className="size-5" />
          </div>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeColor}`}>
            {badge}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500 mb-1.5">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
          {value}
        </p>
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-200">
          <TrendIcon className={`size-3.5 ${trendColor}`} />
          <span className="text-xs text-slate-500 dark:text-slate-400">{trendLabel}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEALTH SCORE
   ═══════════════════════════════════════════════════════════════ */

function HealthScore({ score = 0, savingsRatio = 0, categoryCount = 0, isOverBudget = false }) {
  const config = getHealthConfig(score);
  const IconComponent = config.icon;

  return (
    <div className={`${config.bg} rounded-2xl p-8 lg:p-10 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full -ml-12 -mb-12" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-shrink=0 text-center">
            <IconComponent className="size-14 text-white/90 mx-auto mb-3" />
            <div className="text-6xl font-bold text-white font-mono tracking-tighter">
              {score}
            </div>
            <div className="mt-3 bg-white/20 backdrop-blur-sm px-5 py-1.5 rounded-full text-white text-sm font-semibold inline-block">
              {config.label}
            </div>
          </div>

          <div className="flex-grow=1 w-full">
            <div className={`${config.statsBg} backdrop-blur-sm rounded-xl p-6`}>
              <h3 className="text-white text-lg font-semibold mb-2">
                Financial Health Assessment
              </h3>
              <p className={`${config.textMuted} leading-relaxed`}>{config.message}</p>

              <div className="grid grid-cols-3 gap-6 mt-6 pt-5 border-t border-white/15">
                <div className="text-center">
                  <div className="text-xl font-bold text-white font-mono">{savingsRatio}%</div>
                  <div className={`${config.textMuted} text-xs mt-0.5`}>Savings Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white font-mono">{categoryCount}</div>
                  <div className={`${config.textMuted} text-xs mt-0.5`}>Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white font-mono">
                    {isOverBudget ? "Over" : "Under"}
                  </div>
                  <div className={`${config.textMuted} text-xs mt-0.5`}>Budget Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM CHART TOOLTIP
   ═══════════════════════════════════════════════════════════════ */

function CustomTooltip({ active, payload, label, currency = "INR", exchangeRate = 1 }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600">
        <p className="font-semibold text-slate-900 text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs py-0.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {formatCurrency(entry.value, currency, exchangeRate)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   PIE LABEL RENDERER
   ═══════════════════════════════════════════════════════════════ */

function renderPieLabel({ cx, cy, midAngle, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#64748B"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[11px] font-medium"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TREND CHART (Area + Line)
   ═══════════════════════════════════════════════════════════════ */

function TrendChart({ data = [], currency = "INR", exchangeRate = 1 }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-block w-1 h-6 rounded-full bg-blue-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">6-Month Financial Trend</h3>
      </div>

      <div className="h-80 lg:h-96">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="month"
              tickFormatter={(m) => MONTH_NAMES[m - 1]?.slice(0, 3) ?? m}
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${CURRENCIES[currency]?.symbol ?? "₹"}${(v / 1000).toFixed(0)}k`}
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
              width={56}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} currency={currency} />} />
            <Legend
              verticalAlign="top"
              height={40}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
            />
            <Area
              type="monotone"
              dataKey="salary"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.12}
              name="Salary"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#EF4444"
              fill="#EF4444"
              fillOpacity={0.1}
              name="Expense"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ fill: "#2563EB", r: 3.5, strokeWidth: 0 }}
              activeDot={{ r: 5.5, strokeWidth: 0 }}
              name="Savings"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXPENSE DISTRIBUTION (Donut Pie)
   ═══════════════════════════════════════════════════════════════ */

function ExpenseDistribution({ data = [], currency = "INR", exchangeRate = 1 }) {
  if (data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-block w-1 h-6 rounded-full bg-violet-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expense Distribution</h3>
      </div>

      <div className="h-80 lg:h-96">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderPieLabel}
              outerRadius={100}
              innerRadius={62}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value, currency, exchangeRate)}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "8px 14px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "13px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MONTHLY SUMMARY BAR CHART
   ═══════════════════════════════════════════════════════════════ */

function MonthlySummaryBar({ salary = 0, expense = 0, balance = 0, currency = "INR", exchangeRate = 1 }) {
  const data = [{ name: "Overview", salary, expense, balance }];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-block w-1 h-6 rounded-full bg-blue-500" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Financial Summary</h3>
      </div>

      <div className="h-72 lg:h-80">
        <ResponsiveContainer width="100%" height={288}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} barSize={56}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${CURRENCIES[currency]?.symbol ?? "₹"}${(v / 1000).toFixed(0)}k`}
              tick={{ fill: "#64748B", fontSize: 12 }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
              width={56}
            />
            <Tooltip content={(props) => <CustomTooltip {...props} currency={currency} />} />
            <Legend
              verticalAlign="top"
              height={40}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
            />
            <Bar dataKey="salary" fill="#10B981" radius={[6, 6, 0, 0]} name="Salary" />
            <Bar dataKey="expense" fill="#EF4444" radius={[6, 6, 0, 0]} name="Expense" />
            <Bar dataKey="balance" fill="#2563EB" radius={[6, 6, 0, 0]} name="Balance" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TOP SPENDING CATEGORIES
   ═══════════════════════════════════════════════════════════════ */

function TopCategories({ categories = [], currency = "INR", exchangeRate = 1 }) {
  if (categories.length === 0) return null;

  const maxAmount = Math.max(...categories.map((c) => c.amount));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="inline-block w-1 h-6 rounded-full bg-amber-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Spending Categories</h3>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          All Time
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {categories.map((cat, index) => {
          const pct = maxAmount > 0 ? (cat.amount / maxAmount) * 100 : 0;
          const rankColor = RANK_COLORS[index] || RANK_COLORS[3];
          const barColor = BAR_COLORS[index] || BAR_COLORS[3];

          return (
            <div key={index} className="group">
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-lg ${rankColor} flex items-center justify-center text-xs font-bold shrink-0`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm text-slate-700 dark:text-white truncate">
                      {cat.category}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate font-mono ml-3">
                      {formatCurrency(cat.amount, currency, exchangeRate)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700 group-hover:brightness-110`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BUDGET VS ACTUAL CHART
   ═══════════════════════════════════════════════════════════════ */

/**
 * Grouped bar chart comparing budget limit vs actual spending per category.
 * Budget bars are rendered in muted violet; Actual bars are individually
 * coloured: emerald (safe) → amber (near limit, ≥80%) → rose (exceeded).
 */
function BudgetVsActualChart({ data = [], month, year, currency = "INR", exchangeRate = 1 }) {
  if (data.length === 0) return null;

  const chartData = data.map((s) => ({
    name: s.category.charAt(0) + s.category.slice(1).toLowerCase(),
    "Budget Limit": s.limitAmount,
    "Actual Spent": s.spentAmount,
    exceeded: s.exceeded,
    nearLimit: !s.exceeded && s.limitAmount > 0 && s.spentAmount / s.limitAmount >= 0.8,
  }));

  return (
    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-5">
        <span className="inline-block w-1 h-5 rounded-full bg-violet-500" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Budget vs Actual — {MONTH_NAMES[month - 1]} {year}
        </h3>
        <div className="ml-auto flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-violet-400/40" />Budget Limit
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-500" />Under
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400" />Near
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-500" />Exceeded
          </span>
        </div>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            barSize={18}
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "#64748B", fontSize: 10 }}
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${CURRENCIES[currency]?.symbol ?? "₹"}${(v / 1000).toFixed(0)}k`}
              tick={{ fill: "#64748B", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip
              formatter={(value, name) => [formatCurrency(value, currency), name]}
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
            />
            {/* Budget Limit bars — muted violet fill */}
            <Bar dataKey="Budget Limit" fill="#8B5CF6" fillOpacity={0.22} radius={[4, 4, 0, 0]} />
            {/* Actual Spent bars — per-cell colour based on status */}
            <Bar dataKey="Actual Spent" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={
                    entry.exceeded ? "#EF4444" :
                    entry.nearLimit ? "#F59E0B" :
                    "#10B981"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD (Default Export)
   ═══════════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currency, setCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [rateLoading, setRateLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  /* fetch live INR → target exchange rate from Frankfurter (free, no API key) */
  useEffect(() => {
    if (currency === "INR") {
      setExchangeRate(1);
      return;
    }
    setRateLoading(true);
    fetch(`https://api.frankfurter.app/latest?from=INR&to=${currency}`)
      .then((r) => r.json())
      .then((data) => setExchangeRate(data.rates?.[currency] ?? 1))
      .catch(() => setExchangeRate(1))
      .finally(() => setRateLoading(false));
  }, [currency]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, trendRes, catRes, budgetRes] = await Promise.all([
        axiosInstance.get("/api/dashboard/summary", {
          params: { month: selectedMonth, year: selectedYear },
        }),
        axiosInstance.get("/api/dashboard/trend"),
        axiosInstance.get("/api/dashboard/top-categories"),
        axiosInstance.get("/api/budget/status", {
          params: { month: selectedMonth, year: selectedYear },
        }).catch(() => ({ data: [] })),
      ]);

      setSummary(summaryRes.data);
      setTrend(trendRes.data.map((t) => ({ ...t, savings: t.balance })));
      setTopCategories(catRes.data);
      setBudgetStatus(budgetRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /* Loading & Error */
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  /* Computed values */
  const pieData = summary?.categoryBreakdown
    ? Object.entries(summary.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const savingsRatio =
    summary && summary.totalSalary > 0
      ? (((summary.totalSalary - summary.totalExpense) / summary.totalSalary) * 100).toFixed(0)
      : 0;

  const categoryCount = Object.keys(summary?.categoryBreakdown || {}).length;
  const isOverBudget = (summary?.totalExpense || 0) > (summary?.totalSalary || 0);

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-slate-950">

      {/* ── Dashboard Guide Modal ── */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGuide(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-1 bg-linear-to-r from-blue-500 via-violet-500 to-emerald-500 shrink-0" />
            <div className="overflow-y-auto flex-1 p-6 lg:p-8">

              {/* Header */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <BookOpen className="size-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Dashboard Guide</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Understand what every indicator, score and signal means</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Health Score */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Financial Health Score</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    A score from <span className="font-semibold text-slate-600 dark:text-slate-300">0 – 100</span> calculated from your savings ratio, spending categories, and income balance.
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-5 rounded-md bg-emerald-500 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">80+</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold">Excellent</span> — Strong savings, controlled spending</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-5 rounded-md bg-amber-500 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">50+</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold">Good</span> — Stable, room for improvement</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-5 rounded-md bg-rose-500 shrink-0 flex items-center justify-center text-[10px] font-bold text-white">&lt;50</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold">Needs Attention</span> — Expenses exceed or nearly match income</span>
                    </div>
                  </div>
                </div>

                {/* Budget Signals */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget Signals</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    Shown on budget progress bars and the Budget Health chart to indicate spending status for each category.
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold text-emerald-600 dark:text-emerald-400">Green</span> — Under 80% of budget used, on track</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold text-amber-500">Amber</span> — 80–99% used, approaching limit</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold text-rose-500">Red</span> — 100%+ used, budget exceeded</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="size-3 text-rose-500 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">Shield icon — category is over its set limit</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="size-3 text-amber-400 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300">Warning icon — spending nearing the limit</span>
                    </div>
                  </div>
                </div>

                {/* Trend & Savings */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trend &amp; Savings</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    The 6-month trend chart and savings rate stat card use these indicators.
                  </p>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2.5">
                      <TrendingUp className="size-3.5 text-emerald-500 shrink-0" />
                 <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold text-emerald-600 dark:text-emerald-400">Up arrow</span> — Positive movement (income ↑ or savings ↑)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <TrendingDown className="size-3.5 text-rose-500 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold text-rose-500">Down arrow</span> — Negative movement (expense ↑ or savings ↓)</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Minus className="size-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold">Dash</span> — No significant change detected</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold">Savings Rate</span> — (Salary − Expenses) ÷ Salary × 100. Aim for 20%+</span>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quick Tips</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                    Simple guidelines to keep your finances healthy.
                  </p>
                  <ul className="flex flex-col gap-2 mt-1">
                    {[
                      "Keep savings rate above 20% of income",
                      "No single category should exceed 30% of total expenses",
                      "Review exceeded budget categories each month",
                      "Use the 6-month trend to spot rising expense patterns early",
                      "A health score above 80 is the ideal target",
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 text-[9px] font-bold text-blue-500">{i + 1}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Got it button */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                  onClick={() => setShowGuide(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Got it
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-6 pb-2 md:px-8 lg:px-12 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            currency={currency}
            onCurrencyChange={setCurrency}
            rateLoading={rateLoading}
          />
        </div>
      </div>

      {/* Main Content */}
      {summary && (
        <div className="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
          <div className="max-w-7xl mx-auto flex flex-col gap-8 lg:gap-10">

            {/* Stat Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              <StatCard
                icon={Wallet}
                label="Total Salary"
                value={formatCurrency(summary.totalSalary || 0, currency, exchangeRate)}
                badge="Income"
                badgeColor="bg-emerald-50 text-emerald-700"
                accentColor="bg-emerald-500"
                iconBg="bg-emerald-50 text-emerald-600"
                trend="up"
                trendLabel="Monthly Income"
              />
              <StatCard
                icon={CreditCard}
                label="Total Expenses"
                value={formatCurrency(summary.totalExpense || 0, currency, exchangeRate)}
                badge="Spending"
                badgeColor="bg-rose-50 text-rose-700"
                accentColor="bg-rose-500"
                iconBg="bg-rose-50 text-rose-600"
                trend="down"
                trendLabel="Monthly Expenses"
              />
              <StatCard
                icon={Landmark}
                label="Remaining Balance"
                value={formatCurrency(summary.remainingBalance || 0, currency, exchangeRate)}
                badge="Available"
                badgeColor="bg-blue-50 text-blue-700"
                accentColor="bg-blue-500"
                iconBg="bg-blue-50 text-blue-600"
                trend="neutral"
                trendLabel="After Expenses"
              />
              <StatCard
                icon={TrendingUp}
                label="Savings Rate"
                value={`${summary.savingsRate?.toFixed(1) || 0}%`}
                badge="Goal"
                badgeColor="bg-amber-50 text-amber-700"
                accentColor="bg-amber-500"
                iconBg="bg-amber-50 text-amber-600"
                trend="up"
                trendLabel={`${savingsRatio}% of income saved`}
              />
            </section>

            {/* Health Score */}
            <section>
              <HealthScore
                score={summary.healthScore}
                savingsRatio={Number(savingsRatio)}
                categoryCount={categoryCount}
                isOverBudget={isOverBudget}
              />
            </section>

            {/* Charts Row */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <TrendChart data={trend} currency={currency} exchangeRate={exchangeRate} />
              <ExpenseDistribution data={pieData} currency={currency} exchangeRate={exchangeRate} />
            </section>

            {/* Monthly Summary Bar */}
            <section>
              <MonthlySummaryBar
                salary={summary.totalSalary}
                expense={summary.totalExpense}
                balance={summary.remainingBalance}
                currency={currency}
                exchangeRate={exchangeRate}
              />
            </section>

            {/* Top Categories */}
            <section>
              <TopCategories categories={topCategories} currency={currency} exchangeRate={exchangeRate} />
            </section>

            {/* Budget Health */}
            {budgetStatus.length > 0 && (
              <section>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="h-1 bg-violet-500" />
                  <div className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-violet-50 dark:bg-violet-500/10 rounded-xl">
                        <PiggyBank className="size-5 text-violet-500" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Budget Health</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {MONTH_NAMES[selectedMonth - 1]} {selectedYear} · {budgetStatus.length} categor{budgetStatus.length !== 1 ? "ies" : "y"} tracked
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        {budgetStatus.some((s) => s.exceeded) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400">
                            <ShieldAlert className="size-3" />
                            {budgetStatus.filter((s) => s.exceeded).length} Exceeded
                          </span>
                        )}
                        {!budgetStatus.some((s) => s.exceeded) && budgetStatus.every((s) => (s.spentAmount / s.limitAmount) < 0.8) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <TrendingDown className="size-3" />
                            All on track
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Budget vs Actual chart */}
                    <BudgetVsActualChart
                      data={budgetStatus}
                      month={selectedMonth}
                      year={selectedYear}
                      currency={currency}
                      exchangeRate={exchangeRate}
                    />

                    {/* Per-category progress cards */}
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-block w-1 h-5 rounded-full bg-violet-500" />
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category Breakdown</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {budgetStatus.map((s) => {
                        const pct = s.limitAmount > 0 ? Math.min(Math.round((s.spentAmount / s.limitAmount) * 100), 100) : 0;
                        const exceeded = s.exceeded;
                        const nearLimit = !exceeded && pct >= 80;
                        const barColor = exceeded ? "bg-rose-500" : nearLimit ? "bg-amber-400" : "bg-emerald-500";
                        const cardBorder = exceeded ? "border-rose-200 dark:border-rose-500/30" : nearLimit ? "border-amber-200 dark:border-amber-500/30" : "border-slate-200 dark:border-slate-700";
                        return (
                          <div key={s.category} className={`rounded-xl border p-4 ${cardBorder} bg-slate-50 dark:bg-slate-700/40`}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s.category}</span>
                              {exceeded && <ShieldAlert className="size-4 text-rose-500" />}
                              {nearLimit && <AlertTriangle className="size-4 text-amber-400" />}
                              {!exceeded && !nearLimit && <TrendingUp className="size-4 text-emerald-500" />}
                            </div>
                            <div className="flex items-end justify-between mb-2">
                              <div>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">Spent</p>
                                <p className={`text-base font-bold font-mono ${
                                  exceeded ? "text-rose-500" : nearLimit ? "text-amber-500" : "text-slate-800 dark:text-white"
                                }`}>
                                  {formatCurrency(s.spentAmount, currency, exchangeRate)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">Limit</p>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">
                                  {formatCurrency(s.limitAmount, currency, exchangeRate)}
                                </p>
                              </div>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className={`text-[10px] font-bold ${
                                exceeded ? "text-rose-500" : nearLimit ? "text-amber-400" : "text-emerald-500"
                              }`}>{pct}% used</span>
                              {exceeded && (
                                <span className="text-[10px] text-rose-500 font-medium">
                                  Over by {formatCurrency(s.exceededBy, currency, exchangeRate)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    </div>{/* end category breakdown */}
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      )}

      {/* Copyright Footer */}
      <footer className="px-4 py-6 md:px-8 lg:px-12 border-t border-slate-200 dark:border-slate-800 mt-2">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-3 text-xs text-slate-400 dark:text-slate-500 text-center">
          <p className="font-semibold text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Anish Technologies. All rights reserved.
          </p>
          <p>Aryabhata Hostel, MSRIT, Bangalore</p>
          <p>Tel: 080-234587/080-42032001</p>

          {/* Connect with us */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connect with us</span>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="size-4" />
              </a>
              <a href="#" aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center justify-center text-slate-500 hover:text-blue-700 transition-colors"
              >
                <Facebook className="size-4" />
              </a>
              <a href="#" aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-pink-100 dark:hover:bg-pink-500/20 flex items-center justify-center text-slate-500 hover:text-pink-600 transition-colors"
              >
                <Instagram className="size-4" />
              </a>
              <a href="#" aria-label="Email"
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
