
'use server';

import { app } from './firebase';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const db = getFirestore(app);

export async function saveUserData(userId: string, data: any) {
  const userDocRef = doc(db, 'users', userId);
  // Remove updatedAt field as it's not used and causes serialization issues.
  const dataToSave = { ...data };
  delete dataToSave.updatedAt;

  await setDoc(userDocRef, { 
    ...dataToSave,
    // We can still track updates on the backend if needed, but won't send this to client.
    lastUpdated: serverTimestamp() 
  }, { merge: true });
}

export async function getUserData(userId: string) {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Explicitly delete any timestamp fields before returning data to the client.
    if (data.updatedAt) {
       delete data.updatedAt;
    }
    if (data.lastUpdated) {
        delete data.lastUpdated;
    }
    return data;
  } else {
    return null;
  }
}
