// pages/dashboard.js — add cover image upload

import React, { useEffect, useState } from "react";
import { db, auth, storage } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import Layout from "../components/Layout";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [novels, setNovels] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [newChapter, setNewChapter] = useState({ title: "", content: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [editChapter, setEditChapter] = useState({ title: "", content: "" });

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
    const docRef = await addDoc(collection(db, "novels"), {
      title,
      description,
      cover: "",
      chapters: []
    });

    let coverUrl = "";
    if (coverFile) {
      const imageRef = ref(storage, `covers/${docRef.id}.jpg`);
      await uploadBytes(imageRef, coverFile);
      coverUrl = await getDownloadURL(imageRef);
      await updateDoc(docRef, { cover: coverUrl });
    }

    setTitle("");
    setDescription("");
    setCoverFile(null);
    fetchNovels();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "novels", id));
    fetchNovels();
  };

  const handleAddChapter = async (novelId) => {
    const novelRef = doc(db, "novels", novelId);
    const novelSnap = await getDoc(novelRef);
    if (novelSnap.exists()) {
      const data = novelSnap.data();
      const chapters = data.chapters || [];
      chapters.push({ ...newChapter });
      await updateDoc(novelRef, { chapters });
      setNewChapter({ title: "", content: "" });
      fetchNovels();
    }
  };

  const handleDeleteChapter = async (novelId, index) => {
    const novelRef = doc(db, "novels", novelId);
    const novelSnap = await getDoc(novelRef);
    if (novelSnap.exists()) {
      const data = novelSnap.data();
      const chapters = data.chapters || [];
      chapters.splice(index, 1);
      await updateDoc(novelRef, { chapters });
      fetchNovels();
    }
  };

  const handleSaveEdit = async (novelId, index) => {
    const novelRef = doc(db, "novels", novelId);
    const novelSnap = await getDoc(novelRef);
    if (novelSnap.exists()) {
      const data = novelSnap.data();
      const chapters = data.chapters || [];
      chapters[index] = { ...editChapter };
      await updateDoc(novelRef, { chapters });
      setEditIndex(null);
      fetchNovels();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                ➕ Add Novel
              </button>
            </form>

            <h2 className="text-xl font-semibold mb-2">Your Novels</h2>
            <ul className="space-y-4">
              {novels.map((novel) => (
                <li key={novel.id} className="border p-4 rounded shadow">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{novel.title}</h3>
                      <p className="text-sm text-gray-600">{novel.description}</p>
                      {novel.cover && <img src={novel.cover} alt="cover" className="mt-2 w-24 h-32 object-cover rounded" />}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleDelete(novel.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setExpandedId(expandedId === novel.id ? null : novel.id)}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      >
                        {expandedId === novel.id ? "Hide" : "Chapters"}
                      </button>
                    </div>
                  </div>

                  {expandedId === novel.id && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">📖 Chapters</h4>
                      <ul className="space-y-3 mb-4">
                        {(novel.chapters || []).map((chap, i) => (
                          <li key={i} className="border p-3 rounded">
                            {editIndex === i ? (
                              <div className="space-y-2">
                                <input
                                  className="w-full border p-2 rounded"
                                  value={editChapter.title}
                                  onChange={(e) => setEditChapter({ ...editChapter, title: e.target.value })}
                                />
                                <textarea
                                  className="w-full border p-2 rounded"
                                  rows={3}
                                  value={editChapter.content}
                                  onChange={(e) => setEditChapter({ ...editChapter, content: e.target.value })}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveEdit(novel.id, i)}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditIndex(null)}
                                    className="text-sm text-gray-600 hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between">
                                <span>{chap.title}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditIndex(i);
                                      setEditChapter(chap);
                                    }}
                                    className="text-blue-600 text-sm hover:underline"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteChapter(novel.id, i)}
                                    className="text-red-600 text-sm hover:underline"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>

                      <div className="space-y-2">
                        <input
                          className="w-full border p-2 rounded"
                          placeholder="Chapter title"
                          value={newChapter.title}
                          onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                        />
                        <textarea
                          className="w-full border p-2 rounded"
                          placeholder="Chapter content"
                          rows={4}
                          value={newChapter.content}
                          onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
                        />
                        <button
                          onClick={() => handleAddChapter(novel.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          ➕ Add Chapter
                        </button>
                      </div>
