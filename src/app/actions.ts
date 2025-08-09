
'use server';

import { parsePromptToJson, ParsePromptToJsonOutput } from '@/ai/flows/parse-prompt-to-json';
import { suggestPromptEnhancements, SuggestPromptEnhancementsOutput, SuggestPromptEnhancementsInput } from '@/ai/flows/suggest-prompt-enhancements';
import { generateTitle, GenerateTitleOutput } from '@/ai/flows/generate-title';

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

export async function handleSuggestEnhancements(prompt: string, jsonOutput: string): Promise<SuggestPromptEnhancementsOutput> {
    if (!prompt || !jsonOutput) {
        throw new Error('Prompt and JSON output are required to suggest enhancements.');
    }
    try {
        const result = await suggestPromptEnhancements({ prompt, jsonOutput });
        return result;
    } catch (error) {
        console.error('Error suggesting enhancements:', error);
        throw new Error('Failed to suggest enhancements. Please try again.');
    }
}

export async function handleGenerateTitle(prompt: string): Promise<GenerateTitleOutput> {
    if (!prompt) {
        throw new Error('Prompt cannot be empty.');
    }
    try {
        const result = await generateTitle({ prompt });
        return result;
    } catch (error) {
        console.error('Error generating title:', error);
        throw new Error('Failed to generate title. Please try again.');
    }
}
