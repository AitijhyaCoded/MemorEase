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
  htmlContent: z.string().describe('The generated cheat sheet content in HTML format.'),
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

Your output must be a single, valid HTML fragment. Do not include <html>, <body>, or <head> tags.

Allowed HTML tags are: h1, h2, h3, h4, p, b, strong, i, em, code, pre, ul, ol, li, hr, table, thead, tbody, tr, th, td.
Do not use any other tags. Do not use Markdown (e.g., no asterisks or dashes for lists).

- Extract key formulas and list them clearly. For formulas, use simple inline HTML like <b> or <i>, not LaTeX.
- Pull out important definitions and provide short, clear explanations. Use <ul> or <ol> for lists.
- If there is code, highlight the most important functions and core logic using <pre><code> blocks.
- Structure the output in a clean, easy-to-read format using headings (h2, h3).

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
