'use server';

import { parsePromptToJson, ParsePromptToJsonOutput } from '@/ai/flows/parse-prompt-to-json';
import { suggestPromptEnhancements, SuggestPromptEnhancementsOutput } from '@/ai/flows/suggest-prompt-enhancements';

export async function handleParsePrompt(prompt: string): Promise<ParsePromptToJsonOutput> {
  if (!prompt) {
    throw new Error('Prompt cannot be empty.');
  }
  try {
    const result = await parsePromptToJson({ prompt });
    return result;
  } catch (error) {
    console.error('Error parsing prompt:', error);
    throw new Error('Failed to parse prompt. Please try again.');
  }
}

export async function handleEnhancePrompt(prompt: string): Promise<SuggestPromptEnhancementsOutput> {
  if (!prompt) {
    throw new Error('Prompt cannot be empty.');
  }
  try {
    const result = await suggestPromptEnhancements({ prompt });
    return result;
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    throw new Error('Failed to enhance prompt. Please try again.');
  }
}
