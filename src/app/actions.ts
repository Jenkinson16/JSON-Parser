
'use server';

import { parsePromptToJson, ParsePromptToJsonOutput } from '@/ai/flows/parse-prompt-to-json';
import { suggestPromptEnhancements, SuggestPromptEnhancementsOutput, SuggestPromptEnhancementsInput } from '@/ai/flows/suggest-prompt-enhancements';
import { generateTitle, GenerateTitleOutput } from '@/ai/flows/generate-title';

// Helper function to extract meaningful error messages
function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    
    // Check for expired/invalid API key (400 Bad Request)
    if (errorObj.status === 400) {
      const errorDetails = errorObj.errorDetails || [];
      const errorInfo = errorDetails.find((detail: any) => detail['@type']?.includes('ErrorInfo'));
      
      if (errorInfo?.reason === 'API_KEY_INVALID' || 
          errorObj.message?.includes('API key expired') ||
          errorObj.message?.includes('API_KEY_INVALID')) {
        return 'Your Google AI API key has expired or is invalid. Please renew your API key in Vercel environment variables and redeploy. Get a new key from https://ai.google.dev/';
      }
      
      // Other 400 errors
      if (errorObj.message) {
        return `Invalid request: ${errorObj.message}`;
      }
    }
    
    // Check for 429 status code (rate limit/quota exceeded)
    if (errorObj.status === 429 || errorObj.statusText === 'Too Many Requests') {
      // Try to extract retry delay from errorDetails
      let retryDelaySeconds = 60; // default
      
      if (errorObj.errorDetails && Array.isArray(errorObj.errorDetails)) {
        // Look for RetryInfo in errorDetails
        const retryInfo = errorObj.errorDetails.find((detail: any) => 
          detail['@type']?.includes('RetryInfo')
        );
        
        if (retryInfo?.retryDelay) {
          const delayStr = retryInfo.retryDelay.replace('s', '');
          retryDelaySeconds = parseInt(delayStr) || 60;
        }
      }
      
      // Also check message for retry delay
      const messageMatch = errorObj.message?.match(/retry in ([\d.]+)s/i);
      if (messageMatch) {
        retryDelaySeconds = Math.ceil(parseFloat(messageMatch[1]));
      }
      
      const delayMinutes = Math.ceil(retryDelaySeconds / 60);
      
      return `API quota exceeded. You've reached the free tier limit for Gemini API. Please wait ${delayMinutes} minute${delayMinutes > 1 ? 's' : ''} (or ${retryDelaySeconds} seconds) before trying again, or upgrade your Google AI plan. Visit https://ai.google.dev/gemini-api/docs/rate-limits for more information.`;
    }
    
    // Check for 401 Unauthorized (invalid API key)
    if (errorObj.status === 401) {
      return 'Authentication failed. Please check that your Google AI API key is valid and properly configured in Vercel environment variables.';
    }
    
    // Check for error message containing quota/rate limit keywords
    const errorMessage = errorObj.message || String(error);
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('Too Many Requests')) {
      // Try to extract retry delay from message
      const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i);
      if (retryMatch) {
        const seconds = Math.ceil(parseFloat(retryMatch[1]));
        const minutes = Math.ceil(seconds / 60);
        return `API quota exceeded. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
      }
      return `API quota exceeded. You've reached the free tier limit. Please wait a few minutes before trying again, or check your Google AI billing plan.`;
    }
    
    if (errorMessage.includes('API key expired') || errorMessage.includes('API_KEY_INVALID')) {
      return 'Your Google AI API key has expired or is invalid. Please renew your API key in Vercel environment variables and redeploy. Get a new key from https://ai.google.dev/';
    }
    
    // Return original error message if it's meaningful
    if (errorMessage && !errorMessage.includes('Failed to parse prompt') && !errorMessage.includes('Failed to suggest enhancements') && !errorMessage.includes('Failed to generate title')) {
      return errorMessage;
    }
  }
  
  return 'An unexpected error occurred. Please try again later.';
}

export async function handleParsePrompt(prompt: string): Promise<ParsePromptToJsonOutput> {
  if (!prompt) {
    throw new Error('Prompt cannot be empty.');
  }
  try {
    const result = await parsePromptToJson({ prompt });
    return result;
  } catch (error) {
    console.error('Error parsing prompt:', error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
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
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
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
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
}
