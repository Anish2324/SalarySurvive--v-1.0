import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosConfig";
import { User, Mail, Lock, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";

/* ================================================================
   VALIDATION
   ================================================================ */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

const PASSWORD_RULES = [
  { label: "At least 6 characters",  test: (p) => p.length >= 6 },
  { label: "One uppercase letter",    test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",    test: (p) => /[a-z]/.test(p) },
  { label: "One number",              test: (p) => /\d/.test(p) },
  { label: "One symbol",              test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(formData.email)) {
      toast.error("Please enter a valid email address (must include @)");
      return;
    }
    if (!PASSWORD_REGEX.test(formData.password)) {
      toast.error("Password must have 6+ chars, uppercase, lowercase, number & symbol");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Account created! Please sign in to continue.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-icon.png" alt="SalarySurvive" className="w-36 h-36 object-contain" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">SalarySurvive</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Take control of your finances</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="h-1 bg-emerald-600" />
          <div className="p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create an account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Join Salary Survival to manage your finances</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Full name</label>
                <div className="relative">
                  <User className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="name" type="text" name="name"
                    value={formData.name} onChange={handleChange}
                    placeholder="John Doe" required
                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Email address</label>
                <div className="relative">
                  <Mail className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email" type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" required
                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password" type={showPassword ? "text" : "password"} name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="Min. 6 characters" required
                    className="w-full h-11 pl-10 pr-11 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                
                {/* Live rules checklist — shown only while typing */}
                {formData.password.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 px-1">
                    {PASSWORD_RULES.map((rule) => {
                      const ok = rule.test(formData.password);
                      return (
                        <span key={rule.label} className={`text-[11px] font-medium flex items-center gap-1 ${ok ? "text-emerald-600" : "text-slate-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ok ? "bg-emerald-500" : "bg-slate-300"}`} />
                          {rule.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-600 dark:text-slate-300">Confirm password</label>
                <div className="relative">
                  <Lock className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="confirmPassword" type={showConfirm ? "text" : "password"} name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter your password" required
                    className="w-full h-11 pl-10 pr-11 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {loading
                  ? <><Loader2 className="size-4 animate-spin" /> Creating account...</>
                  : <><UserPlus className="size-4" /> Create Account</>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

