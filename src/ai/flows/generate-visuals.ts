'use server';

/**
 * @fileOverview Flow to generate a visual association for a given text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVisualsInputSchema = z.object({
  text: z.string().describe('The text to generate a visual for.'),
});
export type GenerateVisualsInput = z.infer<typeof GenerateVisualsInputSchema>;

const GenerateVisualsOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type GenerateVisualsOutput = z.infer<typeof GenerateVisualsOutputSchema>;

export async function generateVisuals(input: GenerateVisualsInput): Promise<GenerateVisualsOutput> {
  return generateVisualsFlow(input);
}

const generateVisualsFlow = ai.defineFlow(
  {
    name: 'generateVisualsFlow',
    inputSchema: GenerateVisualsInputSchema,
    outputSchema: GenerateVisualsOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a simple, memorable, and clear visual association (image or flowchart) for the following text. The image should be symbolic and help with memorization. Text: ${input.text}`,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media) {
      throw new Error('Image generation failed.');
    }
    
    return { imageUrl: media.url };
  }
);
