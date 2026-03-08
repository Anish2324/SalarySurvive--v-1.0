import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Key,
  Eye,
  EyeOff,
  Sun,
  Moon,
  LogOut,
  Loader2,
  Pencil,
  X,
  CheckCircle,
  Copy,
  BadgeCheck,
  Lock,
  Fingerprint,
  Palette,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import useThemeStore from "../store/useThemeStore";
import axiosInstance from "../api/axiosConfig";

/* ════════════════════════════════════════════════════════════════
   UTILITIES
   ════════════════════════════════════════════════════════════════ */

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return {};
  }
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatJwtDate(seconds) {
  if (!seconds) return "—";
  return new Date(seconds * 1000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════════ */

/** Reusable section card */
function SectionCard({ icon: Icon, iconBg, title, subtitle, children, action }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="size-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/** Read-only info row */
function InfoRow({ label, value, icon: Icon, mono, copyable }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0 last:pb-0 first:pt-0">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
            <Icon className="size-3.5 text-slate-500 dark:text-slate-400" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
          <p
            className={`text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5 ${
              mono ? "font-mono text-[12px]" : ""
            }`}
          >
            {value || "—"}
          </p>
        </div>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          title="Copy"
          className="ml-3 w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition shrink-0 cursor-pointer"
        >
          {copied ? (
            <CheckCircle className="size-3.5 text-emerald-500" />
          ) : (
            <Copy className="size-3.5 text-slate-400" />
          )}
        </button>
      )}
    </div>
  );
}

/** Password input with show/hide toggle */
function PasswordInput({ id, label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-10 pl-3 pr-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */

export default function Profile() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  /* ── derive user info from JWT ─────────────────────────────── */
  const claims = accessToken ? decodeJwt(accessToken) : {};
  const rawName = claims.name || claims.sub || "User";
  const displayName = rawName.includes("@") ? rawName.split("@")[0] : rawName;
  const formattedName = displayName
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const initials = getInitials(formattedName);
  const email = claims.sub || "";
  const role = claims.role || claims.roles?.[0] || "USER";
  const memberSince = formatJwtDate(claims.iat);

  const isDark = theme === "dark";

  /* ── change-password form state ────────────────────────────── */
  const [pwForm, setPwForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = (field) => (e) =>
    setPwForm((f) => ({ ...f, [field]: e.target.value }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (pwForm.next.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setPwLoading(true);
    try {
      await axiosInstance.post("/api/auth/change-password", {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      toast.success("Password changed successfully!");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to change password. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  /* ── profile info edit ──────────────────────────────────── */
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  // draft values while editing
  const [dobDraft, setDobDraft] = useState("");
  const [genderDraft, setGenderDraft] = useState("");

  const handleEditInfo = () => {
    setDobDraft(dob);
    setGenderDraft(gender);
    setEditingInfo(true);
  };

  const handleCancelInfo = () => {
    setEditingInfo(false);
  };

  const handleSaveInfo = async () => {
    setInfoLoading(true);
    try {
      await axiosInstance.put("/api/auth/profile", {
        dateOfBirth: dobDraft || null,
        gender: genderDraft || null,
      });
      setDob(dobDraft);
      setGender(genderDraft);
      setEditingInfo(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setInfoLoading(false);
    }
  };

  /* ── sign-out ─────────────────────────────────────────────── */
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
    } catch {
      // ignore
    } finally {
      logout();
      navigate("/login");
    }
  };


  /* ── password strength ────────────────────────────────────── */
  const pwStrength = (() => {
    const p = pwForm.next;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-rose-500", width: "w-1/4" };
    if (score <= 2) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
    if (score <= 3) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  })();

  /* ════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Page Title ─────────────────────────────────────── */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            Manage your account details and preferences
          </p>
        </div>

        {/* ── Hero Card ──────────────────────────────────────── */}
        <div className="relative bg-linear-to-br from-blue-600 via-blue-500 to-violet-600 rounded-2xl shadow-lg overflow-hidden">
          {/* decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 p-7">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-3xl font-bold shadow-lg backdrop-blur-xs select-none">
                {initials}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="size-3 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white tracking-tight">{formattedName}</h2>
              <p className="text-blue-100 text-sm mt-0.5">{email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
                  <BadgeCheck className="size-3" />
                  {role.replace("ROLE_", "")}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs">
                  <Calendar className="size-3" />
                  Since {memberSince}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-400/30 border border-emerald-300/40 text-emerald-100 text-[11px] font-medium px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                  Active Session
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: "Member Since", value: memberSince, bg: "bg-blue-50 dark:bg-blue-500/10", iconColor: "text-blue-500" },
            { icon: Shield, label: "Account Role", value: role.replace("ROLE_", ""), bg: "bg-violet-50 dark:bg-violet-500/10", iconColor: "text-violet-500" },
            { icon: BadgeCheck, label: "Status", value: "Verified", bg: "bg-emerald-50 dark:bg-emerald-500/10", iconColor: "text-emerald-500" },
          ].map(({ icon: Icon, label, value, bg, iconColor }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 text-center"
            >
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`size-4 ${iconColor}`} />
              </div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Account Information ────────────────────────────── */}
        <SectionCard
          icon={User}
          iconBg="bg-blue-500"
          title="Account Information"
          subtitle="Your personal details from your account"
          action={
            editingInfo ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelInfo}
                  className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-[12px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <X className="size-3.5" /> Cancel
                </button>
                <button
                  onClick={handleSaveInfo}
                  disabled={infoLoading}
                  className="h-8 px-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-[12px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {infoLoading ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={handleEditInfo}
                className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-[12px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Pencil className="size-3.5" /> Edit
              </button>
            )
          }
        >
          <InfoRow icon={User} label="Full Name" value={formattedName} />
          <InfoRow icon={Mail} label="Email Address" value={email} copyable />

          {/* Date of Birth */}
          <div className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <Calendar className="size-3.5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Date of Birth</p>
                {editingInfo ? (
                  <input
                    type="date"
                    value={dobDraft}
                    onChange={(e) => setDobDraft(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="mt-1 h-8 px-2 w-full max-w-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                  />
                ) : (
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {dob ? new Date(dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center justify-between py-3.5 last:pb-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <User className="size-3.5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Gender</p>
                {editingInfo ? (
                  <select
                    value={genderDraft}
                    onChange={(e) => setGenderDraft(e.target.value)}
                    className="mt-1 h-8 px-2 w-full max-w-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-[13px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition cursor-pointer"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {gender || "—"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Change Password ────────────────────────────────── */}
        <SectionCard
          icon={Lock}
          iconBg="bg-amber-500"
          title="Change Password"
          subtitle="Secure your account with a new password"
        >
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            {/* Animated icon */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Key className="size-9 text-amber-400" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 bg-violet-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                SOON
              </div>
            </div>

            <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 mb-1.5">
              Coming Soon
            </h3>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
              Password management is under development. You'll be able to change your password securely from here very soon.
            </p>

            {/* Feature preview pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {["Password Strength Meter", "Secure Encryption", "Instant Update"].map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-medium px-3 py-1 rounded-full"
                >
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  {feat}
                </span>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── Appearance ─────────────────────────────────────── */}
        <SectionCard
          icon={Palette}
          iconBg="bg-violet-500"
          title="Appearance"
          subtitle="Customize how the app looks for you"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {isDark ? (
                  <Moon className="size-4.5 text-violet-400" />
                ) : (
                  <Sun className="size-4.5 text-amber-400" />
                )}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500">
                  {isDark ? "Easy on the eyes in low light" : "Clear and bright interface"}
                </p>
              </div>
            </div>

            {/* Toggle pill */}
            <button
              onClick={toggleTheme}
              role="switch"
              aria-checked={isDark}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
                isDark ? "bg-violet-500" : "bg-slate-200 dark:bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center ${
                  isDark ? "translate-x-6" : "translate-x-0"
                }`}
              >
                {isDark ? (
                  <Moon className="size-2.5 text-violet-500" />
                ) : (
                  <Sun className="size-2.5 text-amber-400" />
                )}
              </span>
            </button>
          </div>

          {/* Theme preview swatches */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={() => !isDark || toggleTheme()}
              className={`rounded-xl border-2 overflow-hidden transition cursor-pointer ${
                !isDark
                  ? "border-blue-500 shadow-sm shadow-blue-200 dark:shadow-blue-500/20"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="bg-white p-3">
                <div className="h-2 bg-slate-200 rounded mb-1.5 w-3/4" />
                <div className="h-1.5 bg-slate-100 rounded mb-1 w-1/2" />
                <div className="h-1.5 bg-blue-100 rounded w-2/3" />
              </div>
              <div className="bg-slate-50 px-3 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-600">Light</span>
                {!isDark && <CheckCircle className="size-3 text-blue-500" />}
              </div>
            </button>

            <button
              onClick={() => isDark || toggleTheme()}
              className={`rounded-xl border-2 overflow-hidden transition cursor-pointer ${
                isDark
                  ? "border-violet-500 shadow-sm shadow-violet-500/20"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="bg-slate-900 p-3">
                <div className="h-2 bg-slate-700 rounded mb-1.5 w-3/4" />
                <div className="h-1.5 bg-slate-800 rounded mb-1 w-1/2" />
                <div className="h-1.5 bg-violet-900 rounded w-2/3" />
              </div>
              <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300">Dark</span>
                {isDark && <CheckCircle className="size-3 text-violet-400" />}
              </div>
            </button>
          </div>
        </SectionCard>

        {/* ── Security Overview ───────────────────────────────── */}
        <SectionCard
          icon={Fingerprint}
          iconBg="bg-emerald-500"
          title="Security Overview"
          subtitle="Your account protection status"
        >
          {[
            { label: "Email Verified", status: true, detail: email },
            { label: "Password Protected", status: true, detail: "Last updated: unknown" },
            { label: "Two-Factor Authentication", status: false, detail: "Coming soon" },
            { label: "Login Alerts", status: false, detail: "Coming soon" },
          ].map(({ label, status, detail }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700/60 last:border-0 last:pb-0 first:pt-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    status ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
                <div>
                  <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{label}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{detail}</p>
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  status
                    ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}
              >
                {status ? "Enabled" : "Disabled"}
              </span>
            </div>
          ))}
        </SectionCard>

        {/* ── Danger Zone ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-500/30 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-rose-100 dark:border-rose-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Danger Zone</h2>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">Irreversible and destructive actions</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Sign Out */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <LogOut className="size-4 text-slate-500" />
                  Sign Out
                </p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5 ml-6">
                  End your current session on this device
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 h-9 px-4 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 text-[13px] font-semibold rounded-xl transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>


          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 pb-4">
          Salary Survival · Personal Finance Manager · v1.0
        </p>
      </div>
    </div>
  );
}
