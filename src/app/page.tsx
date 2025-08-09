
'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleParsePrompt, handleSuggestEnhancements } from '@/app/actions';
import type { ParsePromptToJsonOutput } from '@/ai/flows/parse-prompt-to-json';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Bot, Code, Sparkles, Lightbulb, ClipboardCopy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PromptParserPage() {
  const [prompt, setPrompt] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [displayedJson, setDisplayedJson] = useState('');
  const [enhancementSuggestions, setEnhancementSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const codeBlockRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!isLoading && jsonOutput) {
      setDisplayedJson('');
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedJson((prev) => prev + jsonOutput[i]);
        i++;
        if (i >= jsonOutput.length) {
          clearInterval(interval);
        }
      }, 10);

      return () => clearInterval(interval);
    }
  }, [jsonOutput, isLoading]);

  useEffect(() => {
    if (codeBlockRef.current) {
      codeBlockRef.current.scrollTop = codeBlockRef.current.scrollHeight;
    }
  }, [displayedJson]);
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: `${type} has been copied to your clipboard.`,
    });
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
    setEnhancementSuggestions([]);

    try {
      const result: ParsePromptToJsonOutput = await handleParsePrompt(prompt);
      try {
        const formattedJson = JSON.stringify(JSON.parse(result.jsonOutput), null, 2);
        setJsonOutput(formattedJson);
      } catch {
        setJsonOutput(result.jsonOutput);
      }

      if (result.biasDetected) {
        toast({
          title: 'Potential Bias Detected',
          description: result.biasReport || 'The AI detected potential bias in your prompt.',
        });
      }

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
    setEnhancementSuggestions([]);
    try {
        const result = await handleSuggestEnhancements(prompt, jsonOutput);
        setEnhancementSuggestions(result.suggestions);
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
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
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
      <div className="relative h-full">
        <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={() => copyToClipboard(jsonOutput, 'JSON Output')}
        >
            <ClipboardCopy className="h-4 w-4" />
        </Button>
        <pre ref={codeBlockRef} className="bg-muted/50 rounded-lg p-4 font-code text-sm overflow-auto h-full min-h-64 max-h-[70vh]">
          <code>{displayedJson}</code>
        </pre>
      </div>
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
        </div>
        <Card className="flex-1 shadow-sm relative">
           <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={() => copyToClipboard(prompt, 'Prompt')}
            disabled={!prompt}
          >
            <ClipboardCopy className="h-4 w-4" />
          </Button>
          <CardContent className="p-4 h-full">
            <Textarea
              placeholder="e.g., Create a user profile with a name, email, and a list of friends."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-full min-h-[40rem] resize-none border-0 p-2 focus-visible:ring-0 focus-visible:ring-offset-0"
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
         <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">JSON Output</h2>
        </div>
        <div className="flex-1 rounded-2xl shadow-sm">
          {renderOutput()}
        </div>
        
        {isEnhancing && (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5" />
                        <span>Enhancement Suggestions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        )}

        {enhancementSuggestions.length > 0 && (
            <Card className="shadow-sm">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5" />
                        <span>Enhancement Suggestions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc space-y-2 pl-5 text-sm">
                        {enhancementSuggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
