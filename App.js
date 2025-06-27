import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reader from "./pages/Reader";
import Dashboard from "./pages/Dashboard";
import NovelView from "./pages/NovelView";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/read/:novelId/:chapterId" element={<Reader />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/novel/:novelId" element={<NovelView />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}