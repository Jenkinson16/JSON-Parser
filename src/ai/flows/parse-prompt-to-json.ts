'use server';

/**
 * @fileOverview Parses a natural language prompt into a structured JSON format, with bias detection.
 *
 * - parsePromptToJson - A function that handles the prompt parsing process.
 * - ParsePromptToJsonInput - The input type for the parsePromptToJson function.
 * - ParsePromptToJsonOutput - The return type for the parsePromptToJson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParsePromptToJsonInputSchema = z.object({
  prompt: z.string().describe('The natural language prompt to parse.'),
});
export type ParsePromptToJsonInput = z.infer<typeof ParsePromptToJsonInputSchema>;

const ParsePromptToJsonOutputSchema = z.object({
  jsonOutput: z.string().describe('The structured JSON output of the parsed prompt.'),
  biasDetected: z.boolean().describe('Whether bias was detected in the prompt.'),
  biasReport: z.string().optional().describe('A report on any biases detected.'),
});
export type ParsePromptToJsonOutput = z.infer<typeof ParsePromptToJsonOutputSchema>;

export async function parsePromptToJson(input: ParsePromptToJsonInput): Promise<ParsePromptToJsonOutput> {
  return parsePromptToJsonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parsePromptToJsonPrompt',
  input: {schema: ParsePromptToJsonInputSchema},
  output: {schema: ParsePromptToJsonOutputSchema},
  prompt: `You are an AI expert in parsing natural language prompts into structured JSON format.

  Your goal is to convert the given prompt into a valid JSON structure and to identify any potential biases in the prompt.

  Prompt: {{{prompt}}}

  Output the JSON and a bias detection report. If no bias is detected, biasReport should be null.
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const parsePromptToJsonFlow = ai.defineFlow(
  {
    name: 'parsePromptToJsonFlow',
    inputSchema: ParsePromptToJsonInputSchema,
    outputSchema: ParsePromptToJsonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
