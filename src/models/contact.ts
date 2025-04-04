export interface Contact {
    name: string;
    email: string;
    phone?: string; 
    createdAt: Date; 
}

export function validateContact(contact: Partial<Contact>): string | null {
    if (!contact.name) return 'Le champ "name" est requis.';
    if (!contact.email) return 'Le champ "email" est requis.';
    return null; 
}