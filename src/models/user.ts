const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 12;

export interface User {
    _id: string;
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
    const salt = genSalt();
    try {
        // Utilisation de la méthode synchrone hashSync
        const hashedPassword = bcrypt.hashSync(password, salt);
        console.log("mdp haché : " + hashedPassword);
        return hashedPassword;
    } catch (err) {
        console.error('Erreur lors du hachage du mot de passe:', err);
        throw err; // Mieux vaut signaler l'erreur que de retourner le mot de passe en clair
    }
}

export function comparePassword(password: string, hashedPassword: string): boolean {

    console.log("password : " + password);
    console.log("hashedPassword : " + hashedPassword);
    
    
    try {
        const isMatch = bcrypt.compareSync(password, hashedPassword);
        return isMatch;
    } catch (err) {
        console.error('Erreur lors de la comparaison des mots de passe:', err);
        throw err; 
    }
}

function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function genSalt() {
    return bcrypt.genSaltSync(saltRounds);
}

export function GenerateJWT(user: User) {
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
        expiresIn: '1h',
    });

    return token;
}