'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface PromptFormProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleParse: () => void;
  handleEnhance: () => void;
  isLoadingParse: boolean;
  isLoadingEnhance: boolean;
  isParsed: boolean;
}

export default function PromptForm({
  prompt,
  setPrompt,
  handleParse,
  handleEnhance,
  isLoadingParse,
  isLoadingEnhance,
  isParsed,
}: PromptFormProps) {
  return (
    <Card className="h-fit sticky top-20 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Your Prompt</CardTitle>
        <CardDescription>
          Enter your natural language prompt below. We'll parse it into structured JSON and suggest improvements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="e.g., Create a user profile with a name, email, and a list of friends."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[200px] text-base focus:ring-primary focus:ring-offset-0"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleParse} disabled={isLoadingParse || !prompt.trim()} className="w-full">
            {isLoadingParse ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing...
              </>
            ) : (
              "Parse Prompt"
            )}
          </Button>
          {isParsed && (
            <Button onClick={handleEnhance} disabled={isLoadingEnhance} variant="secondary" className="w-full">
              {isLoadingEnhance ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Suggest Enhancements
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
