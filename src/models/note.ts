import { ObjectId } from "mongodb";

export interface Note {
    contactId: ObjectId; // ID du contact associé
    title: string;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
}

export function validateNote(note: Partial<Note>): string | null {
    if (!note.title) return 'Le champ "title" est requis.';
    if (!note.contactId) return 'Le champ "contactId" est requis.';
    if (!note.content) return 'Le champ "content" est requis.';
    return null; 
}
