
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
import { Trash, Clock, Lightbulb, Download, ClipboardCopy, Star } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<HistoryItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFavorites = JSON.parse(localStorage.getItem('promptFavorites') || '[]');
      setFavorites(storedFavorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      toast({
        title: 'Error',
        description: 'Could not load favorites from local storage.',
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

  const removeFromFavorites = (id: string) => {
    try {
      const newFavorites = favorites.filter((item) => item.id !== id);
      setFavorites(newFavorites);
      localStorage.setItem('promptFavorites', JSON.stringify(newFavorites));
      toast({
        title: 'Removed from Favorites',
        description: 'The selected item has been removed from your favorites.',
      });
    } catch (error) {
      console.error('Failed to remove favorite item:', error);
      toast({
        title: 'Error',
        description: 'Could not remove the item from favorites.',
        variant: 'destructive',
      });
    }
  };

  const loadFavoriteItem = (item: HistoryItem) => {
    sessionStorage.setItem('loadFromHistory', JSON.stringify(item));
    router.push('/');
    toast({
      title: 'Loaded from Favorites',
      description: 'Prompt has been loaded into the main page.',
    });
  };

  if (!hydrated) {
    return <div className="p-6">Loading favorites...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Favorite Prompts</h1>
        {favorites.length > 0 && (
            <Button variant="outline" onClick={() => {
                localStorage.removeItem('promptFavorites');
                setFavorites([]);
                toast({ title: 'Favorites Cleared', description: 'All your favorite prompts have been cleared.' });
            }}>
                <Trash className="mr-2 h-4 w-4" /> Clear All Favorites
            </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>No Favorites Found</CardTitle>
            <CardDescription>
              You can add prompts to your favorites from the history page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/history')}>View History</Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {favorites.map((item) => (
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
                          <Trash className="mr-2 h-4 w-4" /> Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the prompt from your favorites, but it will still be in your history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeFromFavorites(item.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="outline" onClick={() => loadFavoriteItem(item)}>
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

