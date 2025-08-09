
'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleParsePrompt, handleSuggestEnhancements } from '@/app/actions';
import type { ParsePromptToJsonOutput } from '@/ai/flows/parse-prompt-to-json';
import type { SuggestPromptEnhancementsOutput } from '@/ai/flows/suggest-prompt-enhancements';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Bot, Code, Sparkles, Lightbulb, ClipboardCopy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export interface HistoryItem {
  id: string;
  prompt: string;
  jsonOutput: string;
  enhancement?: SuggestPromptEnhancementsOutput | null;
  timestamp: string;
}

export default function PromptParserPage() {
  const [prompt, setPrompt] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [displayedJson, setDisplayedJson] = useState('');
  const [enhancement, setEnhancement] = useState<SuggestPromptEnhancementsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const codeBlockRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    // Check for history item to load from session storage
    const itemToLoad = sessionStorage.getItem('loadFromHistory');
    if (itemToLoad) {
      try {
        const parsedItem: HistoryItem = JSON.parse(itemToLoad);
        setPrompt(parsedItem.prompt);
        setJsonOutput(parsedItem.jsonOutput);
        setDisplayedJson(parsedItem.jsonOutput);
        setEnhancement(parsedItem.enhancement || null);
      } catch (e) {
        console.error("Failed to parse history item from session storage", e);
      } finally {
        sessionStorage.removeItem('loadFromHistory');
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoading && jsonOutput) {
      setDisplayedJson('');
      let i = 0;
      const typeNextChar = () => {
        if (i < jsonOutput.length) {
          setDisplayedJson((prev) => prev + (jsonOutput[i] || ''));
          i++;
          requestAnimationFrame(typeNextChar);
        }
      };
      const animationFrameId = requestAnimationFrame(typeNextChar);

      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [jsonOutput, isLoading]);

  useEffect(() => {
    if (codeBlockRef.current) {
      codeBlockRef.current.scrollTop = codeBlockRef.current.scrollHeight;
    }
  }, [displayedJson]);

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: `${type} has been copied to your clipboard.`,
    });
  };
  
  const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    try {
      const history = JSON.parse(localStorage.getItem('promptHistory') || '[]') as HistoryItem[];
      const newHistoryItem: HistoryItem = {
        ...item,
        id: new Date().toISOString(),
        timestamp: new Date().toLocaleString(),
      };
      
      // If an item with the same prompt already exists, update it. Otherwise, add a new one.
      const existingItemIndex = history.findIndex(h => h.prompt === item.prompt && h.jsonOutput === item.jsonOutput);
      if(existingItemIndex > -1){
        history[existingItemIndex] = { ...history[existingItemIndex], ...item, enhancement: item.enhancement || history[existingItemIndex].enhancement };
      } else {
        history.unshift(newHistoryItem);
      }
      
      const newHistory = history.slice(0, 50); // Limit history size
      localStorage.setItem('promptHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  };


  const onGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Prompt cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setJsonOutput('');
    setDisplayedJson('');
    setEnhancement(null);

    try {
      const result: ParsePromptToJsonOutput = await handleParsePrompt(prompt);
      let formattedJson = '';
      try {
        formattedJson = JSON.stringify(JSON.parse(result.jsonOutput), null, 2);
        setJsonOutput(formattedJson);
      } catch {
        formattedJson = result.jsonOutput;
        setJsonOutput(formattedJson);
      }

      if (result.biasDetected) {
        toast({
          title: 'Potential Bias Detected',
          description: result.biasReport || 'The AI detected potential bias in your prompt.',
        });
      }
      
      saveToHistory({ prompt, jsonOutput: formattedJson });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: 'Generation Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onEnhance = async () => {
    setIsEnhancing(true);
    setEnhancement(null);
    try {
        const result = await handleSuggestEnhancements(prompt, jsonOutput);
        setEnhancement(result);
        saveToHistory({ prompt, jsonOutput, enhancement: result });
    } catch (e) {
         const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
         toast({
            title: 'Enhancement Error',
            description: errorMessage,
            variant: 'destructive',
         });
    } finally {
        setIsEnhancing(false);
    }
  };


  const renderOutput = () => {
    if (isLoading) {
      return (
        <Card className="h-full shadow-sm">
          <CardContent className="p-4 h-full">
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button variant="outline" size="sm" className="mt-4" onClick={onGenerate}>
            Retry
          </Button>
        </Alert>
      );
    }
    
    if (!displayedJson) {
      return (
        <Card className="flex h-full min-h-[40rem] items-center justify-center bg-muted/20 border-dashed">
            <div className="text-center text-muted-foreground">
                <Code className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No JSON yet</h3>
                <p className="text-sm">Run your first prompt to see results.</p>
            </div>
        </Card>
      );
    }

    return (
      <Card className="relative h-full shadow-sm">
        <CardContent className="p-0 h-full">
            <pre ref={codeBlockRef} className="bg-muted/50 rounded-lg p-4 font-code text-sm overflow-auto h-full min-h-64 max-h-[70vh]">
            <code>{displayedJson}</code>
            </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid h-full flex-1 gap-8 p-4 md:grid-cols-2 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Prompt Input</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(prompt, 'Prompt')}
            disabled={!prompt}
            aria-label="Copy prompt"
          >
            <ClipboardCopy className="h-4 w-4" />
          </Button>
        </div>
        <Card className="flex-1 shadow-sm relative">
          <CardContent className="p-0 h-full">
            <Textarea
              placeholder="e.g., Create a user profile with a name, email, and a list of friends."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-full min-h-[40rem] resize-none border-0 p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </CardContent>
        </Card>
        <div className="flex gap-2">
            <Button onClick={onGenerate} disabled={isLoading || !prompt.trim()} size="lg" className="flex-1">
            {isLoading ? (
                <>
                <Bot className="mr-2 h-4 w-4 animate-spin" />
                Generating...
                </>
            ) : (
                'Generate JSON'
            )}
            </Button>
            {jsonOutput && !isLoading && (
                 <Button onClick={onEnhance} disabled={isEnhancing} size="lg" variant="outline">
                    {isEnhancing ? (
                        <>
                            <Lightbulb className="mr-2 h-4 w-4 animate-spin" />
                            Thinking...
                        </>
                    ) : (
                        <>
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Suggest Enhancements
                        </>
                    )}
                </Button>
            )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">JSON Output</h2>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(jsonOutput, 'JSON Output')}
                disabled={!jsonOutput}
                aria-label="Copy JSON output"
            >
                <ClipboardCopy className="h-4 w-4" />
            </Button>
        </div>
        <div className="flex-1 rounded-2xl">
          {renderOutput()}
        </div>
        
        {isEnhancing && (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5" />
                        <span>Enhanced Prompt</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                     <Separator />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        )}

        {enhancement && (
            <Card className="shadow-sm">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5" />
                        <span>Enhanced Prompt</span>
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(enhancement.enhancedPrompt, 'Enhanced Prompt')}
                        aria-label="Copy enhanced prompt"
                    >
                        <ClipboardCopy className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-sm bg-muted/50 p-4 rounded-md font-code">{enhancement.enhancedPrompt}</p>
                    <Separator className="my-4" />
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Reasoning</h4>
                        <p className="text-sm text-muted-foreground">{enhancement.reasoning}</p>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
