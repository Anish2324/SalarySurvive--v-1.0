import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Salary from "./pages/Salary";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import useThemeStore from "./store/useThemeStore";
import "./App.css";

function App() {
  const theme = useThemeStore((s) => s.theme);

  /* Sync .dark class on <html> whenever theme changes */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="app">
      <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes - ProtectedRoute handles Navbar & Sidebar */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/salary" element={
            <ProtectedRoute>
              <Salary />
            </ProtectedRoute>
          } />
          
          <Route path="/expenses" element={
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          } />
          
          <Route path="/budget" element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Redirect any unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
  );
}

export default App;