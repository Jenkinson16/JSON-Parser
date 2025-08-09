
'use server';

/**
 * @fileOverview Suggests enhancements for a natural language prompt based on its parsed JSON output.
 *
 * - suggestPromptEnhancements - A function that handles the prompt enhancement suggestion process.
 * - SuggestPromptEnhancementsInput - The input type for the suggestPromptEnhancements function.
 * - SuggestPromptEnhancementsOutput - The return type for the suggestPromptEnhancements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPromptEnhancementsInputSchema = z.object({
  prompt: z.string().describe('The original natural language prompt.'),
  jsonOutput: z.string().describe('The JSON output that was parsed from the original prompt.'),
});
export type SuggestPromptEnhancementsInput = z.infer<typeof SuggestPromptEnhancementsInputSchema>;

const SuggestPromptEnhancementsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggestions to enhance the prompt.'),
});
export type SuggestPromptEnhancementsOutput = z.infer<typeof SuggestPromptEnhancementsOutputSchema>;

export async function suggestPromptEnhancements(input: SuggestPromptEnhancementsInput): Promise<SuggestPromptEnhancementsOutput> {
  return suggestPromptEnhancementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPromptEnhancementsPrompt',
  input: {schema: SuggestPromptEnhancementsInputSchema},
  output: {schema: SuggestPromptEnhancementsOutputSchema},
  prompt: `You are a prompt engineering expert. Your goal is to help users improve their prompts to get better-structured JSON outputs.

  Analyze the user's original prompt and the resulting JSON output. Based on this, provide a list of concrete suggestions for how they could improve their prompt.

  Original Prompt: {{{prompt}}}
  Generated JSON: {{{jsonOutput}}}

  Provide a list of actionable suggestions for improvement. For example, if a field is vague, suggest adding more specific details. If the structure could be clearer, suggest how to rephrase it.
  `,
});

const suggestPromptEnhancementsFlow = ai.defineFlow(
  {
    name: 'suggestPromptEnhancementsFlow',
    inputSchema: SuggestPromptEnhancementsInputSchema,
    outputSchema: SuggestPromptEnhancementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
