// pages/history.js — User reading history (Next.js layout)

import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Layout from "../components/Layout";

export default function History() {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          setBookmarks(snap.data().bookmarks || {});
        }
      }
    });
    return () => unsub();
  }, []);

  if (!user) return <Layout><div className="p-4">Please log in to view your reading history.</div></Layout>;

  const sortedNovels = Object.entries(bookmarks).sort(
    (a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp)
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">📜 Reading History</h1>
        {sortedNovels.length === 0 ? (
          <p>No reading history yet.</p>
        ) : (
          <ul className="space-y-4">
            {sortedNovels.map(([novelId, entry]) => (
              <li key={novelId} className="border p-4 rounded shadow">
                <h2 className="text-lg font-semibold">{entry.novelTitle}</h2>
                <p className="text-sm text-gray-500 mb-1">
                  Last read: {new Date(entry.timestamp).toLocaleString()}
                </p>
                <Link
                  href={`/read/${novelId}/${entry.chapterId}`}
                  className="text-blue-600 hover:underline"
                >
                  Continue reading: {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
}
