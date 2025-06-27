// Dashboard with Admin Panel to Add Novels and Chapters

import React, { useEffect, useState } from "react";
import { db, storage } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Dashboard() {
  const [novels, setNovels] = useState([]);
  const [newNovel, setNewNovel] = useState({ title: "", description: "" });
  const [coverFile, setCoverFile] = useState(null);
  const [selectedNovelId, setSelectedNovelId] = useState(null);
  const [newChapter, setNewChapter] = useState({ title: "", content: "" });

  const fetchNovels = async () => {
    const querySnapshot = await getDocs(collection(db, "novels"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setNovels(data);
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  const handleAddNovel = async () => {
    let coverUrl = "";
    if (coverFile) {
      const storageRef = ref(storage, `covers/${coverFile.name}`);
      await uploadBytes(storageRef, coverFile);
      coverUrl = await getDownloadURL(storageRef);
    }
    const docRef = await addDoc(collection(db, "novels"), {
      ...newNovel,
      cover: coverUrl,
      chapters: [],
      createdAt: new Date()
    });
    setNewNovel({ title: "", description: "" });
    setCoverFile(null);
    fetchNovels();
  };

  const handleAddChapter = async () => {
    if (!selectedNovelId) return;
    const novelRef = doc(db, "novels", selectedNovelId);
    await updateDoc(novelRef, {
      chapters: arrayUnion({ ...newChapter, createdAt: new Date() })
    });
    setNewChapter({ title: "", content: "" });
    fetchNovels();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Add New Novel</h2>
        <input
          type="text"
          placeholder="Title"
          value={newNovel.title}
          onChange={(e) => setNewNovel({ ...newNovel, title: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <textarea
          placeholder="Description"
          value={newNovel.description}
          onChange={(e) => setNewNovel({ ...newNovel, description: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <input
          type="file"
          onChange={(e) => setCoverFile(e.target.files[0])}
          className="mb-2"
        />
        <button
          onClick={handleAddNovel}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Novel
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Add Chapter</h2>
        <select
          onChange={(e) => setSelectedNovelId(e.target.value)}
          className="border p-2 w-full mb-2"
        >
          <option>Select Novel</option>
          {novels.map((n) => (
            <option key={n.id} value={n.id}>{n.title}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Chapter Title"
          value={newChapter.title}
          onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <textarea
          placeholder="Chapter Content"
          value={newChapter.content}
          onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <button
          onClick={handleAddChapter}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Chapter
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold">All Novels</h2>
        {novels.map((novel) => (
          <div key={novel.id} className="border p-4 mb-2">
            <h3 className="text-lg font-bold">{novel.title}</h3>
            <p>{novel.description}</p>
            {novel.cover && (
              <img src={novel.cover} alt="cover" className="w-32 mt-2" />
            )}
            <div className="mt-2">
              <h4 className="font-semibold">Chapters:</h4>
              <ul className="list-disc pl-5">
                {(novel.chapters || []).map((chap, i) => (
                  <li key={i}>{chap.title}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
