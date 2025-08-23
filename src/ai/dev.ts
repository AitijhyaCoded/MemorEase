import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-content.ts';
import '@/ai/flows/suggest-highlights.ts';
import '@/ai/flows/generate-visuals.ts';
import '@/ai/flows/generate-audio.ts';
import '@/ai/flows/suggest-mnemonics.ts';
import '@/ai/flows/create-story.ts';
import '@/ai/flows/create-cheatsheet.ts';
import '@/ai/flows/generate-quiz.ts';
import '@/ai/flows/ask-doubt.ts';
