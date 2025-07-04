// pages/read/[novelId]/[chapterId].js — Reader page (Next.js layout)

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import Layout from "../../../components/Layout";

export default function Reader() {
  const router = useRouter();
  const { novelId, chapterId } = router.query;

  const [chapter, setChapter] = useState(null);
  const [novelTitle, setNovelTitle] = useState("");
  const [user, setUser] = useState(null);

  const fetchChapter = async () => {
    if (!novelId || !chapterId) return;
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
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) fetchChapter();
  }, [user, novelId, chapterId]);

  if (!chapter) return <Layout><div className="p-4">Loading chapter...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-2">{novelTitle} - {chapter.title}</h1>
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {chapter.content}
        </div>
        <div className="mt-6">
          <Link href={`/novel/${novelId}`} className="text-blue-500 hover:underline">
            ← Back to chapters
          </Link>
        </div>
      </div>
    </Layout>
  );
}
