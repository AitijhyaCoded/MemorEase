
'use client';

import { useState, useTransition, useMemo, useCallback, useEffect } from 'react';
import { BrainCircuit, FileText, Sparkles, Bookmark, Text, Palette, Plus, Minus, X, Loader2, Image as ImageIcon, Volume2, Lightbulb, Link2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateSummaryAction, suggestHighlightsAction, generateVisualsAction, generateAudioAction, suggestMnemonicsAction, createStoryAction, getUserDataAction, saveUserDataAction } from './actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { UserNav } from '@/components/auth/user-nav';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useSearchParams, useRouter } from 'next/navigation';

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
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const memoryId = searchParams.get('id');

  const [content, setContent] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [summary, setSummary] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [visualUrl, setVisualUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [mnemonics, setMnemonics] = useState<string[]>([]);
  const [story, setStory] = useState('');
  const [currentMemoryId, setCurrentMemoryId] = useState<string | null>(memoryId);

  const [isSummaryLoading, startSummaryTransition] = useTransition();
  const [isHighlightsLoading, startHighlightsTransition] = useTransition();
  const [isVisualsLoading, startVisualsTransition] = useTransition();
  const [isAudioLoading, startAudioTransition] = useTransition();
  const [isMnemonicsLoading, startMnemonicsTransition] = useTransition();
  const [isStoryLoading, startStoryTransition] = useTransition();
  const [isDataLoading, startDataLoadingTransition] = useTransition();

  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      startDataLoadingTransition(async () => {
        const data = await getUserDataAction(currentMemoryId);
        if (data) {
          setContent(data.content || '');
          setProcessedContent(data.processedContent || data.content || '');
          setSummary(data.summary || '');
          setHighlights(data.highlights || []);
          setBookmarks(data.bookmarks || []);
          setVisualUrl(data.visualUrl || '');
          setAudioUrl(data.audioUrl || '');
          setMnemonics(data.mnemonics || []);
          setStory(data.story || '');
        } else if (currentMemoryId) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load the specified memory.' });
          router.replace('/');
        }
      });
    } else if (!currentMemoryId) {
      const savedContent = localStorage.getItem('memorEaseContent');
      if (savedContent) {
        setContent(savedContent);
        setProcessedContent(savedContent);
      }
    }
  }, [user, currentMemoryId, router]);

  const handleSaveContent = async () => {
    if (user) {
      const result = await saveUserDataAction({
        id: currentMemoryId,
        content,
        processedContent,
        summary,
        highlights,
        bookmarks,
        visualUrl,
        audioUrl,
        mnemonics,
        story,
      });
      if (result.error) {
        toast({ variant: 'destructive', title: 'Save Error', description: result.error });
      } else {
        toast({ title: 'Content Saved', description: 'Your progress has been saved to your account.' });
        if (result.id && !currentMemoryId) {
          setCurrentMemoryId(result.id);
          router.replace(`/?id=${result.id}`);
        }
      }
    } else {
       localStorage.setItem('memorEaseContent', processedContent);
       toast({ title: 'Content Saved', description: 'Your text has been saved locally.' });
    }
  };

  const handleReset = () => {
    setContent('');
    setProcessedContent('');
    setSummary('');
    setHighlights([]);
    setBookmarks([]);
    setVisualUrl('');
    setAudioUrl('');
    setMnemonics([]);
    setStory('');
    if (user) {
      setCurrentMemoryId(null);
      router.replace('/');
    } else {
      localStorage.removeItem('memorEaseContent');
    }
    toast({ title: 'Content Cleared', description: 'You can start fresh now.' });
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
  
  const handleGenerateVisuals = () => {
    startVisualsTransition(async () => {
      const result = await generateVisualsAction(processedContent);
      if (result.error) {
        toast({ variant: 'destructive', title: 'Visual Generation Error', description: result.error });
      } else {
        setVisualUrl(result.imageUrl || '');
      }
    });
  };
  
  const handleGenerateAudio = () => {
    startAudioTransition(async () => {
      const result = await generateAudioAction(summary || processedContent);
       if (result.error) {
        toast({ variant: 'destructive', title: 'Audio Generation Error', description: result.error });
      } else {
        setAudioUrl(result.audioUrl || '');
      }
    });
  };

  const handleSuggestMnemonics = () => {
    startMnemonicsTransition(async () => {
      const result = await suggestMnemonicsAction(processedContent);
       if (result.error) {
        toast({ variant: 'destructive', title: 'Mnemonic Suggestion Error', description: result.error });
      } else {
        setMnemonics(result.mnemonics || []);
      }
    });
  };
  
  const handleCreateStory = () => {
    startStoryTransition(async () => {
        const result = await createStoryAction(processedContent);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Story Creation Error', description: result.error });
        } else {
            setStory(result.story || '');
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

  if (isDataLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
      );
  }
  
  if (!processedContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <header className="absolute top-4 right-4">
            <UserNav />
        </header>
        <div className='flex flex-col items-center justify-center'>
            <div className="flex items-center gap-4 mb-8">
              <BrainCircuit className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold tracking-tighter">MemorEase</h1>
            </div>
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
                <Button onClick={() => setProcessedContent(content)} className="mt-4 w-full" size="lg" disabled={content.length < 50}>
                  Process Content
                </Button>
              </CardContent>
            </Card>
        </div>
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
        <div className='flex items-center gap-2'>
            <Button onClick={handleSaveContent} variant="outline">
                <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button onClick={handleReset} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> New Session
            </Button>
            <UserNav />
        </div>
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
        <ScrollArea className="h-full">
          <Card className="w-full flex-1 flex flex-col">
          <CardHeader>
             <CardTitle className="flex items-center gap-3"><Palette className="h-6 w-6 text-primary" />AI Toolkit</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="summary" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary"><FileText className="mr-2 h-4 w-4" />Summary</TabsTrigger>
                <TabsTrigger value="highlights"><Sparkles className="mr-2 h-4 w-4" />Highlights</TabsTrigger>
                <TabsTrigger value="more"><Plus className="mr-2 h-4 w-4" />More</TabsTrigger>
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
              <TabsContent value="more" className="flex-1 flex flex-col overflow-hidden">
                <Tabs defaultValue="visuals" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="visuals"><ImageIcon className="mr-2 h-4 w-4" />Visuals</TabsTrigger>
                    <TabsTrigger value="audio"><Volume2 className="mr-2 h-4 w-4" />Audio</TabsTrigger>
                    <TabsTrigger value="mnemonics"><Lightbulb className="mr-2 h-4 w-4" />Mnemonics</TabsTrigger>
                    <TabsTrigger value="story"><Link2 className="mr-2 h-4 w-4" />Story</TabsTrigger>
                  </TabsList>

                  {/* Visuals */}
                  <TabsContent value="visuals" className="flex-1 flex flex-col overflow-hidden">
                    <Button onClick={handleGenerateVisuals} disabled={isVisualsLoading || !!visualUrl} className="w-full mt-2">
                      {isVisualsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {visualUrl ? 'Visual Generated' : 'Generate Visual'}
                    </Button>
                    <ScrollArea className="mt-4 flex-1 pr-2">
                      {isVisualsLoading && <Skeleton className="h-48 w-full" />}
                      {visualUrl && <Image src={visualUrl} alt="Visual association" width={512} height={512} className="rounded-lg" />}
                      {!visualUrl && !isVisualsLoading && <p className="text-sm text-center text-muted-foreground mt-8">Generate an image to help you remember.</p>}
                    </ScrollArea>
                  </TabsContent>

                  {/* Audio */}
                  <TabsContent value="audio" className="flex-1 flex flex-col overflow-hidden">
                    <Button onClick={handleGenerateAudio} disabled={isAudioLoading || !!audioUrl} className="w-full mt-2">
                      {isAudioLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {audioUrl ? 'Audio Generated' : 'Generate Audio'}
                    </Button>
                    <div className="mt-4">
                      {isAudioLoading && <Skeleton className="h-12 w-full" />}
                      {audioUrl && <audio controls src={audioUrl} className="w-full" />}
                      {!audioUrl && !isAudioLoading && <p className="text-sm text-center text-muted-foreground mt-8">Generate audio of the summary (or text if no summary).</p>}
                    </div>
                  </TabsContent>

                  {/* Mnemonics */}
                  <TabsContent value="mnemonics" className="flex-1 flex flex-col overflow-hidden">
                    <Button onClick={handleSuggestMnemonics} disabled={isMnemonicsLoading || mnemonics.length > 0} className="w-full mt-2">
                      {isMnemonicsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {mnemonics.length > 0 ? 'Mnemonics Suggested' : 'Suggest Mnemonics'}
                    </Button>
                    <ScrollArea className="mt-4 flex-1 pr-2">
                      {isMnemonicsLoading && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>}
                      {mnemonics.length > 0 && <ul className="list-disc list-inside space-y-2">{mnemonics.map((m, i) => <li key={i}>{m}</li>)}</ul>}
                      {!mnemonics.length && !isMnemonicsLoading && <p className="text-sm text-center text-muted-foreground mt-8">Generate mnemonic devices.</p>}
                    </ScrollArea>
                  </TabsContent>

                  {/* Story */}
                  <TabsContent value="story" className="flex-1 flex flex-col overflow-hidden">
                    <Button onClick={handleCreateStory} disabled={isStoryLoading || !!story} className="w-full mt-2">
                      {isStoryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {story ? 'Story Created' : 'Create Story'}
                    </Button>
                    <ScrollArea className="mt-4 flex-1 pr-2">
                      {isStoryLoading && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>}
                      {story && <p className="text-sm leading-relaxed">{story}</p>}
                      {!story && !isStoryLoading && <p className="text-sm text-center text-muted-foreground mt-8">Create a story to link concepts.</p>}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </TabsContent>

            </Tabs>
          </CardContent>
          </Card>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
}
