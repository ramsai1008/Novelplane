// Home page: show list of novels from Firestore

import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function Home() {
  const [novels, setNovels] = useState([]);

  const fetchNovels = async () => {
    const querySnapshot = await getDocs(collection(db, "novels"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setNovels(data);
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📚 Light Novels</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {novels.map((novel) => (
          <Link
            key={novel.id}
            to={`/novel/${novel.id}`}
            className="border p-4 rounded-lg shadow hover:shadow-lg transition"
          >
            {novel.cover && (
              <img src={novel.cover} alt="cover" className="w-full h-48 object-cover mb-2 rounded" />
            )}
            <h2 className="text-lg font-semibold">{novel.title}</h2>
            <p className="text-sm text-gray-600">{novel.description?.slice(0, 100)}...</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
