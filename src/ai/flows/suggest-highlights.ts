// This file holds the Genkit flow for suggesting highlights in a given text.
// It exports the SuggestHighlightsInput, SuggestHighlightsOutput types and the suggestHighlights function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestHighlightsInputSchema = z.object({
  text: z.string().describe('The text to suggest highlights for.'),
});
export type SuggestHighlightsInput = z.infer<typeof SuggestHighlightsInputSchema>;

const SuggestHighlightsOutputSchema = z.object({
  highlights: z.array(
    z.string().describe('Key sections to highlight in the text.')
  ).describe('Suggested highlights for the text.'),
});
export type SuggestHighlightsOutput = z.infer<typeof SuggestHighlightsOutputSchema>;

export async function suggestHighlights(input: SuggestHighlightsInput): Promise<SuggestHighlightsOutput> {
  return suggestHighlightsFlow(input);
}

const suggestHighlightsPrompt = ai.definePrompt({
  name: 'suggestHighlightsPrompt',
  input: {schema: SuggestHighlightsInputSchema},
  output: {schema: SuggestHighlightsOutputSchema},
  prompt: `Suggest key sections to highlight in the following text, focusing on the most important information for memorization. Return an array of strings, where each string is a section to highlight. Be as concise as possible.

Text: {{{text}}}`,
});

const suggestHighlightsFlow = ai.defineFlow(
  {
    name: 'suggestHighlightsFlow',
    inputSchema: SuggestHighlightsInputSchema,
    outputSchema: SuggestHighlightsOutputSchema,
  },
  async input => {
    const {output} = await suggestHighlightsPrompt(input);
    return output!;
  }
);
