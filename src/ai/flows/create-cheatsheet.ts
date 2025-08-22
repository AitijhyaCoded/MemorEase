'use server';

/**
 * @fileOverview Flow to create a cheat sheet from a given text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateCheatSheetInputSchema = z.object({
  text: z.string().describe('The text to create a cheat sheet from.'),
});
export type CreateCheatSheetInput = z.infer<typeof CreateCheatSheetInputSchema>;

const CreateCheatSheetOutputSchema = z.object({
  cheatSheet: z.string().describe('The generated cheat sheet content in Markdown format.'),
});
export type CreateCheatSheetOutput = z.infer<typeof CreateCheatSheetOutputSchema>;

export async function createCheatSheet(input: CreateCheatSheetInput): Promise<CreateCheatSheetOutput> {
  return createCheatSheetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createCheatSheetPrompt',
  input: { schema: CreateCheatSheetInputSchema },
  output: { schema: CreateCheatSheetOutputSchema },
  prompt: `You are an expert at creating concise and effective cheat sheets for students and professionals. Analyze the following content and generate a cheat sheet.

Your output should be in Markdown format.

- Extract key formulas and list them clearly.
- Pull out important definitions and provide short, clear explanations.
- If there is code, highlight the most important functions and core logic.
- Structure the output in a clean, easy-to-read format.

Content to analyze:
{{{text}}}
`,
});

const createCheatSheetFlow = ai.defineFlow(
  {
    name: 'createCheatSheetFlow',
    inputSchema: CreateCheatSheetInputSchema,
    outputSchema: CreateCheatSheetOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
