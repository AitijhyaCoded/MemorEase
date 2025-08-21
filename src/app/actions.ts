
'use server';

import { summarizeContent } from '@/ai/flows/summarize-content';
import { suggestHighlights } from '@/ai/flows/suggest-highlights';
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
