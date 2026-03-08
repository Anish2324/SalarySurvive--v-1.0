import { useState, useEffect, useCallback } from "react";
import axios from "../api/axiosConfig";
import { useCurrency, formatCurrency, CurrencySelector } from "../utils/currency";
import { toast } from "react-toastify";
import {
  PiggyBank,
  History,
  CalendarDays,
  ChevronDown,
  Loader2,
  PlusCircle,
  Tag,
  IndianRupee,
  Inbox,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Filter,
  Wallet,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";

/*  CONSTANTS */

const CATEGORIES = [
  "FOOD", "TRANSPORTATION", "UTILITIES", "ENTERTAINMENT",
  "HEALTHCARE", "EDUCATION", "SHOPPING", "RENT", "OTHER",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_COLORS = {
  FOOD:           "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  TRANSPORTATION: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  UTILITIES:      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  ENTERTAINMENT:  "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  HEALTHCARE:     "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  EDUCATION:      "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  SHOPPING:       "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  RENT:           "bg-slate-200 text-slate-700 dark:bg-slate-600/30 dark:text-slate-300",
  OTHER:          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1];

/* UTILITIES */

/** Formats an ISO date string into a readable "DD Mon YYYY" format (e.g. 01 Jan 2026). Returns "—" for empty values */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Returns usage percentage (0–100, capped) for progress bar rendering */
const getUsagePct = (spent, limit) =>
  limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;

/** Maps usage percentage to a Tailwind progress-bar colour class */
const getBarColor = (pct) =>
  pct >= 100 ? "bg-rose-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500";

/* SELECT COMPONENT */

/** Reusable styled select dropdown with a label and a floating chevron icon */
function SelectField({ label, value, onChange, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          required={required}
          className="appearance-none w-full h-10 pl-3 pr-8 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition dark:scheme-dark"
        >
          {children}
        </select>
        <ChevronDown className="size-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

/*  MAIN BUDGET PAGE */

/* ================================================================
   DELETE MODAL
   ================================================================ */

/**
 * Modal dialog that asks the user to confirm deletion of a budget entry.
 * Props:
 *   budget     – the budget object being deleted
 *   onConfirm  – called when the user clicks "Delete"
 *   onCancel   – called when the user dismisses / clicks "Cancel"
 *   loading    – shows a spinner on the confirm button while the API call is in-flight
 */
function DeleteModal({ budget, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="size-7 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Budget?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              This will permanently delete the{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{budget.category}</span> budget for{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {MONTH_NAMES[budget.month - 1]} {budget.year}
              </span>.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EDIT MODAL
   ================================================================ */

/**
 * Modal dialog for editing an existing budget entry.
 * Maintains its own local form state and delegates the save action
 * to the parent via onSave(id, formData).
 * Props:
 *   budget   – the budget object being edited (pre-fills the form)
 *   onSave   – called with (id, updatedForm) on successful submit
 *   onCancel – called when the user closes the modal without saving
 *   loading  – shows a spinner on the save button while the API call is in-flight
 */
function EditModal({ budget, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    category: budget.category,
    limitAmount: budget.limitAmount,
    month: budget.month,
    year: budget.year,
  });

  /** Prevents default form submission and delegates to the parent save handler */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(budget.id, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-violet-500" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 dark:bg-violet-500/10 rounded-xl">
                <Pencil className="size-4 text-violet-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Budget</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Modify the budget details</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition cursor-pointer"
            >
              <X className="size-4 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <SelectField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </SelectField>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Limit Amount<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.limitAmount}
                  onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
                  required
                  className="w-full h-10 pl-8 pr-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Month"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </SelectField>
              <SelectField
                label="Year"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </SelectField>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-10 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Budget() {
  const [form, setForm] = useState({
    category: "",
    limitAmount: "",
    month: new Date().getMonth() + 1,
    year: currentYear,
  });
  const [budgetHistory, setBudgetHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const { currency, setCurrency, exchangeRate, rateLoading } = useCurrency();

  /** Loads all budget history entries from the API and updates state.
   *  Wrapped in useCallback so it can be safely listed as a useEffect dependency. */
  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await axios.get("/api/budget/history");
      setBudgetHistory(res.data);
    } catch {
      toast.error("Failed to load budget history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  /* Fetch budget history on initial mount */
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /** Loads spent amounts for the selected filter period from /api/budget/status */
  const fetchBudgetStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const res = await axios.get("/api/budget/status", {
        params: { month: filterMonth, year: filterYear },
      });
      setBudgetStatus(res.data);
    } catch {
      setBudgetStatus([]);
    } finally {
      setStatusLoading(false);
    }
  }, [filterMonth, filterYear]);

  /* Re-fetch budget status whenever the selected period changes */
  useEffect(() => {
    fetchBudgetStatus();
  }, [fetchBudgetStatus]);

  /** Handles the Set Budget form submission — validates fields and calls POST /api/budget.
   *  If the same category + month already exists, the backend overwrites it. */
  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!form.category || !form.limitAmount) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setSubmitting(true);
      await axios.post("/api/budget", {
        category: form.category,
        limitAmount: parseFloat(form.limitAmount),
        month: parseInt(form.month),
        year: parseInt(form.year),
      });
      toast.success("Budget set successfully!");
      setForm({ category: "", limitAmount: "", month: new Date().getMonth() + 1, year: currentYear });
      fetchHistory();
      fetchBudgetStatus();
    } catch (err) {
      toast.error(err.response?.data || "Failed to set budget. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /** Sends a PUT request to update an existing budget entry, then refreshes the history list */
  const handleEditSave = async (id, updatedForm) => {
    try {
      setActionLoading(true);
      await axios.put(`/api/budget/${id}`, {
        category: updatedForm.category,
        limitAmount: parseFloat(updatedForm.limitAmount),
        month: parseInt(updatedForm.month),
        year: parseInt(updatedForm.year),
      });
      toast.success("Budget updated successfully!");
      setEditingBudget(null);
      fetchHistory();
      fetchBudgetStatus();
    } catch (err) {
      toast.error(err.response?.data || "Failed to update budget.");
    } finally {
      setActionLoading(false);
    }
  };

  /** Sends a DELETE request for the currently pending budget, then refreshes the history list */
  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(true);
      await axios.delete(`/api/budget/${deletingBudget.id}`);
      toast.success("Budget deleted successfully!");
      setDeletingBudget(null);
      fetchHistory();
      fetchBudgetStatus();
    } catch (err) {
      toast.error(err.response?.data || "Failed to delete budget.");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Derived values for the selected filter period ── */
  const filteredHistory = budgetHistory.filter(
    (b) => b.month === Number(filterMonth) && b.year === Number(filterYear)
  );
  const spentMap = Object.fromEntries(budgetStatus.map((s) => [s.category, s]));
  const totalBudgeted = filteredHistory.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalSpent = budgetStatus.reduce((sum, s) => sum + s.spentAmount, 0);
  const overBudgetCount = budgetStatus.filter((s) => s.exceeded).length;
  const nearLimitCount = budgetStatus.filter((s) => !s.exceeded && getUsagePct(s.spentAmount, s.limitAmount) >= 80).length;

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-slate-950">

      {/* Modals */}
      {editingBudget && (
        <EditModal
          budget={editingBudget}
          onSave={handleEditSave}
          onCancel={() => setEditingBudget(null)}
          loading={actionLoading}
        />
      )}
      {deletingBudget && (
        <DeleteModal
          budget={deletingBudget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingBudget(null)}
          loading={actionLoading}
        />
      )}

      {/*  Page Header  */}
      <div className="px-4 pt-6 pb-2 md:px-8 lg:px-12 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-7 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Budget Management
                </h1>
                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Set spending limits and review your budget history
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CurrencySelector currency={currency} onChange={setCurrency} rateLoading={rateLoading} />
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                  <PiggyBank className="size-5 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-700">
                    {budgetHistory.length} Budget{budgetHistory.length !== 1 ? "s" : ""} Set
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  Main Content */}
      <div className="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 lg:gap-8 items-start">

          {/* Set Budget Card  */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="h-1 bg-blue-500" />
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <PlusCircle className="size-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Set / Update Budget</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Same category + month overwrites existing</p>
                </div>
              </div>

              <form onSubmit={handleSetBudget} className="flex flex-col gap-5">
                {/* Category */}
                <SelectField
                  label="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </SelectField>

                {/* Limit Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Limit Amount<span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 5000"
                      value={form.limitAmount}
                      onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
                      required
                      className="w-full h-10 pl-8 pr-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Month & Year */}
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    label="Month"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                  >
                    {MONTH_NAMES.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </SelectField>
                  <SelectField
                    label="Year"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </SelectField>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 h-11 w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <><Loader2 className="size-4 animate-spin" /> Saving...</>
                  ) : (
                    <><PlusCircle className="size-4" /> Set Budget</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Budget History Card*/}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="h-1 bg-violet-500" />
            <div className="p-6 lg:p-8">
              <div className="mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-violet-50 dark:bg-violet-500/10 rounded-xl">
                      <History className="size-5 text-violet-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">Budget Overview</h2>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {MONTH_NAMES[filterMonth - 1]} {filterYear}
                        {statusLoading ? " · loading…" : filteredHistory.length > 0 ? ` · ${filteredHistory.length} categor${filteredHistory.length !== 1 ? "ies" : "y"}` : ""}
                      </p>
                    </div>
                  </div>
                  {/* Period filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="size-3.5 text-slate-400" />
                    <div className="relative">
                      <select
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(Number(e.target.value))}
                        className="appearance-none h-8 pl-3 pr-7 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition dark:scheme-dark"
                      >
                        {MONTH_NAMES.map((m, i) => (
                          <option key={i} value={i + 1}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="size-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        value={filterYear}
                        onChange={(e) => setFilterYear(Number(e.target.value))}
                        className="appearance-none h-8 pl-3 pr-7 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition dark:scheme-dark"
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <ChevronDown className="size-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Summary stats for the selected period */}
                {filteredHistory.length > 0 && !statusLoading && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Total Budgeted</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white font-mono">{formatCurrency(totalBudgeted, currency, exchangeRate)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Total Spent</p>
                      <p className={`text-sm font-bold font-mono ${
                        totalSpent > totalBudgeted ? "text-rose-500" : "text-slate-800 dark:text-white"
                      }`}>{formatCurrency(totalSpent, currency, exchangeRate)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Alerts</p>
                      <p className="text-sm font-bold">
                        {overBudgetCount > 0 ? (
                          <span className="text-rose-500">{overBudgetCount} exceeded</span>
                        ) : nearLimitCount > 0 ? (
                          <span className="text-amber-500">{nearLimitCount} near limit</span>
                        ) : (
                          <span className="text-emerald-500">All good</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Loading */}
              {historyLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 text-violet-400 animate-spin" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">Loading history</p>
                  </div>
                </div>
              ) : filteredHistory.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Inbox className="size-7 text-slate-300 dark:text-slate-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    No budgets for {MONTH_NAMES[filterMonth - 1]} {filterYear}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Set a budget using the form on the left</p>
                </div>
              ) : (
                /* Table */
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700">
                        <th className="pb-3 px-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          <div className="flex items-center gap-1.5"><Tag className="size-3" />Category</div>
                        </th>
                        <th className="pb-3 px-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          <div className="flex items-center justify-end gap-1.5"><IndianRupee className="size-3" />Limit</div>
                        </th>
                        <th className="pb-3 px-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
                          <div className="flex items-center gap-1.5"><Wallet className="size-3" />Spent / Progress</div>
                        </th>
                        <th className="pb-3 px-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                          Set On
                        </th>
                        <th className="pb-3 px-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {filteredHistory.map((b) => {
                        const statusEntry = spentMap[b.category];
                        const spent = statusEntry?.spentAmount ?? null;
                        const pct = spent !== null ? getUsagePct(spent, b.limitAmount) : null;
                        const barColor = pct !== null ? getBarColor(pct) : null;
                        const exceeded = statusEntry?.exceeded ?? false;
                        const nearLimit = pct !== null && pct >= 80 && !exceeded;
                        return (
                          <tr key={b.id} className={`hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors ${
                            exceeded ? "bg-rose-50/40 dark:bg-rose-500/5" : ""
                          }`}>
                            <td className="py-3.5 px-2">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[b.category] || "bg-slate-100 text-slate-600"}`}>
                                  {b.category}
                                </span>
                                {exceeded && (
                                  <span title="Over budget!">
                                    <ShieldAlert className="size-3.5 text-rose-500" />
                                  </span>
                                )}
                                {nearLimit && (
                                  <span title="Approaching limit">
                                    <AlertTriangle className="size-3.5 text-amber-400" />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-2 text-right font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                              {formatCurrency(b.limitAmount, currency, exchangeRate)}
                            </td>
                            <td className="py-3.5 px-2 hidden md:table-cell">
                              {statusLoading ? (
                                <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                              ) : spent !== null ? (
                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-xs font-semibold font-mono ${
                                      exceeded ? "text-rose-500" : nearLimit ? "text-amber-500" : "text-slate-700 dark:text-slate-200"
                                    }`}>
                                      {formatCurrency(spent, currency, exchangeRate)}
                                    </span>
                                    <span className={`text-[10px] font-bold ${
                                      exceeded ? "text-rose-500" : nearLimit ? "text-amber-400" : "text-emerald-500"
                                    }`}>
                                      {pct}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  {exceeded && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                      Over by {formatCurrency(statusEntry.exceededBy, currency, exchangeRate)}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300 dark:text-slate-600">No expenses</span>
                              )}
                            </td>
                            <td className="py-3.5 px-2 text-center text-slate-400 text-xs hidden sm:table-cell">
                              {formatDate(b.createdAt)}
                            </td>
                            <td className="py-3.5 px-2">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setEditingBudget(b)}
                                  title="Edit"
                                  className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 flex items-center justify-center transition cursor-pointer"
                                >
                                  <Pencil className="size-3.5 text-violet-500" />
                                </button>
                                <button
                                  onClick={() => setDeletingBudget(b)}
                                  title="Delete"
                                  className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 flex items-center justify-center transition cursor-pointer"
                                >
                                  <Trash2 className="size-3.5 text-rose-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
