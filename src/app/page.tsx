
'use client';

import { useState, useTransition, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BrainCircuit, FileText, Sparkles, Bookmark, Text, Palette, Plus, Minus, X, Loader2, Image as ImageIcon, Volume2, Lightbulb, Link2, Save, BookCopy, History, MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateSummaryAction, suggestHighlightsAction, generateVisualsAction, generateAudioAction, suggestMnemonicsAction, createStoryAction, createCheatSheetAction, saveCheatSheetToMemoryAction } from './actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { UserNav } from '@/components/auth/user-nav';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { saveMemory, getMemory, AiGeneratedContent } from '@/lib/firestore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import ChatDialog from '@/components/chat/chat-dialog';
import NotesSection from '@/components/notes/notes-section';


// --- helpers to make any context safe for chat ---
const toStringLoose = (val: unknown): string => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(v => toStringLoose(v)).join('\n');
  if (val && typeof val === 'object') {
    // Some generators return { html: "..."} or rich objects
    // Prefer an html/string field if present
    const anyVal = val as any;
    if (typeof anyVal.html === 'string') return anyVal.html;
    try { return JSON.stringify(val); } catch { return String(val); }
  }
  return String(val ?? '');
};

const htmlToText = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();


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
  const router = useRouter();
  const searchParams = useSearchParams();
  const memoryId = searchParams.get('id');
  const { user } = useAuth();
  const { toast } = useToast();

  const [content, setContent] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [summary, setSummary] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [visualUrl, setVisualUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [mnemonics, setMnemonics] = useState('');
  const [story, setStory] = useState('');
  const [cheatSheet, setCheatSheet] = useState('');
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<{ title: string; content: string } | null>(null);

  const [isLoadingMemory, setIsLoadingMemory] = useState(!!memoryId);
  const [isSummaryLoading, startSummaryTransition] = useTransition();
  const [isHighlightsLoading, startHighlightsTransition] = useTransition();
  const [isVisualsLoading, startVisualsTransition] = useTransition();
  const [isAudioLoading, startAudioTransition] = useTransition();
  const [isMnemonicsLoading, startMnemonicsTransition] = useTransition();
  const [isStoryLoading, startStoryTransition] = useTransition();
  const [isCheatSheetLoading, startCheatSheetTransition] = useTransition();
  
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCheatSheet, startSavingCheatSheetTransition] = useTransition();


  useEffect(() => {
    const loadMemory = async () => {
      if (memoryId && user) {
        setIsLoadingMemory(true);
        try {
          const memory = await getMemory(memoryId);
          if (memory) {
            setContent(memory.content);
            setProcessedContent(memory.content);
            setSaveTitle(memory.title);
            setSummary(memory.summary || '');
            setHighlights(memory.highlights || []);
            setCheatSheet(memory.cheatSheetHtml || '');
            if (memory.aiGenerated) {
                setMnemonics(memory.aiGenerated.mnemonics || '');
                setStory(memory.aiGenerated.story || '');
                setVisualUrl(memory.aiGenerated.visualUrl || '');
            }
            toast({ title: 'Memory Loaded', description: `Loaded "${memory.title}".` });
          } else {
             toast({ variant: 'destructive', title: 'Error', description: "Could not find the requested memory." });
             router.replace('/');
          }
        } catch (error) {
           toast({ variant: 'destructive', title: 'Error', description: "Failed to load memory." });
           console.error(error);
           router.replace('/');
        } finally {
          setIsLoadingMemory(false);
        }
      } else {
        setIsLoadingMemory(false);
      }
    };
    loadMemory();
  }, [memoryId, user, toast, router]);

  const [moreTab, setMoreTab] = useState<'visuals'|'audio'|'mnemonics'|'story'|'cheatsheet'>('visuals');


  const handleReset = () => {
    router.replace('/');
    setContent('');
    setProcessedContent('');
    setSummary('');
    setHighlights([]);
    setBookmarks([]);
    setVisualUrl('');
    setAudioUrl('');
    setMnemonics('');
    setStory('');
    setCheatSheet('');
    setSaveTitle('');
    toast({ title: 'New Session Started', description: 'Your previous work has been cleared.' });
  };
  
  const handleOpenSaveDialog = () => {
    if (!processedContent) {
         toast({ variant: 'destructive', title: 'Nothing to save', description: 'Please process some content first.' });
        return;
    }
    setIsSaveDialogOpen(true);
  }


  const handleSave = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to save a memory.' });
        return;
    }
    if (!saveTitle.trim()) {
        toast({ variant: 'destructive', title: 'Title Required', description: 'Please enter a title for your memory.' });
        return;
    }

    setIsSaving(true);
    try {
        const aiGenerated: AiGeneratedContent = {
            mnemonics,
            story,
            visualUrl
        };

        const memoryData = {
            title: saveTitle,
            content: processedContent,
            summary,
            highlights,
            aiGenerated,
            cheatSheetHtml: cheatSheet,
        };

        const newMemoryId = await saveMemory(memoryData, memoryId || undefined);
        
        toast({ title: 'Memory Saved!', description: `"${saveTitle}" has been saved.`});
        setIsSaveDialogOpen(false);

        if (newMemoryId && !memoryId) {
            router.push(`/?id=${newMemoryId}`);
        }

    } catch (error) {
        console.error("Save error:", error);
        toast({ variant: 'destructive', title: 'Save Error', description: 'Could not save memory. Please try again.' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleOpenChat = (title: string, rawContext: unknown) => {
    // 1) coerce anything to string
    const asString = toStringLoose(rawContext);
    // 2) strip HTML if any
    const plain = htmlToText(asString);
  
    if (!plain || plain.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Not enough content',
        description: 'There is not enough readable content to ask a question about.',
      });
      return;
    }
  
    setChatContext({ title, content: plain });
    setIsChatOpen(true);
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
        // Force to string even if API returns {html: "..."} or array
        const asString = htmlToText(toStringLoose(result.mnemonics));
        setMnemonics(asString);
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

  const handleCreateCheatSheet = () => {
    startCheatSheetTransition(async () => {
        const result = await createCheatSheetAction(processedContent);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Cheat Sheet Creation Error', description: result.error });
        } else {
            setCheatSheet(result.html || '');
        }
    });
  };

  const handleSaveCheatSheet = () => {
    if (!memoryId) {
        toast({ variant: 'destructive', title: 'Save Memory First', description: 'Please save this memory before saving a cheat sheet.' });
        handleOpenSaveDialog();
        return;
    }
     startSavingCheatSheetTransition(async () => {
        const result = await saveCheatSheetToMemoryAction(memoryId, cheatSheet);
        if (result.error) {
             toast({ variant: 'destructive', title: 'Save Error', description: result.error });
        } else {
             toast({ title: 'Cheat Sheet Saved', description: 'Your cheat sheet has been saved to this memory.' });
        }
    });
  }

  const toggleBookmark = (index: number) => {
    setBookmarks(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };
  
  const handleProcessContent = () => {
    if (content.length < 50) {
      toast({
        variant: 'destructive',
        title: 'Content too short',
        description: 'Please provide at least 50 characters of text to process.',
      });
      return;
    }
    setProcessedContent(content);
  }
  
  if (!processedContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 relative">
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b">
             <div className="flex items-center gap-3">
                <BrainCircuit className="h-8 w-8" />
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">MemorEase</h1>
            </div>
            <div className='flex items-center gap-2'>
                <UserNav />
            </div>
        </header>

        <main className='flex flex-col items-center justify-center w-full'>
            <Card className="w-full max-w-3xl shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
              <CardHeader>
                <CardTitle className="text-2xl">Start Memorizing</CardTitle>
                <CardDescription>Paste your text below to begin.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMemory ? (
                   <div className="flex justify-center items-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                  <Textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Paste text or a URL's content here... The more text, the better the AI assistance."
                    className="min-h-[200px] md:min-h-[300px] text-base"
                  />
                )}
                <Button onClick={handleProcessContent} className="mt-4 w-full" size="lg" disabled={content.length < 50 || isLoadingMemory}>
                  {isLoadingMemory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Process Content
                </Button>
              </CardContent>
            </Card>
        </main>
      </div>
    );
  }

  return (
    <>
      <ChatDialog 
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        contextTitle={chatContext?.title || ''}
        contextContent={chatContext?.content || ''}
      />
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{memoryId ? 'Update Memory' : 'Save Memory'}</DialogTitle>
            <DialogDescription>
              Give your memory a title so you can find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {memoryId ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between p-2 md:p-4 border-b shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/logo.svg" alt="MemorEase Logo" className="h-8 w-8" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">MemorEase</h1>
          </div>
          <div className='flex items-center gap-1 md:gap-2'>
              <Button onClick={handleOpenSaveDialog} variant="default" size="sm" disabled={!user}>
                <Save className="mr-0 md:mr-2 h-4 w-4" /><span className='hidden md:inline'>Save</span>
              </Button>
              <Link href="/memory" passHref>
                <Button variant="outline" size="sm"><History className="mr-0 md:mr-2 h-4 w-4" /><span className='hidden md:inline'>My Memory</span></Button>
              </Link>
              <Button onClick={handleReset} variant="outline" size="sm">
                <Plus className="mr-0 md:mr-2 h-4 w-4" /><span className='hidden md:inline'>New Session</span>
              </Button>
              <UserNav />
          </div>
        </header>
        <div className="grid md:grid-cols-3 flex-1 overflow-hidden">
          <main className="md:col-span-2 flex flex-col p-2 md:p-6 overflow-hidden min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <Text className="h-6 w-6 text-primary" />
                  <CardTitle>Your Content</CardTitle>
                </div>
                <div className="flex items-center gap-2 md:gap-4 w-1/3">
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
              <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
                <ScrollArea className="h-full pr-4">
                  <div className="pr-2 pl-4 md:pl-8">
                    <Highlighter
                      text={processedContent}
                      highlights={highlights}
                      bookmarks={bookmarks}
                      fontSize={fontSize}
                      onBookmarkToggle={toggleBookmark}
                    />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </main>
          <aside className="md:col-span-1 p-2 md:p-6 border-l flex flex-col overflow-hidden">
          <ScrollArea className="h-full">
            <Card className="w-full flex-1 flex flex-col mb-4">
              <CardHeader className='p-4 md:p-6'>
                 <CardTitle className="flex items-center gap-3"><Palette className="h-6 w-6 text-primary" />AI Toolkit</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden p-2 pt-0 md:p-6 md:pt-0">
                <Tabs defaultValue="summary" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="highlights">Highlights</TabsTrigger>
                    <TabsTrigger value="more"><Plus className="mr-2 h-4 w-4" />More</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex gap-2 w-full mt-2">
                      <Button onClick={handleSummarize} disabled={isSummaryLoading || !!summary} className="w-full">
                        {isSummaryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {summary ? 'Summary Generated' : 'Generate Summary'}
                      </Button>
                       {summary && (
                        <Button variant="outline" size="icon" onClick={() => handleOpenChat('Summary', summary)}>
                          <MessageCircleQuestion className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <ScrollArea className="mt-4 flex-1 pr-2">
                      {isSummaryLoading && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>}
                      {summary && <p className="text-sm leading-relaxed">{summary}</p>}
                      {!summary && !isSummaryLoading && <p className="text-sm text-center text-muted-foreground mt-8">Click "Generate Summary" to create a concise version of your text.</p>}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="highlights" className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex gap-2 w-full mt-2">
                      <Button onClick={handleHighlight} disabled={isHighlightsLoading || highlights.length > 0} className="w-full">
                        {isHighlightsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         {highlights.length > 0 ? 'Highlights Suggested' : 'Suggest Highlights'}
                      </Button>
                      {highlights.length > 0 && (
                          <Button variant="outline" size="icon" onClick={() => handleOpenChat('Highlights', highlights.join(', '))}>
                              <MessageCircleQuestion className="h-4 w-4" />
                          </Button>
                      )}
                    </div>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full mb-2 justify-between capitalize">
                          {moreTab} <Plus className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[calc(100vw-2.5rem)] md:w-[calc(33.33vw-4.5rem)]">
                        <DropdownMenuItem onClick={() => setMoreTab('visuals')}>Visuals</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMoreTab('audio')}>Audio</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMoreTab('mnemonics')}>Mnemonics</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMoreTab('story')}>Story</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMoreTab('cheatsheet')}>Cheat Sheet</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex-1 flex flex-col overflow-hidden">
                      {moreTab === 'visuals' && (
                        <>
                          <div className="flex gap-2 w-full mt-2">
                            <Button onClick={handleGenerateVisuals} disabled={isVisualsLoading || !!visualUrl} className="w-full">
                              {isVisualsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {visualUrl ? 'Visual Generated' : 'Generate Visual'}
                            </Button>
                            {visualUrl && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenChat('Visual', summary || processedContent)}
                              >
                                <MessageCircleQuestion className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <ScrollArea className="mt-4 flex-1 pr-2">
                            {isVisualsLoading && <Skeleton className="h-48 w-full" />}
                            {visualUrl && <Image src={visualUrl} alt="Visual association" width={512} height={512} className="rounded-lg" />}
                            {!visualUrl && !isVisualsLoading && <p className="text-sm text-center text-muted-foreground mt-8">Generate an image to help you remember.</p>}
                          </ScrollArea>
                        </>
                      )}

                      {moreTab === 'audio' && (
                        <>
                          <div className="flex gap-2 w-full mt-2">
                              <Button onClick={handleGenerateAudio} disabled={isAudioLoading || !!audioUrl} className="w-full">
                              {isAudioLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {audioUrl ? 'Audio Generated' : 'Generate Audio'}
                              </Button>
                              {audioUrl && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleOpenChat('Audio Recitation', summary || processedContent)}
                                >
                                  <MessageCircleQuestion className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                          <div className="mt-4">
                            {isAudioLoading && <Skeleton className="h-12 w-full" />}
                            {audioUrl && <audio controls src={audioUrl} className="w-full" />}
                            {!audioUrl && !isAudioLoading && <p className="text-sm text-center text-muted-foreground mt-8">Generate audio of the summary (or text if no summary).</p>}
                          </div>
                        </>
                      )}

                      {moreTab === 'mnemonics' && (
                        <>
                          <div className="flex gap-2 w-full mt-2">
                              <Button onClick={handleSuggestMnemonics} disabled={isMnemonicsLoading || !!mnemonics} className="w-full">
                              {isMnemonicsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {mnemonics ? 'Mnemonics Suggested' : 'Suggest Mnemonics'}
                              </Button>
                              {mnemonics && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleOpenChat('Mnemonics', mnemonics)}
                                >
                                  <MessageCircleQuestion className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                          <ScrollArea className="mt-4 flex-1 pr-2">
                            {isMnemonicsLoading && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>}
                            {mnemonics && <p className="text-sm leading-relaxed whitespace-pre-wrap">{mnemonics}</p>}
                            {!mnemonics && !isMnemonicsLoading && <p className="text-sm text-center text-muted-foreground mt-8">Generate mnemonic devices.</p>}
                          </ScrollArea>
                        </>
                      )}

                      {moreTab === 'story' && (
                        <>
                          <div className="flex gap-2 w-full mt-2">
                              <Button onClick={handleCreateStory} disabled={isStoryLoading || !!story} className="w-full">
                              {isStoryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {story ? 'Story Created' : 'Create Story'}
                              </Button>
                               {story && (
                                  <Button variant="outline" size="icon" onClick={() => handleOpenChat('Story', story)}>
                                      <MessageCircleQuestion className="h-4 w-4" />
                                  </Button>
                              )}
                          </div>
                          <ScrollArea className="mt-4 flex-1 pr-2">
                            {isStoryLoading && <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>}
                            {story && <p className="text-sm leading-relaxed">{story}</p>}
                            {!story && !isStoryLoading && <p className="text-sm text-center text-muted-foreground mt-8">Create a story to link concepts.</p>}
                          </ScrollArea>
                        </>
                      )}

                      {moreTab === 'cheatsheet' && (
                        <>
                          <div className='flex gap-2 w-full mt-2'>
                            <Button onClick={handleCreateCheatSheet} disabled={isCheatSheetLoading || !!cheatSheet} className="w-full">
                              {isCheatSheetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {cheatSheet ? 'Cheet Sheat Generated' : 'Generate Cheat Sheet'}
                            </Button>
                            {cheatSheet && (
                              <>
                                  <Button variant="outline" size="icon" onClick={() => handleOpenChat('Cheat Sheet', cheatSheet)}>
                                      <MessageCircleQuestion className="h-4 w-4" />
                                  </Button>
                              </>
                            )}
                          </div>
                          <ScrollArea className="mt-4 flex-1 pr-2 border rounded-md">
                            {isCheatSheetLoading && <div className="space-y-2 p-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>}
                            {cheatSheet && <div className="prose prose-sm dark:prose-invert max-w-none p-4" dangerouslySetInnerHTML={{ __html: cheatSheet }} />}
                            {!cheatSheet && !isCheatSheetLoading && <p className="text-sm text-center text-muted-foreground mt-8 p-4">Create a cheat sheet from your content.</p>}
                          </ScrollArea>
                        </>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <NotesSection />
          </ScrollArea>
          </aside>
        </div>
      </div>
    </>
  );
}
