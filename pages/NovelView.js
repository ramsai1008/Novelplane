// NovelView.js: Show novel details and chapter list

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function NovelView() {
  const { novelId } = useParams();
  const [novel, setNovel] = useState(null);

  const fetchNovel = async () => {
    const docRef = doc(db, "novels", novelId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setNovel({ id: docSnap.id, ...docSnap.data() });
    }
  };

  useEffect(() => {
    fetchNovel();
  }, [novelId]);

  if (!novel) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-start gap-4 mb-4">
        {novel.cover && (
          <img src={novel.cover} alt="cover" className="w-32 h-48 object-cover rounded" />
        )}
        <div>
          <h1 className="text-2xl font-bold mb-1">{novel.title}</h1>
          <p className="text-gray-700">{novel.description}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2">Chapters</h2>
      <ul className="list-disc pl-5">
        {(novel.chapters || []).map((chap, i) => (
          <li key={i} className="mb-1">
            <Link
              to={`/read/${novel.id}/${i}`}
              className="text-blue-600 hover:underline"
            >
              {chap.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
