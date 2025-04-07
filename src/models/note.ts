import { Db, ObjectId } from "mongodb";


export interface Note {
    contactId: ObjectId; // ID du contact associé
    title: string;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
}

export async function validateNote(note: Partial<Note>, db: Db): Promise<string | null> {
    if (!note.title) return 'Le champ "title" est requis.';
    if (!note.contactId) return 'Le champ "contactId" est requis.';
    if (!note.content) return 'Le champ "content" est requis.';
    
    
    try {
        const contactId = new ObjectId(note.contactId); // Convertir en ObjectId
        const isValidContact = await validateContact(contactId, db);
        if (!isValidContact) return 'Le contact associé est introuvable.';
    } catch (error) {
        return 'L\'ID du contact est invalide.';
    }
    return null; 
}

async function validateContact(contactId: ObjectId, db: Db): Promise<boolean> {
    try {
        const existingContact = await db.collection('contacts').findOne({ _id: contactId });
        console.log('Contact trouvé:', existingContact);

        if (!existingContact) {
            console.error('Contact non trouvé pour l\'ID:', contactId);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la validation du contact:', error);
        return false;
    }
}


