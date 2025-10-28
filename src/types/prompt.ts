import type { SuggestPromptEnhancementsOutput } from '@/ai/flows/suggest-prompt-enhancements';

export interface HistoryItem {
  id: string;
  title: string;
  prompt: string;
  jsonOutput: string;
  enhancement?: SuggestPromptEnhancementsOutput | null;
  timestamp: string;
}


