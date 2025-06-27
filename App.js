// App.js: Add navbar and routing

import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";

import Home from "./pages/index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reader from "./pages/Reader";
import Dashboard from "./pages/Dashboard";
import NovelView from "./pages/NovelView";
import History from "./pages/History";

export default function App() {
  return (
    <Router>
      <nav className="bg-gray-800 text-white p-4 flex gap-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/history" className="hover:underline">History</Link>
        <Link to="/login" className="ml-auto hover:underline">Login</Link>
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
