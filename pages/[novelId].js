// pages/novel/[novelId].js — Novel detail with Layout

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Link from "next/link";
import Layout from "../../components/Layout";

export default function NovelView() {
  const router = useRouter();
  const { novelId } = router.query;

  const [novel, setNovel] = useState(null);

  const fetchNovel = async () => {
    if (!novelId) return;
    const docRef = doc(db, "novels", novelId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setNovel({ id: docSnap.id, ...docSnap.data() });
    }
  };

  useEffect(() => {
    fetchNovel();
  }, [novelId]);

  if (!novel) return <Layout><div className="p-4">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
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
                href={`/read/${novel.id}/${i}`}
                className="text-blue-600 hover:underline"
              >
                {chap.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
