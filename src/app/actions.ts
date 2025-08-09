'use server';

import { parsePromptToJson, ParsePromptToJsonOutput } from '@/ai/flows/parse-prompt-to-json';
import { suggestPromptEnhancements, SuggestPromptEnhancementsInput, SuggestPromptEnhancementsOutput } from '@/ai/flows/suggest-prompt-enhancements';

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

export async function handleEnhancePrompt(input: SuggestPromptEnhancementsInput): Promise<SuggestPromptEnhancementsOutput> {
  if (!input.prompt) {
    throw new Error('Prompt cannot be empty.');
  }
   if (!input.jsonSchema) {
    throw new Error('JSON schema cannot be empty.');
  }
  try {
    const result = await suggestPromptEnhancements(input);
    return result;
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    throw new Error('Failed to enhance prompt. Please try again.');
  }
}
