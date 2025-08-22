'use client';

import { useState } from 'react';
import { CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FlashcardProps {
    front: string;
    back: string;
}

export default function Flashcard({ front, back }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <>
            <CardTitle>Flashcard</CardTitle>
            <CardContent className="mt-4">
                <div
                    className="w-full h-48 border rounded-lg flex items-center justify-center text-center p-4 cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ perspective: '1000px' }}
                >
                    <div className={cn("transition-transform duration-500 w-full h-full flex items-center justify-center", isFlipped && '[transform:rotateY(180deg)]')}>
                        <div className="[backface-visibility:hidden]">
                            <p className="text-xl font-semibold">{front}</p>
                        </div>
                        <div className="absolute [transform:rotateY(180deg)] [backface-visibility:hidden]">
                            <p>{back}</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">Click card to flip</p>
            </CardContent>
        </>
    );
}
