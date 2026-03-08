import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosConfig";
import { useCurrency, formatCurrency, CurrencySelector } from "../utils/currency";
import {
  Banknote,
  Plus,
  X,
  Pencil,
  Trash2,
  Loader2,
  Inbox,
  IndianRupee,
  ChevronDown,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

/* ================================================================
   CONSTANTS
   ================================================================ */

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const YEARS = [2023, 2024, 2025, 2026, 2027, 2028];

/* ================================================================
   UTILITIES
   ================================================================ */

/** Reusable styled select dropdown with a floating chevron icon */
function SelectField({ label, value, onChange, required, children }) {
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

/* ================================================================
   DELETE MODAL
   ================================================================ */

/**
 * Modal dialog that asks the user to confirm deletion of a salary entry.
 * Props:
 *   salary     – the salary object being deleted
 *   onConfirm  – called when the user clicks "Delete"
 *   onCancel   – called when the user dismisses / clicks "Cancel"
 *   loading    – shows a spinner on the confirm button while the API call is in-flight
 */
function DeleteModal({ salary, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="size-7 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Salary?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              This will permanently delete the salary entry for{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {salary.monthName} {salary.year}
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
 * Modal dialog for editing an existing salary entry.
 * Maintains its own local form state and delegates the save action
 * to the parent via onSave(id, formData).
 * Props:
 *   salary   – the salary object being edited (pre-fills the form)
 *   onSave   – called with (id, updatedForm) on successful submit
 *   onCancel – called when the user closes the modal without saving
 *   loading  – shows a spinner on the save button while the API call is in-flight
 */
function EditModal({ salary, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    amount: salary.amount,
    salaryDate: salary.salaryDate,
    month: salary.month,
    year: salary.year,
  });

  /** Returns the total number of days in the given month/year */
  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

  /** Prevents default form submission and delegates to the parent save handler */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(salary.id, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-emerald-500" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                <Pencil className="size-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Salary</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Modify the salary details</p>
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

            <SelectField
              label="Salary Day"
              value={form.salaryDate}
              onChange={(e) => setForm({ ...form, salaryDate: e.target.value })}
              required
            >
              <option value="">Select day</option>
              {Array.from({ length: getDaysInMonth(form.month, form.year) }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </SelectField>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Amount<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <IndianRupee className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  className="w-full h-10 pl-8 pr-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
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
                className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
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

export default function Salary() {
  const { currency, setCurrency, exchangeRate, rateLoading } = useCurrency();
  const [salaries, setSalaries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    salaryDate: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editingSalary, setEditingSalary] = useState(null);
  const [deletingSalary, setDeletingSalary] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* Fetch salary list on initial mount */
  useEffect(() => {
    fetchSalaries();
  }, []);

  /** Loads all salary entries from the API and updates state */
  const fetchSalaries = async () => {
    try {
      setFetchLoading(true);
      const response = await axiosInstance.get("/api/salary");
      setSalaries(response.data);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      toast.error("Failed to load salary history");
    } finally {
      setFetchLoading(false);
    }
  };

  /** Handles the Add Salary form submission — builds the payload and calls POST /api/salary */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        amount: parseFloat(formData.amount),
        salaryDate: parseInt(formData.salaryDate),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
      };

      await axiosInstance.post("/api/salary", payload);
      toast.success("Salary added successfully!");

      fetchSalaries();
      resetForm();
    } catch (error) {
      console.error("Error saving salary:", error);
      const errorMessage = error.response?.data?.message || "Failed to save salary. You may have already added salary for this month/year.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /** Sends a PUT request to update an existing salary entry, then refreshes the list */
  const handleEditSave = async (id, updatedForm) => {
    try {
      setActionLoading(true);
      await axiosInstance.put(`/api/salary/${id}`, {
        amount: parseFloat(updatedForm.amount),
        salaryDate: parseInt(updatedForm.salaryDate),
        month: parseInt(updatedForm.month),
        year: parseInt(updatedForm.year),
      });
      toast.success("Salary updated successfully!");
      setEditingSalary(null);
      fetchSalaries();
    } catch (error) {
      console.error("Error updating salary:", error);
      toast.error(error.response?.data?.message || "Failed to update salary.");
    } finally {
      setActionLoading(false);
    }
  };

  /** Sends a DELETE request for the currently pending salary, then refreshes the list */
  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.delete(`/api/salary/${deletingSalary.id}`);
      toast.success("Salary deleted successfully!");
      setDeletingSalary(null);
      fetchSalaries();
    } catch (error) {
      console.error("Error deleting salary:", error);
      toast.error("Failed to delete salary");
    } finally {
      setActionLoading(false);
    }
  };

  /** Resets the add-salary form fields and hides the form panel */
  const resetForm = () => {
    setFormData({
      amount: "",
      salaryDate: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
    setShowForm(false);
  };

  /** Returns the number of days in a given month/year (used to populate the day selector) */
  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

  /* Derived stats shown in the summary cards */
  const totalSalary = salaries.reduce((sum, s) => sum + s.amount, 0);
  const avgSalary = salaries.length > 0 ? totalSalary / salaries.length : 0;

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-slate-950">
      {/* Modals */}
      {editingSalary && (
        <EditModal
          salary={editingSalary}
          onSave={handleEditSave}
          onCancel={() => setEditingSalary(null)}
          loading={actionLoading}
        />
      )}
      {deletingSalary && (
        <DeleteModal
          salary={deletingSalary}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingSalary(null)}
          loading={actionLoading}
        />
      )}
      {/* â”€â”€ Page Header â”€â”€ */}
      <div className="px-4 pt-6 pb-2 md:px-8 lg:px-12 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-7 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Salary Management
                </h1>
                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Track your monthly income history
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CurrencySelector currency={currency} onChange={setCurrency} rateLoading={rateLoading} />
                <button
                  onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
                  className={`flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    showForm
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {showForm ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> Add Salary</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* â”€â”€ Stat Cards â”€â”€ */}
          {salaries.length > 0 && (
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="h-1 bg-emerald-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"><TrendingUp className="size-5 text-emerald-500" /></div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Earned</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(totalSalary, currency, exchangeRate)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{salaries.length} entr{salaries.length === 1 ? "y" : "ies"}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="h-1 bg-blue-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl"><Banknote className="size-5 text-blue-500" /></div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Monthly</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(avgSalary, currency, exchangeRate)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">per month average</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="h-1 bg-violet-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-violet-50 dark:bg-violet-500/10 rounded-xl"><CalendarDays className="size-5 text-violet-500" /></div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Latest Month</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(salaries[0]?.amount ?? 0, currency, exchangeRate)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{salaries[0]?.monthName} {salaries[0]?.year}</p>
                </div>
              </div>
            </section>
          )}

          {/* â”€â”€ Add / Edit Form â”€â”€ */}
          {showForm && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="h-1 bg-emerald-500" />
              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                    <Plus className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Monthly Salary</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">One entry per month/year</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <SelectField label="Month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} required>
                    {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </SelectField>

                  <SelectField label="Year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </SelectField>

                  <SelectField label="Salary Day" value={formData.salaryDate} onChange={(e) => setFormData({ ...formData, salaryDate: e.target.value })} required>
                    <option value="">Select day</option>
                    {Array.from({ length: getDaysInMonth(formData.month, formData.year) }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </SelectField>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Amount<span className="text-rose-500 ml-0.5">*</span></label>
                    <div className="relative">
                      <IndianRupee className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="e.g. 50000"
                        required step="0.01" min="0"
                        className="w-full h-10 pl-8 pr-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4 flex gap-3 pt-1">
                    <button type="submit" disabled={loading}
                      className="h-11 px-7 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {loading ? <><Loader2 className="size-4 animate-spin" />Adding...</> : <><Plus className="size-4" />Add Salary</>}
                    </button>
                    <button type="button" onClick={resetForm}
                      className="h-11 px-5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <X className="size-4" /> Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* â”€â”€ Salary History â”€â”€ */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="h-1 bg-emerald-500" />
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"><Banknote className="size-5 text-emerald-500" /></div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Salary History</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">All recorded salary entries</p>
                </div>
              </div>

              {fetchLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="size-8 text-emerald-400 animate-spin" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">Loading salary historyâ€¦</p>
                </div>
              ) : salaries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Inbox className="size-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No salary entries yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click "Add Salary" to create your first entry</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700">
                        <th className="pb-3 px-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Month</th>
                        <th className="pb-3 px-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">Year</th>
                        <th className="pb-3 px-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">Salary Day</th>
                        <th className="pb-3 px-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount</th>
                        <th className="pb-3 px-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {salaries.map((salary) => (
                        <tr key={salary.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                          <td className="py-3.5 px-2 font-medium text-slate-700 dark:text-slate-200">{salary.monthName}</td>
                          <td className="py-3.5 px-2 text-center text-slate-500">{salary.year}</td>
                          <td className="py-3.5 px-2 text-center">
                            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                              Day {salary.salaryDate}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right font-bold text-emerald-600 font-mono tracking-tight">
                            {formatCurrency(salary.amount, currency, exchangeRate)}
                          </td>
                          <td className="py-3.5 px-2">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setEditingSalary(salary)}
                                className="flex items-center gap-1.5 h-8 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Pencil className="size-3.5" /> Edit
                              </button>
                              <button onClick={() => setDeletingSalary(salary)}
                                className="flex items-center gap-1.5 h-8 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-3.5" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

