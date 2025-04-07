export interface User {
    email: string;
    password: string;
}

export function validateUser(user: Partial<User>): string | null {
    if (!user.email) return 'Le champ "email" est requis.';
    if (!validateEmail(user.email)) return 'Le champ "email" est invalide.';
    if (!user.password) return 'Le champ "password" est requis.';
    
    return null; 
}

export function hashPassword(password: string): string {
    // Utilisez une bibliothèque de hachage comme bcrypt pour hacher le mot de passe
    return password; // Remplacez ceci par le hachage réel
}

function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

