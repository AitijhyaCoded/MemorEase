'use server';

/**
 * @fileOverview Flow to generate a quiz from a given text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuizInputSchema = z.object({
  content: z.string().describe('The content to generate a quiz from. This can be the original text, a summary, or a cheat sheet.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const MCQSchema = z.object({
  question: z.string().describe('The multiple-choice question.'),
  options: z.array(z.string()).describe('An array of 4-5 possible answers.'),
  answer: z.string().describe('The correct answer from the options.'),
});

const FlashcardSchema = z.object({
  front: z.string().describe('The term or question for the front of the flashcard.'),
  back: z.string().describe('A concise but complete definition or explanation for the term on the front.'),
});

const FillInTheBlankSchema = z.object({
  sentence: z.string().describe('A sentence with a word or phrase replaced by "_____" (four underscores).'),
  answer: z.string().describe('The word or phrase that was removed.'),
});

const GenerateQuizOutputSchema = z.object({
  mcqs: z.array(MCQSchema).describe('An array of multiple-choice questions.'),
  flashcards: z.array(FlashcardSchema).describe('An array of flashcards.'),
  fillInTheBlanks: z.array(FillInTheBlankSchema).describe('An array of fill-in-the-blank questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are a helpful study assistant. Your task is to generate a quiz based on the provided content. The quiz should help a user test their knowledge and recall of the key information.

Generate a mix of question types:
1.  **Multiple-Choice Questions (MCQs):** Create 3-5 MCQs. Each should have a clear question, 4 plausible options, and one correct answer.
2.  **Flashcards:** Create 3-5 flashcards. Each should have a "front" (a key term, concept, or question) and a "back" (a concise definition or answer).
3.  **Fill-in-the-Blanks:** Create 2-3 fill-in-the-blank questions. Take a key sentence from the text and replace a crucial word or phrase with "_____". Provide the missing word(s) as the answer.

Focus on the most important facts, definitions, concepts, and relationships in the text.

Content to create a quiz from:
{{{content}}}
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
