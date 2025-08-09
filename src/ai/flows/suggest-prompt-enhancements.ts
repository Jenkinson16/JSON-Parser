'use server';
/**
 * @fileOverview Suggests enhancements to a user's prompt using an AI-driven multi-agent system.
 *
 * - suggestPromptEnhancements - A function that takes a prompt and returns suggested enhancements.
 * - SuggestPromptEnhancementsInput - The input type for the suggestPromptEnhancements function.
 * - SuggestPromptEnhancementsOutput - The return type for the suggestPromptEnhancements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPromptEnhancementsInputSchema = z.object({
  prompt: z.string().describe('The prompt to be enhanced.'),
  jsonSchema: z.string().describe('The JSON schema that was parsed from the prompt.'),
});
export type SuggestPromptEnhancementsInput = z.infer<typeof SuggestPromptEnhancementsInputSchema>;

const SuggestPromptEnhancementsOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The enhanced prompt suggested by the AI.'),
  reasoning: z.string().describe('The reasoning behind the suggested enhancements.'),
});
export type SuggestPromptEnhancementsOutput = z.infer<typeof SuggestPromptEnhancementsOutputSchema>;

export async function suggestPromptEnhancements(input: SuggestPromptEnhancementsInput): Promise<SuggestPromptEnhancementsOutput> {
  return suggestPromptEnhancementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPromptEnhancementsPrompt',
  input: {schema: SuggestPromptEnhancementsInputSchema},
  output: {schema: SuggestPromptEnhancementsOutputSchema},
  prompt: `You are an AI prompt enhancement expert. Your goal is to improve the given prompt for better compatibility and effectiveness with LLMs.

  Analyze the prompt and its resulting JSON schema to suggest specific improvements, explaining your reasoning. The goal is to make the prompt clearer, more specific, and less ambiguous to produce a better JSON output.

  Original Prompt: {{{prompt}}}

  Parsed JSON Schema:
  \`\`\`json
  {{{jsonSchema}}}
  \`\`\`
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
