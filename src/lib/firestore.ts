
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
