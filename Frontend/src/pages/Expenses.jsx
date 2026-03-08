import { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import { useCurrency, formatCurrency, CurrencySelector } from "../utils/currency";
import { toast } from "react-toastify";
import {
  Receipt,
  Plus,
  X,
  Pencil,
  Trash2,
  Loader2,
  Inbox,
  IndianRupee,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  TrendingDown,
  Tag,
  LayoutList,
  AlertTriangle,
} from "lucide-react";

/* ================================================================
   CONSTANTS
   ================================================================ */

const CATEGORIES = [
  "FOOD","TRANSPORTATION","UTILITIES","ENTERTAINMENT",
  "HEALTHCARE","EDUCATION","SHOPPING","RENT","OTHER",
];

const CATEGORY_COLORS = {
  FOOD:           "bg-orange-100 text-orange-700",
  TRANSPORTATION: "bg-blue-100 text-blue-700",
  UTILITIES:      "bg-yellow-100 text-yellow-700",
  ENTERTAINMENT:  "bg-purple-100 text-purple-700",
  HEALTHCARE:     "bg-rose-100 text-rose-700",
  EDUCATION:      "bg-cyan-100 text-cyan-700",
  SHOPPING:       "bg-pink-100 text-pink-700",
  RENT:           "bg-slate-200 text-slate-700",
  OTHER:          "bg-emerald-100 text-emerald-700",
};

/* ================================================================
   UTILITIES
   ================================================================ */

function SelectField({ label, value, onChange, required, id, name, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          name={name}
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
 * Modal dialog that asks the user to confirm deletion of an expense.
 * Props:
 *   expense    – the expense object being deleted
 *   onConfirm  – called when the user clicks "Delete"
 *   onCancel   – called when the user dismisses / clicks "Cancel"
 *   loading    – shows a spinner on the confirm button while the API call is in-flight
 */
function DeleteModal({ expense, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="size-7 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Expense?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              This will permanently delete{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{expense.title}</span>.
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
 * Modal dialog for editing an existing expense entry.
 * Maintains its own local form state and delegates the save action
 * to the parent via onSave(id, formData).
 * Props:
 *   expense  – the expense object being edited (pre-fills the form)
 *   onSave   – called with (id, updatedForm) on successful submit
 *   onCancel – called when the user closes the modal without saving
 *   loading  – shows a spinner on the save button while the API call is in-flight
 */
function EditModal({ expense, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    title: expense.title,
    category: expense.category,
    amount: expense.amount.toString(),
    expenseDate: expense.expenseDate,
  });

  /** Prevents default form submission and delegates to the parent save handler */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(expense.id, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-rose-500" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                <Pencil className="size-4 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Expense</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Modify the expense details</p>
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
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Title<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="h-10 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
              />
            </div>

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

            {/* Amount */}
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
                  className="w-full h-10 pl-8 pr-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
                />
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Date<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                type="date"
                value={form.expenseDate}
                onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                required
                className="h-10 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
              />
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
                className="flex-1 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
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

/* ================================================================
   MAIN EXPENSES PAGE
   ================================================================ */

export default function Expenses() {
  const { currency, setCurrency, exchangeRate, rateLoading } = useCurrency();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/expenses");
      setExpenses(response.data);
    } catch (err) {
      toast.error("Failed to fetch expenses. Please try again.");
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Handles the Add Expense form submission — validates fields and calls POST /api/expenses */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.amount || !formData.expenseDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      setLoading(true);
      await axios.post("/api/expenses", {
        title: formData.title,
        category: formData.category,
        amount: parseFloat(formData.amount),
        expenseDate: formData.expenseDate,
      });
      toast.success("Expense added successfully!");
      resetForm();
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save expense. Please try again.");
      console.error("Error saving expense:", err);
    } finally {
      setLoading(false);
    }
  };

  /** Sends a PUT request to update an existing expense entry, then refreshes the list */
  const handleEditSave = async (id, updatedForm) => {
    try {
      setActionLoading(true);
      await axios.put(`/api/expenses/${id}`, {
        title: updatedForm.title,
        category: updatedForm.category,
        amount: parseFloat(updatedForm.amount),
        expenseDate: updatedForm.expenseDate,
      });
      toast.success("Expense updated successfully!");
      setEditingExpense(null);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update expense.");
      console.error("Error updating expense:", err);
    } finally {
      setActionLoading(false);
    }
  };

  /** Sends a DELETE request for the currently pending expense, then refreshes the list */
  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(true);
      await axios.delete(`/api/expenses/${deletingExpense.id}`);
      toast.success("Expense deleted successfully!");
      setDeletingExpense(null);
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to delete expense. Please try again.");
      console.error("Error deleting expense:", err);
    } finally {
      setActionLoading(false);
    }
  };

  /** Resets the add-expense form fields and hides the form panel */
  const resetForm = () => {
    setFormData({ title: "", category: "", amount: "", expenseDate: new Date().toISOString().split("T")[0] });
    setShowForm(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  /* --- Derived data --- */
  const filteredExpenses = expenses.filter((expense) => {
    const categoryMatch = filterCategory === "ALL" || expense.category === filterCategory;
    const startDateMatch = !startDate || expense.expenseDate >= startDate;
    const endDateMatch = !endDate || expense.expenseDate <= endDate;
    return categoryMatch && startDateMatch && endDateMatch;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const topCategory = CATEGORIES.map((cat) => ({
    name: cat,
    total: filteredExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).sort((a, b) => b.total - a.total)[0];

  const avgPerEntry = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  const hasFilters = filterCategory !== "ALL" || startDate || endDate;

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-slate-950">

      {/* Modals */}
      {editingExpense && (
        <EditModal
          expense={editingExpense}
          onSave={handleEditSave}
          onCancel={() => setEditingExpense(null)}
          loading={actionLoading}
        />
      )}
      {deletingExpense && (
        <DeleteModal
          expense={deletingExpense}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingExpense(null)}
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
                  Expense Tracker
                </h1>
                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Track and manage your daily expenses
                </p>
              </div>
              <div className="flex items-center gap-3">
                <CurrencySelector currency={currency} onChange={setCurrency} rateLoading={rateLoading} />
                <button
                  onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
                  className={`flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    showForm
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      : "bg-rose-500 hover:bg-rose-600 text-white"
                  }`}
                >
                  {showForm ? <><X className="size-4" /> Cancel</> : <><Plus className="size-4" /> Add Expense</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* Stat Cards */}
          {expenses.length > 0 && (
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="h-1 bg-rose-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl"><TrendingDown className="size-5 text-rose-500" /></div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(totalExpenses, currency, exchangeRate)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="h-1 bg-amber-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl"><Tag className="size-5 text-amber-500" /></div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Category</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(topCategory?.total ?? 0, currency, exchangeRate)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{topCategory?.name ?? "N/A"}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="h-1 bg-blue-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl"><IndianRupee className="size-5 text-blue-500" /></div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg per Entry</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(avgPerEntry, currency, exchangeRate)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">per transaction average</p>
                </div>
              </div>
            </section>
          )}

          {/* Add / Edit Form */}
          {showForm && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="h-1 bg-rose-500" />
              <div className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                    <Plus className="size-5 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Add New Expense</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Fill in all required fields</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Title */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="title" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Title<span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="text" id="title" name="title"
                      value={formData.title} onChange={handleChange}
                      placeholder="e.g. Grocery shopping" required
                      className="h-10 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Category */}
                  <SelectField label="Category" id="category" name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </SelectField>

                  {/* Amount */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="amount" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Amount<span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number" id="amount" name="amount"
                        value={formData.amount} onChange={handleChange}
                        step="0.01" min="0" placeholder="0.00" required
                        className="w-full h-10 pl-8 pr-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="expenseDate" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Date<span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <input
                      type="date" id="expenseDate" name="expenseDate"
                      value={formData.expenseDate} onChange={handleChange} required
                      className="h-10 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-2 lg:col-span-4 flex gap-3 pt-1">
                    <button type="submit" disabled={loading}
                      className="h-11 px-7 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {loading
                        ? <><Loader2 className="size-4 animate-spin" />Adding...</>
                        : <><Plus className="size-4" />Add Expense</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/*Filters  */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="h-1 bg-slate-400" />
            <div className="p-5 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"><SlidersHorizontal className="size-4 text-slate-500" /></div>
                  <span className="text-sm font-bold text-slate-700">Filter Expenses</span>
                </div>
                {hasFilters && (
                  <button onClick={() => { setFilterCategory("ALL"); setStartDate(""); setEndDate(""); }}
                    className="flex items-center gap-1.5 h-8 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <X className="size-3.5" /> Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField label="Category" id="filterCategory" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </SelectField>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 px-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 font-medium hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Expense History  */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="h-1 bg-rose-500" />
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl"><LayoutList className="size-5 text-rose-500" /></div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Expense History</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {filteredExpenses.length} result{filteredExpenses.length !== 1 ? "s" : ""}{hasFilters ? " (filtered)" : ""}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="size-8 text-rose-400 animate-spin" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">Loading expenses</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Inbox className="size-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No expenses found</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {hasFilters ? "Try adjusting your filters" : "Add your first expense above"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700">
                        <th className="pb-3 px-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                        <th className="pb-3 px-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Title</th>
                        <th className="pb-3 px-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">Category</th>
                        <th className="pb-3 px-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount</th>
                        <th className="pb-3 px-2 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                          <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                            {new Date(expense.expenseDate).toLocaleDateString("en-GB")}
                          </td>
                          <td className="py-3.5 px-2 font-medium text-slate-700 dark:text-slate-200 max-w-45 truncate">
                            {expense.title}
                          </td>
                          <td className="py-3.5 px-2 hidden sm:table-cell">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[expense.category] || "bg-slate-100 text-slate-600"}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right font-bold text-rose-600 font-mono tracking-tight whitespace-nowrap">
                            {formatCurrency(expense.amount, currency, exchangeRate)}
                          </td>
                          <td className="py-3.5 px-2">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setEditingExpense(expense)}
                                className="flex items-center gap-1.5 h-8 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Pencil className="size-3.5" /> Edit
                              </button>
                              <button onClick={() => setDeletingExpense(expense)}
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
