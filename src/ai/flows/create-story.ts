'use server';

/**
 * @fileOverview Flow to create a story to link concepts in a text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateStoryInputSchema = z.object({
  text: z.string().describe('The text to create a story from.'),
});
export type CreateStoryInput = z.infer<typeof CreateStoryInputSchema>;

const CreateStoryOutputSchema = z.object({
  story: z.string().describe('The generated story.'),
});
export type CreateStoryOutput = z.infer<typeof CreateStoryOutputSchema>;

export async function createStory(input: CreateStoryInput): Promise<CreateStoryOutput> {
  return createStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createStoryPrompt',
  input: { schema: CreateStoryInputSchema },
  output: { schema: CreateStoryOutputSchema },
  prompt: `Create a short, memorable story or sequence of bizarre images that links together the key concepts from the following text. The story should be vivid and easy to visualize to aid memory.

Text: {{{text}}}`,
});

const createStoryFlow = ai.defineFlow(
  {
    name: 'createStoryFlow',
    inputSchema: CreateStoryInputSchema,
    outputSchema: CreateStoryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
