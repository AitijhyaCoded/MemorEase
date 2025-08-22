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
                    className="w-full h-48 rounded-lg flex items-center justify-center text-center p-4 cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ perspective: '1000px' }}
                >
                    <div className={cn(
                        "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
                        isFlipped && "[transform:rotateY(180deg)]"
                        )}>
                        {/* Front of the card */}
                        <div className="absolute w-full h-full flex items-center justify-center [backface-visibility:hidden]">
                            <p className="text-xl font-semibold">{front}</p>
                        </div>
                        {/* Back of the card */}
                        <div className="absolute w-full h-full flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                            <p>{back}</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">Click card to flip</p>
            </CardContent>
        </>
    );
}
