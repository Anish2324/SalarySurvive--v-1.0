import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../store/useAuthStore";
import axiosInstance from "../api/axiosConfig";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from "lucide-react";

/* ================================================================
   VALIDATION
   ================================================================ */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      toast.error("Password must be 6+ chars with uppercase, lowercase, number & symbol");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post("/api/auth/login", { email, password });
      // Backend sets refreshToken as HTTP-only cookie automatically
      // We only get accessToken in the JSON body
      login(response.data.accessToken);
      toast.success("Login successful! Welcome back.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
      console.error("Login error:", err);
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
          <div className="h-1 bg-blue-600" />
          <div className="p-8">
            <div className="mb-7">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password" type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="******" required
                    className="w-full h-11 pl-10 pr-11 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {loading
                  ? <><Loader2 className="size-4 animate-spin" /> Signing in...</>
                  : <><LogIn className="size-4" /> Sign In</>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

