
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HistoryItem } from '@/app/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Trash, Clock, Lightbulb, Download, ClipboardCopy } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = JSON.parse(localStorage.getItem('promptHistory') || '[]');
      setHistory(storedHistory);
    } catch (error)
      {
      console.error('Failed to load history:', error);
      toast({
        title: 'Error',
        description: 'Could not load history from local storage.',
        variant: 'destructive',
      });
    }
    setHydrated(true);
  }, [toast]);

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: `${type} has been copied to your clipboard.`,
    });
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem('promptHistory');
      setHistory([]);
      toast({
        title: 'History Cleared',
        description: 'Your prompt history has been successfully cleared.',
      });
    } catch (error) {
      console.error('Failed to clear history:', error);
      toast({
        title: 'Error',
        description: 'Could not clear history.',
        variant: 'destructive',
      });
    }
  };
  
  const deleteHistoryItem = (id: string) => {
    try {
      const newHistory = history.filter((item) => item.id !== id);
      setHistory(newHistory);
      localStorage.setItem('promptHistory', JSON.stringify(newHistory));
      toast({
        title: 'Item Deleted',
        description: 'The selected history item has been deleted.',
      });
    } catch (error) {
      console.error('Failed to delete history item:', error);
      toast({
        title: 'Error',
        description: 'Could not delete the history item.',
        variant: 'destructive',
      });
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    sessionStorage.setItem('loadFromHistory', JSON.stringify(item));
    router.push('/');
    toast({
      title: 'Loaded from History',
      description: 'Prompt has been loaded into the main page.',
    });
  };

  if (!hydrated) {
    return <div className="p-6">Loading history...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Prompt History</h1>
        {history.length > 0 && (
          <Button variant="destructive" onClick={clearHistory}>
            <Trash className="mr-2 h-4 w-4" /> Clear All History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No History Found</CardTitle>
            <CardDescription>
              Your generated prompts will appear here once you start using the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>Start Generating</Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {history.map((item) => (
            <AccordionItem value={item.id} key={item.id} className="border-b-0">
              <Card className="shadow-sm">
                <AccordionTrigger className="p-6 text-left hover:no-underline">
                  <div className="flex-1">
                    <p className="font-semibold text-base truncate">{item.title || item.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center">
                      <Clock className="mr-2 h-3 w-3" />
                      {item.timestamp}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <Separator className="mb-4" />
                  <div className="space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Original Prompt:</p>
                        <p className="bg-muted rounded-md p-4 font-code text-sm">{item.prompt}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Generated JSON</h4>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.jsonOutput, 'JSON Output');
                            }}
                        >
                            <ClipboardCopy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="bg-muted rounded-md p-4 font-code text-sm max-h-60 overflow-auto">
                        <code>{item.jsonOutput}</code>
                      </pre>
                    </div>

                    {item.enhancement && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="font-semibold flex items-center">
                            <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                            Enhancement Suggestion
                          </h4>
                           <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.enhancement?.enhancedPrompt || '', 'Enhanced Prompt')
                            }}
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-muted p-4 rounded-md">
                          <p className="font-code text-sm">{item.enhancement.enhancedPrompt}</p>
                          <Separator className="my-3" />
                          <p className="text-xs text-muted-foreground">{item.enhancement.reasoning}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardFooter className="justify-end p-0 pt-6 gap-2">
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive-outline">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this history item.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteHistoryItem(item.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="outline" onClick={() => loadHistoryItem(item)}>
                      <Download className="mr-2 h-4 w-4" /> Load in Editor
                    </Button>
                  </CardFooter>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
