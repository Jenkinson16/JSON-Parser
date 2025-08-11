
'use client';

/**
 * Main prompt workspace: accepts a prompt, generates structured JSON,
 * offers enhancements, and manages local history.
 */
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleParsePrompt, handleSuggestEnhancements, handleGenerateTitle } from '@/app/actions';
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
  title: string;
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
          setDisplayedJson((prev) => prev + jsonOutput.charAt(i));
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
  
  const saveToHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp' | 'title'> & { title?: string }) => {
    try {
      const history = JSON.parse(localStorage.getItem('promptHistory') || '[]') as HistoryItem[];
      
      let title = item.title;
      if (!title) {
        try {
            const titleResult = await handleGenerateTitle(item.prompt);
            title = titleResult.title;
        } catch (e) {
            console.error("Failed to generate title, using prompt as fallback", e);
            title = item.prompt.split(' ').slice(0, 5).join(' ') + '...';
        }
      }

      const newHistoryItem: HistoryItem = {
        ...item,
        id: new Date().toISOString(),
        title: title,
        timestamp: new Date().toLocaleString(),
      };
      
      const existingItemIndex = history.findIndex(h => h.prompt === newHistoryItem.prompt);
      if(existingItemIndex > -1){
        history[existingItemIndex] = { ...history[existingItemIndex], ...newHistoryItem, enhancement: item.enhancement || history[existingItemIndex].enhancement };
      } else {
        history.unshift(newHistoryItem);
      }
      
      const newHistory = history.slice(0, 50);
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

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-4 md:p-6">
      <div className="flex flex-col gap-6 md:gap-8">
        <Card className="flex-1 flex flex-col glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>Your Prompt</span>
            </CardTitle>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyToClipboard(prompt, 'Prompt')}
                disabled={!prompt}
            >
                <ClipboardCopy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <Textarea
              placeholder="e.g., Create a user profile with a name, email, and a list of friends."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow resize-none p-4 rounded-2xl glass-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onGenerate();
                }
              }}
            />
            <div className="flex items-center justify-center gap-2">
              <Button onClick={onGenerate} disabled={isLoading || !prompt.trim()} size="lg" className="w-full">
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
                 <Button onClick={onEnhance} disabled={isEnhancing} size="lg" variant="secondary">
                    {isEnhancing ? (
                        <>
                          <Lightbulb className="mr-2 h-4 w-4 animate-spin" />
                          Enhancing...
                        </>
                    ) : (
                        <>
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Enhance
                        </>
                    )}
                 </Button>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        <Card className="flex-1 flex flex-col glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              <span>JSON Output</span>
            </CardTitle>
             <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyToClipboard(jsonOutput, 'JSON Output')}
                disabled={!jsonOutput}
            >
                <ClipboardCopy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 relative">
            <div className="relative h-full">
              {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                  <div className="space-y-2 p-4 w-full">
                      <Skeleton className="h-8 w-1/4 bg-white/20" />
                      <Skeleton className="h-64 w-full bg-white/20" />
                  </div>
                </div>
              )}
              {error && !isLoading && (
                <Alert variant="destructive" className="m-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                   <Button variant="outline" size="sm" className="mt-4" onClick={onGenerate}>
                      Retry
                   </Button>
                </Alert>
              )}
              {!jsonOutput && !isLoading && !error && (
                  <div className="flex h-full items-center justify-center rounded-2xl glass-input p-4 min-h-64">
                      <div className="text-center text-muted-foreground">
                          <Code className="mx-auto h-12 w-12 mb-4" />
                          <h3 className="text-lg font-semibold">Your generated JSON will appear here</h3>
                          <p className="text-sm">Run a prompt to see the magic happen.</p>
                      </div>
                  </div>
              )}
              {jsonOutput && !isLoading && (
                <pre ref={codeBlockRef} className="rounded-2xl p-4 font-code text-sm overflow-auto h-full min-h-64 max-h-[70vh] glass-input">
                  <code>{displayedJson}</code>
                </pre>
              )}
            </div>
          </CardContent>
        </Card>
        
        {isEnhancing && (
            <Card className="shadow-sm glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5" />
                        <span>Enhanced Prompt</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full bg-white/20" />
                    <Skeleton className="h-4 w-4/5 bg-white/20" />
                    <Skeleton className="h-4 w-full bg-white/20" />
                    <Separator />
                    <Skeleton className="h-4 w-1/3 bg-white/20" />
                    <Skeleton className="h-4 w-full bg-white/20" />
                    <Skeleton className="h-4 w-full bg-white/20" />
                </CardContent>
            </Card>
        )}

        {enhancement && (
            <Card className="shadow-sm glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5" />
                        <span>Enhanced Prompt</span>
                    </CardTitle>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyToClipboard(enhancement.enhancedPrompt, 'Enhanced Prompt')}
                    >
                        <ClipboardCopy className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-sm glass-input p-4 rounded-md font-code">{enhancement.enhancedPrompt}</p>
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
