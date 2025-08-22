
import { db } from './firebase';
import { doc, setDoc, getDoc, addDoc, collection, getDocs, query, orderBy, serverTimestamp, Timestamp, limit, where } from 'firebase/firestore';
import { auth } from './firebase';

const MEMORIES_COLLECTION = 'memories';

function cleanData(data: any) {
  const cleanedData = { ...data };
  for (const key in cleanedData) {
    if (cleanedData[key] === undefined) {
      delete cleanedData[key];
    }
  }
  return cleanedData;
}

export async function saveMemory(data: any) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be logged in to save data.');
  }

  const memoryId = data.id;
  const memoriesCollectionRef = collection(db, 'users', user.uid, MEMORIES_COLLECTION);
  const dataToSave = cleanData({
    content: data.content,
    processedContent: data.processedContent,
    summary: data.summary,
    highlights: data.highlights,
    bookmarks: data.bookmarks,
    visualUrl: data.visualUrl,
    audioUrl: data.audioUrl,
    mnemonics: data.mnemonics,
    story: data.story,
    updatedAt: serverTimestamp(),
  });

  if (memoryId) {
    const memoryDocRef = doc(db, 'users', user.uid, MEMORIES_COLLECTION, memoryId);
    await setDoc(memoryDocRef, dataToSave, { merge: true });
    return memoryId;
  } else {
    const title = data.content?.substring(0, 50) || data.summary?.substring(0, 50) || 'Untitled Memory';
    const docWithTitle = { ...dataToSave, title: title + '...' };
    const newDocRef = await addDoc(memoriesCollectionRef, docWithTitle);
    return newDocRef.id;
  }
}

export async function getMemory(memoryId: string | null) {
  const user = auth.currentUser;
  if (!user) return null;

  if (memoryId) {
    const memoryDocRef = doc(db, 'users', user.uid, MEMORIES_COLLECTION, memoryId);
    const docSnap = await getDoc(memoryDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { updatedAt, ...rest } = data;
      return { ...rest, id: docSnap.id };
    } else {
      return null;
    }
  } else {
    // Get the most recent memory if no ID is specified
    const memoriesCollectionRef = collection(db, 'users', user.uid, MEMORIES_COLLECTION);
    const q = query(memoriesCollectionRef, orderBy('updatedAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      const { updatedAt, ...rest } = data;
      return { ...rest, id: docSnap.id };
    }
    return null;
  }
}

export async function getMemoryHistory() {
  const user = auth.currentUser;
  if (!user) return null;

  const memoriesCollectionRef = collection(db, 'users', user.uid, MEMORIES_COLLECTION);
  const q = query(memoriesCollectionRef, orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    const updatedAt = data.updatedAt as Timestamp;
    return {
      id: doc.id,
      title: data.title || data.content?.substring(0, 50) + '...' || 'Untitled Memory',
      updatedAt: updatedAt?.toDate().toLocaleDateString() || '',
    };
  });
}
