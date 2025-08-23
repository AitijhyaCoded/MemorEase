
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getNotesAction, addNoteAction, updateNoteAction, deleteNoteAction } from '@/app/actions';
import { Note } from '@/lib/firestore';
import { Loader2, Save, Trash2, Edit, X, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function NotesSection() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState('');

    const [isLoading, startLoadingTransition] = useTransition();
    const [isSaving, startSavingTransition] = useTransition();

    useEffect(() => {
        if (user) {
            startLoadingTransition(async () => {
                const result = await getNotesAction();
                if (result.error) {
                    toast({ variant: 'destructive', title: 'Error fetching notes', description: result.error });
                } else {
                    setNotes(result.notes || []);
                }
            });
        }
    }, [user, toast]);

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        startSavingTransition(async () => {
            const result = await addNoteAction(newNote);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error saving note', description: result.error });
            } else if (result.note) {
                setNotes(prev => [result.note!, ...prev]);
                setNewNote('');
                toast({ title: 'Note saved!' });
            }
        });
    };

    const handleUpdateNote = (noteId: string) => {
        if (!editingContent.trim()) return;
        startSavingTransition(async () => {
            const result = await updateNoteAction(noteId, editingContent);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error updating note', description: result.error });
            } else {
                setNotes(prev => prev.map(n => n.id === noteId ? { ...n, content: editingContent, updatedAt: new Date() } : n));
                setEditingNoteId(null);
                setEditingContent('');
                toast({ title: 'Note updated!' });
            }
        });
    };

    const handleDeleteNote = (noteId: string) => {
        startSavingTransition(async () => {
            const result = await deleteNoteAction(noteId);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error deleting note', description: result.error });
            } else {
                setNotes(prev => prev.filter(n => n.id !== noteId));
                toast({ title: 'Note deleted.' });
            }
        });
    };

    const startEditing = (note: Note) => {
        setEditingNoteId(note.id);
        setEditingContent(note.content);
    };

    const cancelEditing = () => {
        setEditingNoteId(null);
        setEditingContent('');
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>My Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Textarea
                            placeholder="Type your note here..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                        />
                        <Button onClick={handleAddNote} disabled={isSaving || !newNote.trim()} size="sm">
                            {isSaving && !editingNoteId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className='mr-2 h-4 w-4' />}
                            Add Note
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {isLoading && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
                        {!isLoading && notes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">You have no notes yet.</p>}
                        {notes.map(note => (
                            <div key={note.id} className="p-3 border rounded-md bg-secondary/50 text-sm">
                                {editingNoteId === note.id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleUpdateNote(note.id)} size="sm" disabled={isSaving}>
                                                {isSaving && editingNoteId === note.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                                Save
                                            </Button>
                                            <Button onClick={cancelEditing} variant="ghost" size="sm">
                                                <X className="mr-2 h-4 w-4" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <p className="whitespace-pre-wrap flex-1">{note.content}</p>
                                        <div className="flex gap-1 ml-2">
                                            <Button onClick={() => startEditing(note)} variant="ghost" size="icon" className="h-7 w-7">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => handleDeleteNote(note.id)} variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
