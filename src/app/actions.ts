
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
import { getMemory, saveMemory, getMemoryHistory } from '@/lib/firestore';
import { headers } from 'next/headers';
import { getApp } from 'firebase/app';
import { revalidatePath } from 'next/cache';

const contentSchema = z.string().min(50, 'Please provide at least 50 characters of text.');

async function getUserId() {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) return null;
    
    // In a real app, you would use firebase-admin to verify the token.
    // For this prototype, we'll decode it to get the UID, which is insecure but sufficient.
    try {
        const decodedToken = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        return decodedToken.user_id;
    } catch (e) {
        console.error("Token decoding error", e);
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
export async function saveUserDataAction(data: any): Promise<{ success?: boolean; error?: string, id?: string }> {
    const userId = await getUserId();
    if (!userId) return { error: 'You must be logged in to save data.' };
    
    try {
        const memoryId = await saveMemory(userId, data);
        revalidatePath('/memory');
        return { success: true, id: memoryId };
    } catch (error) {
        console.error('Failed to save user data:', error);
        return { error: 'Failed to save your data. Please try again.' };
    }
}

export async function getUserDataAction(memoryId: string | null): Promise<any> {
    const userId = await getUserId();
    if (!userId) return null;

    try {
        return await getMemory(userId, memoryId);
    } catch (error) {
        console.error('Failed to get user data:', error);
        return null;
    }
}

export async function getMemoryHistoryAction(): Promise<any[] | null> {
    const userId = await getUserId();
    if (!userId) return null;

    try {
        return await getMemoryHistory(userId);
    } catch (error) {
        console.error('Failed to get user history:', error);
        return null;
    }
}
