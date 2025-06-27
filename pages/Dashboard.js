// pages/dashboard.js — Admin dashboard refactored for Next.js

import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [novels, setNovels] = useState([]);

  const fetchNovels = async () => {
    const snap = await getDocs(collection(db, "novels"));
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setNovels(data);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (curr) => {
      if (curr) {
        setUser(curr);
        fetchNovels();
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "novels"), {
      title,
      description,
      cover: "",
      chapters: []
    });
    setTitle("");
    setDescription("");
    fetchNovels();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "novels", id));
    fetchNovels();
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">📂 Admin Dashboard</h1>
        {!user ? (
          <p>Please log in to manage novels.</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <input
                className="w-full border p-2 rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Novel title"
                required
              />
              <textarea
                className="w-full border p-2 rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                required
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                ➕ Add Novel
              </button>
            </form>

            <h2 className="text-xl font-semibold mb-2">Your Novels</h2>
            <ul className="space-y-3">
              {novels.map((novel) => (
                <li key={novel.id} className="border p-4 rounded flex justify-between">
                  <div>
                    <h3 className="font-semibold">{novel.title}</h3>
                    <p className="text-sm text-gray-600">{novel.description}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(novel.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Layout>
  );
}
