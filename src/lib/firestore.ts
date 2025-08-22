
import { db } from './firebase';
import { 
    doc, 
    setDoc, 
    getDoc, 
    addDoc, 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    serverTimestamp, 
    Timestamp, 
    where,
    DocumentReference,
    DocumentData,
    updateDoc
} from 'firebase/firestore';
import { auth } from './firebase';

const MEMORIES_COLLECTION = 'memories';

export interface AiGeneratedContent {
    mnemonics: string[];
    story: string;
    visualUrl: string;
}

export interface Memory {
    id: string;
    userId: string;
    title: string;
    content: string;
    summary: string;
    highlights: string[];
    aiGenerated: AiGeneratedContent;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface NewMemory {
    title: string;
    content: string;
    summary: string;
    highlights: string[];
    aiGenerated: AiGeneratedContent;
}

// Save (create or update) a memory
export async function saveMemory(memoryData: NewMemory, memoryId?: string): Promise<DocumentReference | void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    if (memoryId) {
        // Update existing document
        const memoryRef = doc(db, MEMORIES_COLLECTION, memoryId);
        const dataToUpdate = {
            ...memoryData,
            updatedAt: serverTimestamp(),
        };
        return updateDoc(memoryRef, dataToUpdate);
    } else {
        // Create new document
         const dataToSave = {
            userId: user.uid,
            ...memoryData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        return addDoc(collection(db, MEMORIES_COLLECTION), dataToSave);
    }
}

// Get a single memory by ID
export async function getMemory(memoryId: string): Promise<Memory | null> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const memoryRef = doc(db, MEMORIES_COLLECTION, memoryId);
    const memorySnap = await getDoc(memoryRef);

    if (memorySnap.exists()) {
        const data = memorySnap.data() as DocumentData;
        if (data.userId === user.uid) {
            return { id: memorySnap.id, ...data } as Memory;
        }
    }
    return null;
}

// Get all memories for the current user
export async function getMemoryHistory(): Promise<Memory[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
        collection(db, MEMORIES_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Memory));
}
