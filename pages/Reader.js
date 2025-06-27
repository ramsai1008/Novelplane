// Reader.js: Display chapter and save bookmark

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function Reader() {
  const { novelId, chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [novelTitle, setNovelTitle] = useState("");
  const [user, setUser] = useState(null);

  const fetchChapter = async () => {
    const docRef = doc(db, "novels", novelId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const chap = data.chapters?.[parseInt(chapterId)];
      setChapter(chap);
      setNovelTitle(data.title);

      // Save bookmark if user is logged in
      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            bookmarks: {
              [novelId]: {
                chapterId: parseInt(chapterId),
                title: chap.title,
                novelTitle: data.title,
                timestamp: new Date().toISOString()
              }
            }
          },
          { merge: true }
        );
      }
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) fetchChapter();
  }, [user, novelId, chapterId]);

  if (!chapter) return <div className="p-4">Loading chapter...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-2">{novelTitle} - {chapter.title}</h1>
      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
        {chapter.content}
      </div>
      <div className="mt-6">
        <Link to={`/novel/${novelId}`} className="text-blue-500 hover:underline">
          ← Back to chapters
        </Link>
      </div>
    </div>
  );
}
