
'use server';

import { summarizeContent } from '@/ai/flows/summarize-content';
import { suggestHighlights } from '@/ai/flows/suggest-highlights';
import { generateVisuals } from '@/ai/flows/generate-visuals';
import { generateAudio } from '@/ai/flows/generate-audio';
import { suggestMnemonics } from '@/ai/flows/suggest-mnemonics';
import { createStory } from '@/ai/flows/create-story';
import { z } from 'zod';

const contentSchema = z.string().min(50, 'Please provide at least 50 characters of text.');

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

export async function generateAudioAction(text: string): Promise<{ audioUrl?: string; error?: string }> {
    const validation = contentSchema.safeParse(text);
    if (!validation.success) {
        return { error: validation.error.flatten().formErrors[0] };
    }

    try {
        const result = await generateAudio({ text });
        return { audioUrl: result.audioUrl };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to generate audio. Please try again later.' };
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
