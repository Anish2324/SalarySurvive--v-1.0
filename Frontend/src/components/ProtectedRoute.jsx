import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const SIDEBAR_W = 260;

function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [checking, setChecking] = useState(true); // true while attempting cookie refresh
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (accessToken) {
      // Already have a token in memory — no need to refresh
      setChecking(false);
      return;
    }

    // No token in memory (e.g. page refresh) — try the HTTP-only cookie
    // Browser auto-sends the cookie, no need to read it in JS
    axios
      .post("http://localhost:8080/api/auth/refresh", {}, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.accessToken); // restore token in memory
      })
      .catch(() => {
        // Cookie missing or expired — user must login
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  // Show nothing while we check the cookie
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
      />
      <Sidebar open={sidebarOpen} />
      <main
        style={{
          marginLeft: sidebarOpen ? `${SIDEBAR_W}px` : "0px",
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          padding: "2rem",
          marginTop: "64px",
          minHeight: "calc(100vh - 64px)",
        }}
        className="bg-[#f5f6fa] dark:bg-slate-950"
      >
        {children}
      </main>
    </>
  );
}

export default ProtectedRoute;


// Navbar and Sidebar are placed outside children.
// That is why:
// ✔ They remain static
// ✔ They don’t change when page changes
// ✔ Only {children} changes