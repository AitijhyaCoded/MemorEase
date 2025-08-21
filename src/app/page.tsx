
'use client';

import { useState, useTransition, useMemo, useCallback } from 'react';
import { BrainCircuit, FileText, Sparkles, Bookmark, Text, Palette, Plus, Minus, X, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateSummaryAction, suggestHighlightsAction } from './actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type HighlighterProps = {
  text: string;
  highlights: string[];
  bookmarks: number[];
  fontSize: number;
  onBookmarkToggle: (index: number) => void;
};

const Highlighter = ({ text, highlights, bookmarks, fontSize, onBookmarkToggle }: HighlighterProps) => {
  const paragraphs = useMemo(() => text.split('\n').filter(p => p.trim() !== ''), [text]);

  const highlightRegex = useMemo(() => {
    if (highlights.length === 0) return null;
    const escapedHighlights = highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`(${escapedHighlights.join('|')})`, 'gi');
  }, [highlights]);

  const renderParagraph = useCallback((paragraph: string) => {
    if (!highlightRegex) return paragraph;
    const parts = paragraph.split(highlightRegex);
    return parts.map((part, i) =>
      highlightRegex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-primary-foreground rounded-md px-1 py-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, [highlightRegex]);

  return (
    <div style={{ fontSize: `${fontSize}px` }} className="space-y-4 transition-all duration-300 ease-in-out">
      {paragraphs.map((p, i) => (
        <div key={i} className="group relative pr-8">
          <p className="leading-relaxed whitespace-pre-wrap">{renderParagraph(p)}</p>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-0 right-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity',
              bookmarks.includes(i) && 'opacity-100'
            )}
            onClick={() => onBookmarkToggle(i)}
          >
            <Bookmark className={cn('h-4 w-4 text-muted-foreground', bookmarks.includes(i) ? 'fill-primary text-primary' : '')} />
          </Button>
        </div>
      ))}
    </div>
  );
};


export default function Home() {
  const [content, setContent] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [summary, setSummary] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [fontSize, setFontSize] = useState(16);

  const [isSummaryLoading, startSummaryTransition] = useTransition();
  const [isHighlightsLoading, startHighlightsTransition] = useTransition();
  const { toast } = useToast();

  const handleContentSubmit = () => {
    if (content.length < 50) {
      toast({
        variant: 'destructive',
        title: 'Content too short',
        description: 'Please enter at least 50 characters to process.',
      });
      return;
    }
    setProcessedContent(content);
  };

  const handleReset = () => {
    setContent('');
    setProcessedContent('');
    setSummary('');
    setHighlights([]);
    setBookmarks([]);
  };

  const handleSummarize = () => {
    startSummaryTransition(async () => {
      const result = await generateSummaryAction(processedContent);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Summarization Error', description: result.error });
      } else {
        setSummary(result.summary || '');
      }
    });
  };

  const handleHighlight = () => {
    startHighlightsTransition(async () => {
      const result = await suggestHighlightsAction(processedContent);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Highlighting Error', description: result.error });
      } else {
        setHighlights(result.highlights || []);
      }
    });
  };

  const toggleBookmark = (index: number) => {
    setBookmarks(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const bookmarkedParagraphs = useMemo(() => {
    const paragraphs = processedContent.split('\n').filter(p => p.trim() !== '');
    return bookmarks.map(index => paragraphs[index]).filter(Boolean);
  }, [bookmarks, processedContent]);

  if (!processedContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <header className="flex items-center gap-4 mb-8">
          <BrainCircuit className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold tracking-tighter">MemorEase</h1>
        </header>
        <Card className="w-full max-w-3xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
          <CardHeader>
            <CardTitle className="text-2xl">Start Memorizing</CardTitle>
            <CardDescription>Paste your text below to begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste text or a URL's content here... The more text, the better the AI assistance."
              className="min-h-[300px] text-base"
            />
            <Button onClick={handleContentSubmit} className="mt-4 w-full" size="lg">
              Process Content <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">MemorEase</h1>
        </div>
        <Button onClick={handleReset} variant="outline">
          <X className="mr-2 h-4 w-4" /> Clear Content
        </Button>
      </header>
      <div className="grid md:grid-cols-3 flex-1 overflow-hidden">
        <main className="md:col-span-2 flex flex-col p-4 md:p-6 overflow-hidden">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Text className="h-6 w-6 text-primary" />
                <CardTitle>Your Content</CardTitle>
              </div>
              <div className="flex items-center gap-4 w-1/3">
                 <Minus className="h-4 w-4" />
                <Slider
                  value={[fontSize]}
                  onValueChange={value => setFontSize(value[0])}
                  min={12}
                  max={24}
                  step={1}
                />
                 <Plus className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <Highlighter
                  text={processedContent}
                  highlights={highlights}
                  bookmarks={bookmarks}
                  fontSize={fontSize}
                  onBookmarkToggle={toggleBookmark}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </main>
        <aside className="md:col-span-1 p-4 md:p-6 border-l flex flex-col overflow-hidden">
          <Card className="w-full flex-1 flex flex-col">
          <CardHeader>
             <CardTitle className="flex items-center gap-3"><Palette className="h-6 w-6 text-primary" />AI Toolkit</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="summary" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary"><FileText className="mr-2 h-4 w-4" />Summary</TabsTrigger>
                <TabsTrigger value="highlights"><Sparkles className="mr-2 h-4 w-4" />Highlights</TabsTrigger>
                <TabsTrigger value="bookmarks"><Bookmark className="mr-2 h-4 w-4" />Bookmarks</TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="flex-1 flex flex-col overflow-hidden">
                <Button onClick={handleSummarize} disabled={isSummaryLoading || !!summary} className="w-full mt-2">
                  {isSummaryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {summary ? 'Summary Generated' : 'Generate Summary'}
                </Button>
                <ScrollArea className="mt-4 flex-1 pr-2">
                  {isSummaryLoading && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>}
                  {summary && <p className="text-sm leading-relaxed">{summary}</p>}
                  {!summary && !isSummaryLoading && <p className="text-sm text-center text-muted-foreground mt-8">Click "Generate Summary" to create a concise version of your text.</p>}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="highlights" className="flex-1 flex flex-col overflow-hidden">
                <Button onClick={handleHighlight} disabled={isHighlightsLoading || highlights.length > 0} className="w-full mt-2">
                  {isHighlightsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {highlights.length > 0 ? 'Highlights Suggested' : 'Suggest Highlights'}
                </Button>
                <ScrollArea className="mt-4 flex-1 pr-2">
                  {isHighlightsLoading && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>}
                  {highlights.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {highlights.map((h, i) => <Badge key={i} variant="secondary" className="text-sm">{h}</Badge>)}
                    </div>
                  ) : !isHighlightsLoading && <p className="text-sm text-center text-muted-foreground mt-8">Click "Suggest Highlights" to find key phrases.</p>}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="bookmarks" className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="mt-4 flex-1 pr-2">
                  {bookmarkedParagraphs.length > 0 ? (
                    <div className="space-y-4">
                      {bookmarkedParagraphs.map((p, i) => (
                        <div key={i} className="text-sm border-l-2 border-primary pl-3 italic text-muted-foreground">
                          {p.length > 100 ? `${p.substring(0, 100)}...` : p}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground mt-8">Hover over text paragraphs and click the bookmark icon to save them here.</p>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
