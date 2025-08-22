
'use client'

import { useState, useEffect } from 'react';
import { BrainCircuit, Clock, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getMemoryHistory } from '@/lib/firestore';
import { UserNav } from '@/components/auth/user-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface MemoryItem {
    id: string;
    title: string;
    updatedAt: string;
}

export default function MemoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<MemoryItem[]>([]);
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
            <BrainCircuit className="h-8 w-8 text-primary" />
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
                Here are all your saved memorization sessions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : history.length > 0 ? (
                <ul className="space-y-4">
                    {history.map((item) => (
                    <li key={item.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-muted/50 transition-colors">
                        <div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4" /> Last saved: {item.updatedAt}
                            </p>
                        </div>
                        <Link href={`/?id=${item.id}`} passHref>
                            <Button>Open</Button>
                        </Link>
                    </li>
                    ))}
                </ul>
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
