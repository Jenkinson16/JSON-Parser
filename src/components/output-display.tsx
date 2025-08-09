'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { SuggestPromptEnhancementsOutput } from '@/ai/flows/suggest-prompt-enhancements';
import { FileJson, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface OutputDisplayProps {
  jsonOutput: string;
  setJsonOutput: (json: string) => void;
  biasDetected?: boolean;
  biasReport?: string | null;
  enhancements: SuggestPromptEnhancementsOutput | null;
  isLoadingParse: boolean;
  isLoadingEnhance: boolean;
}

export default function OutputDisplay({
  jsonOutput,
  setJsonOutput,
  biasDetected,
  biasReport,
  enhancements,
  isLoadingParse,
  isLoadingEnhance,
}: OutputDisplayProps) {
  const [isJsonValid, setIsJsonValid] = useState(true);

  useEffect(() => {
    if (jsonOutput.trim() === '') {
      setIsJsonValid(true);
      return;
    }
    try {
      JSON.parse(jsonOutput);
      setIsJsonValid(true);
    } catch (e) {
      setIsJsonValid(false);
    }
  }, [jsonOutput]);

  const renderContent = () => {
    if (isLoadingParse) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-1/4 mt-4" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }
    
    if (!jsonOutput && !enhancements) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
          <FileJson className="h-16 w-16 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold font-headline">Your output will appear here</h3>
          <p className="text-sm">Enter a prompt and click "Parse Prompt" to get started.</p>
        </div>
      );
    }

    return (
      <Tabs defaultValue="json" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="json">
            <FileJson className="mr-2 h-4 w-4" />
            Parsed JSON
          </TabsTrigger>
          <TabsTrigger value="bias" disabled={biasReport === undefined}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Bias Report
          </TabsTrigger>
          <TabsTrigger value="enhancements" disabled={!enhancements && !isLoadingEnhance}>
            <Sparkles className="mr-2 h-4 w-4" />
            Enhancements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json" className="mt-4">
          <div className="relative">
            <Textarea
              value={jsonOutput}
              onChange={(e) => setJsonOutput(e.target.value)}
              placeholder="JSON output will appear here..."
              className="min-h-[400px] font-code text-sm bg-background/50 focus:ring-primary focus:ring-offset-0"
              spellCheck="false"
            />
            <Badge
              variant={isJsonValid ? "secondary" : "destructive"}
              className="absolute bottom-3 right-3"
            >
              {isJsonValid ? "Valid JSON" : "Invalid JSON"}
            </Badge>
          </div>
        </TabsContent>

        <TabsContent value="bias" className="mt-4">
          {biasDetected ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-headline">Potential Bias Detected</AlertTitle>
              <AlertDescription className="font-code text-sm">{biasReport}</AlertDescription>
            </Alert>
          ) : (
             <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle className="font-headline">No Bias Detected</AlertTitle>
              <AlertDescription>
                Our analysis found no significant bias in the prompt.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="enhancements" className="mt-4">
          {isLoadingEnhance ? (
             <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
          ) : enhancements ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Suggested Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="italic text-foreground/80">{enhancements.enhancedPrompt}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{enhancements.reasoning}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mb-4 opacity-50" />
              <p>Click "Suggest Enhancements" to get AI-powered improvements.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Card className="min-h-[500px] shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Output</CardTitle>
        <CardDescription>
          View the parsed JSON, bias report, and enhancement suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
