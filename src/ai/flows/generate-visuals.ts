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
        prompt: `Create a clean, minimal mind map or diagram that helps memorize the following text. 
        Rules:
        - Do NOT include extra paragraphs or explanations.
        - Only produce a visual diagram as an image.
        - Use simple symbols, small graphics, arrows, or boxes for clarity.
        - Keep it readable and spaced out, like a mind map.
        Text: ${input.text}`,
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
