'use server';

/**
 * @fileOverview Flow to suggest mnemonics for a given text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestMnemonicsInputSchema = z.object({
  text: z.string().describe('The text to suggest mnemonics for.'),
});
export type SuggestMnemonicsInput = z.infer<typeof SuggestMnemonicsInputSchema>;

const SuggestMnemonicsOutputSchema = z.object({
  mnemonics: z.array(z.string()).describe('An array of suggested mnemonics.'),
});
export type SuggestMnemonicsOutput = z.infer<typeof SuggestMnemonicsOutputSchema>;

export async function suggestMnemonics(input: SuggestMnemonicsInput): Promise<SuggestMnemonicsOutput> {
  return suggestMnemonicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMnemonicsPrompt',
  input: { schema: SuggestMnemonicsInputSchema },
  output: { schema: SuggestMnemonicsOutputSchema },
  prompt: `Based on the key information in the following text, suggest 2-3 creative and effective mnemonic devices (like acronyms, acrostics, rhymes, or keyword methods) to help with memorization.

Text: {{{text}}}`,
});

const suggestMnemonicsFlow = ai.defineFlow(
  {
    name: 'suggestMnemonicsFlow',
    inputSchema: SuggestMnemonicsInputSchema,
    outputSchema: SuggestMnemonicsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
