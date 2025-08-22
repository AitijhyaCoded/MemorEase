
'use client'

import { useState, useEffect } from 'react';
import { BrainCircuit, Clock, Loader2, FileText, Sparkles, Lightbulb, Link2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getMemoryHistory, Memory } from '@/lib/firestore';
import { UserNav } from '@/components/auth/user-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function MemoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        setLoading(true);
        const userHistory = await getMemoryHistory();
        setHistory(userHistory || []);
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-background p-4">
        <header className="w-full flex items-center justify-between p-4 border-b shrink-0 fixed top-0 left-0 bg-background/80 backdrop-blur-sm z-10">
            <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="MemorEase Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold tracking-tight">MemorEase</h1>
            </Link>
            <div className='flex items-center gap-2'>
                <UserNav />
            </div>
      </header>

      <main className="w-full max-w-4xl mt-24">
        <Card>
            <CardHeader>
                <CardTitle>My Memory</CardTitle>
                <CardDescription>
                Here are all your saved memorization sessions, including AI-generated content.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : history.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {history.map((item) => (
                    <AccordionItem value={item.id} key={item.id}>
                        <AccordionTrigger>
                            <div className='flex flex-col items-start text-left'>
                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <Clock className="h-4 w-4" /> 
                                    Last updated: {item.updatedAt ? formatDistanceToNow(new Date(item.updatedAt.seconds * 1000), { addSuffix: true }) : 'a while ago'}
                                </p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className='space-y-6 p-2'>
                             <div className='space-y-2'>
                                <h4 className='font-semibold text-md'>Original Content</h4>
                                <p className='text-sm text-muted-foreground max-h-24 overflow-y-auto'>{item.content}</p>
                             </div>
                             
                             {item.summary && (
                                <div className='space-y-2'>
                                    <h4 className='font-semibold text-md flex items-center gap-2'><FileText className="h-4 w-4"/>Summary</h4>
                                    <p className='text-sm text-muted-foreground'>{item.summary}</p>
                                </div>
                             )}

                            {item.highlights && item.highlights.length > 0 && (
                                <div className='space-y-2'>
                                    <h4 className='font-semibold text-md flex items-center gap-2'><Sparkles className="h-4 w-4"/>Highlights</h4>
                                    <div className='flex flex-wrap gap-2'>
                                        {item.highlights.map((h, i) => <Badge key={i} variant="secondary">{h}</Badge>)}
                                    </div>
                                </div>
                            )}

                            {item.aiGenerated && (
                                <>
                                {item.aiGenerated.mnemonics && item.aiGenerated.mnemonics.length > 0 && (
                                    <div className='space-y-2'>
                                        <h4 className='font-semibold text-md flex items-center gap-2'><Lightbulb className="h-4 w-4"/>Mnemonics</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                            {item.aiGenerated.mnemonics.map((m, i) => <li key={i}>{m}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {item.aiGenerated.story && (
                                    <div className='space-y-2'>
                                        <h4 className='font-semibold text-md flex items-center gap-2'><Link2 className="h-4 w-4"/>Story</h4>
                                        <p className='text-sm text-muted-foreground'>{item.aiGenerated.story}</p>
                                    </div>
                                )}
                                {item.aiGenerated.visualUrl && (
                                     <div className='space-y-2'>
                                        <h4 className='font-semibold text-md'>Visual Association</h4>
                                        <Image src={item.aiGenerated.visualUrl} alt="Visual association" width={256} height={256} className="rounded-lg border" />
                                    </div>
                                )}
                                </>
                            )}
                            <Link href={`/?id=${item.id}`} passHref>
                                <Button className='mt-4'>Open in Editor</Button>
                            </Link>
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">You don't have any saved memories yet.</p>
                    <Link href="/" passHref>
                        <Button className="mt-4">Start a new session</Button>
                    </Link>
                </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
