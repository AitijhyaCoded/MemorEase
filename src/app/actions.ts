
'use server';

import { summarizeContent } from '@/ai/flows/summarize-content';
import { suggestHighlights } from '@/ai/flows/suggest-highlights';
import { generateVisuals } from '@/ai/flows/generate-visuals';
import { generateAudio } from '@/ai/flows/generate-audio';
import { suggestMnemonics } from '@/ai/flows/suggest-mnemonics';
import { createStory } from '@/ai/flows/create-story';
import { z } from 'zod';
import { getAuth } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { getUserData, saveUserData } from '@/lib/firestore';
import { headers } from 'next/headers';
import { getApp } from 'firebase/app';

const contentSchema = z.string().min(50, 'Please provide at least 50 characters of text.');

async function getUserId() {
    const auth = getAuth(app);
    // This is a workaround to get the user on the server.
    // In a real app, you'd use a more robust session management solution.
    // For this prototype, we'll rely on the client to be authenticated.
    // This is NOT secure for production.
    try {
        const idToken = headers().get('Authorization')?.split('Bearer ')[1];
        if (!idToken) return null;
        // This part is tricky without a proper admin SDK setup to verify the token.
        // For the prototype's purpose, we'll assume the client is who they say they are.
        // A better approach involves server-side session cookies or verifying the token.
        // Let's assume we can get the user from the client's auth state for now.
        // A full implementation would require `firebase-admin` to verify tokens.
        // Since we can't use that here, we'll rely on a simpler (less secure) mechanism.
        
        // This is a conceptual placeholder. In a real app, you'd have a secure way
        // to get the current user's ID on the server.
        const user = auth.currentUser;
        return user?.uid;

    } catch (e) {
        console.error("Auth error", e);
        return null;
    }
}


export async function generateSummaryAction(content: string): Promise<{ summary?: string; error?: string }> {
  const validation = contentSchema.safeParse(content);
  if (!validation.success) {
    return { error: validation.error.flatten().formErrors[0] };
  }

  try {
    const result = await summarizeContent({ content });
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate summary. The content might be too short or in an unsupported format.' };
  }
}

export async function suggestHighlightsAction(content: string): Promise<{ highlights?: string[]; error?: string }> {
    const validation = contentSchema.safeParse(content);
    if (!validation.success) {
        return { error: validation.error.flatten().formErrors[0] };
    }

    try {
        const result = await suggestHighlights({ text: content });
        // Filter out very short or empty strings that the AI might occasionally return
        const filteredHighlights = result.highlights.filter(h => h && h.trim().length > 1);
        return { highlights: filteredHighlights };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to suggest highlights. Please try again later.' };
    }
}

export async function generateVisualsAction(content: string): Promise<{ imageUrl?: string; error?: string }> {
    const validation = contentSchema.safeParse(content);
    if (!validation.success) {
        return { error: validation.error.flatten().formErrors[0] };
    }

    try {
        const result = await generateVisuals({ text: content });
        return { imageUrl: result.imageUrl };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to generate visuals. Please try again later.' };
    }
}

export async function generateAudioAction(text: string): Promise<{ audioUrl: string | null; error: string | null }> {
    const validation = contentSchema.safeParse(text);
    if (!validation.success) {
        return { audioUrl: null, error: validation.error.flatten().formErrors[0] };
    }

    try {
        const result = await generateAudio({ text });
        return { audioUrl: result.audioUrl, error: null };
    } catch (e) {
        console.error(e);
        return { audioUrl: null, error: 'Failed to generate audio. Please try again later.' };
    }
}

export async function suggestMnemonicsAction(content: string): Promise<{ mnemonics?: string[]; error?: string }> {
    const validation = contentSchema.safeParse(content);
    if (!validation.success) {
        return { error: validation.error.flatten().formErrors[0] };
    }

    try {
        const result = await suggestMnemonics({ text: content });
        return { mnemonics: result.mnemonics };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to suggest mnemonics. Please try again later.' };
    }
}

export async function createStoryAction(content: string): Promise<{ story?: string; error?: string }> {
    const validation = contentSchema.safeParse(content);
    if (!validation.success) {
        return { error: validation.error.flatten().formErrors[0] };
    }

    try {
        const result = await createStory({ text: content });
        return { story: result.story };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to create story. Please try again later.' };
    }
}

// Firestore actions
export async function saveUserDataAction(data: any) {
    const auth = getAuth(getApp());
    const user = auth.currentUser;
    if (!user) return { error: 'You must be logged in to save data.' };
    
    try {
        await saveUserData(user.uid, data);
        return { success: true };
    } catch (error) {
        console.error('Failed to save user data:', error);
        return { error: 'Failed to save your data. Please try again.' };
    }
}

export async function getUserDataAction(): Promise<any> {
    const auth = getAuth(getApp());
    const user = auth.currentUser;
    if (!user) return null;

    try {
        return await getUserData(user.uid);
    } catch (error) {
        console.error('Failed to get user data:', error);
        return null;
    }
}
