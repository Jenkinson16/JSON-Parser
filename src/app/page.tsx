'use client';

import { useState } from 'react';
import type { ParsePromptToJsonOutput } from '@/ai/flows/parse-prompt-to-json';
import type { SuggestPromptEnhancementsOutput } from '@/ai/flows/suggest-prompt-enhancements';
import { handleParsePrompt, handleEnhancePrompt } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import PromptForm from '@/components/prompt-form';
import OutputDisplay from '@/components/output-display';
import { Bot } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsePromptToJsonOutput | null>(null);
  const [enhancements, setEnhancements] = useState<SuggestPromptEnhancementsOutput | null>(null);
  const [isLoadingParse, setIsLoadingParse] = useState<boolean>(false);
  const [isLoadingEnhance, setIsLoadingEnhance] = useState<boolean>(false);
  const [jsonOutput, setJsonOutput] = useState<string>('');

  const { toast } = useToast();

  const onParse = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Prompt cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingParse(true);
    setParsedData(null);
    setEnhancements(null);
    setJsonOutput('');
    try {
      const result = await handleParsePrompt(prompt);
      setParsedData(result);
      // Format JSON with indentation for better readability
      try {
        const formattedJson = JSON.stringify(JSON.parse(result.jsonOutput), null, 2);
        setJsonOutput(formattedJson);
      } catch {
        setJsonOutput(result.jsonOutput);
      }
    } catch (error) {
      toast({
        title: "Parsing Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingParse(false);
    }
  };

  const onEnhance = async () => {
    if (!prompt.trim() || !parsedData) {
      toast({
        title: "Error",
        description: "Please parse a prompt first.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingEnhance(true);
    setEnhancements(null);
    try {
      const result = await handleEnhancePrompt({ prompt, jsonSchema: parsedData.jsonOutput });
      setEnhancements(result);
    } catch (error) {
      toast({
        title: "Enhancement Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEnhance(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground font-headline">PromptSmith</h1>
          </div>
          <p className="hidden text-muted-foreground md:block">
            Natural Language to Structured JSON with Ethical AI
          </p>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <PromptForm
            prompt={prompt}
            setPrompt={setPrompt}
            handleParse={onParse}
            handleEnhance={onEnhance}
            isLoadingParse={isLoadingParse}
            isLoadingEnhance={isLoadingEnhance}
            isParsed={!!parsedData}
          />
          <OutputDisplay
            jsonOutput={jsonOutput}
            setJsonOutput={setJsonOutput}
            biasReport={parsedData?.biasReport}
            biasDetected={parsedData?.biasDetected}
            enhancements={enhancements}
            isLoadingParse={isLoadingParse}
            isLoadingEnhance={isLoadingEnhance}
          />
        </div>
      </main>
    </div>
  );
}
