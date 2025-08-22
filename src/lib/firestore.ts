
'use server';

import { app } from './firebase';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const db = getFirestore(app);

export async function saveUserData(userId: string, data: any) {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, { 
    ...data,
    updatedAt: serverTimestamp() 
  }, { merge: true });
}

export async function getUserData(userId: string) {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Convert Timestamps to serializable format
    if (data.updatedAt && data.updatedAt instanceof Timestamp) {
       delete data.updatedAt;
    }
    return data;
  } else {
    return null;
  }
}
