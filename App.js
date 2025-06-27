// App.js: Add user menu with logout

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

import Home from "./pages/index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reader from "./pages/Reader";
import Dashboard from "./pages/Dashboard";
import NovelView from "./pages/NovelView";
import History from "./pages/History";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <Router>
      <nav className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex gap-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/history" className="hover:underline">History</Link>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-sm">Hello, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:underline">Login</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/read/:novelId/:chapterId" element={<Reader />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/novel/:novelId" element={<NovelView />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
