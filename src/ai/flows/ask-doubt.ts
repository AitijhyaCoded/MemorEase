'use server';

/**
 * @fileOverview Flow to answer a user's doubt based on a given context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AskDoubtInputSchema = z.object({
  context: z.string().describe('The context content the user has a doubt about.'),
  question: z.string().describe("The user's specific question or doubt."),
});
export type AskDoubtInput = z.infer<typeof AskDoubtInputSchema>;

const AskDoubtOutputSchema = z.object({
  answer: z.string().describe('The generated answer to the user\'s doubt.'),
});
export type AskDoubtOutput = z.infer<typeof AskDoubtOutputSchema>;

export async function askDoubt(input: AskDoubtInput): Promise<AskDoubtOutput> {
  return askDoubtFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askDoubtPrompt',
  input: { schema: AskDoubtInputSchema },
  output: { schema: AskDoubtOutputSchema },
  prompt: `You are a helpful study assistant. 
  Answer the user's question using the provided context whenever possible. 
  If the context does not contain the answer, use your own general knowledge to give a clear and accurate response, 
  but make it clear when the answer is not in the context.

  Context:
  ---
  {{{context}}}
  ---

  User's Question: "{{{question}}}"

  Your Answer:`,
});

const askDoubtFlow = ai.defineFlow(
  {
    name: 'askDoubtFlow',
    inputSchema: AskDoubtInputSchema,
    outputSchema: AskDoubtOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
