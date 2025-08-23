
import { db } from './firebase';
import { 
    doc, 
    getDoc, 
    addDoc, 
    collection, 
    getDocs, 
    query, 
    orderBy, 
    serverTimestamp, 
    Timestamp, 
    where,
    DocumentData,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { auth } from './firebase';

const MEMORIES_COLLECTION = 'memories';


export interface AiGeneratedContent {
    mnemonics: string;
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
    cheatSheetHtml: string;
    cheatSheetGeneratedAt: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    notes?: string;
}

export interface NewMemory {
    title: string;
    content: string;
    summary: string;
    highlights: string[];
    aiGenerated: AiGeneratedContent;
    cheatSheetHtml: string;
    notes?: string;
}

// Save (create or update) a memory
export async function saveMemory(memoryData: NewMemory, memoryId?: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    if (memoryId) {
        // Update existing document
        const memoryRef = doc(db, MEMORIES_COLLECTION, memoryId);
        const dataToUpdate: Partial<Memory> = {
            ...memoryData,
            updatedAt: serverTimestamp() as Timestamp,
        };
        await updateDoc(memoryRef, dataToUpdate as any); // Use any to bypass strict type checks on update
        return memoryId;
    } else {
        // Create new document
         const dataToSave = {
            userId: user.uid,
            ...memoryData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(collection(db, MEMORIES_COLLECTION), dataToSave);
        return docRef.id;
    }
}


// Save a cheat sheet to an existing memory
export async function saveCheatSheet(memoryId: string, cheatSheetHtml: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const memoryRef = doc(db, MEMORIES_COLLECTION, memoryId);
    
    // Verify the user owns this document before updating
    const memorySnap = await getDoc(memoryRef);
    if (!memorySnap.exists() || memorySnap.data().userId !== user.uid) {
        throw new Error("Permission denied or memory not found.");
    }

    return updateDoc(memoryRef, {
        cheatSheetHtml: cheatSheetHtml,
        cheatSheetGeneratedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
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

// Delete a memory
export async function deleteMemory(memoryId: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const memoryRef = doc(db, MEMORIES_COLLECTION, memoryId);
    const memorySnap = await getDoc(memoryRef);

    if (!memorySnap.exists() || memorySnap.data().userId !== user.uid) {
        throw new Error("Permission denied or memory not found.");
    }

    await deleteDoc(memoryRef);
}
