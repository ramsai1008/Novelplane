// Home page: Show list of novels + continue reading

import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [novels, setNovels] = useState([]);
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState({});

  const fetchNovels = async () => {
    const querySnapshot = await getDocs(collection(db, "novels"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setNovels(data);
  };

  const fetchBookmarks = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setBookmarks(data.bookmarks || {});
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchBookmarks(currentUser.uid);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetchNovels();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📚 Light Novels</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {novels.map((novel) => {
          const bookmark = bookmarks[novel.id];
          return (
            <div
              key={novel.id}
              className="border p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <Link to={`/novel/${novel.id}`}>
                {novel.cover && (
                  <img
                    src={novel.cover}
                    alt="cover"
                    className="w-full h-48 object-cover mb-2 rounded"
                  />
                )}
                <h2 className="text-lg font-semibold">{novel.title}</h2>
                <p className="text-sm text-gray-600">
                  {novel.description?.slice(0, 100)}...
                </p>
              </Link>
              {bookmark && (
                <Link
                  to={`/read/${novel.id}/${bookmark.chapterId}`}
                  className="mt-2 inline-block text-blue-600 hover:underline text-sm"
                >
                  📖 Continue: {bookmark.title}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
